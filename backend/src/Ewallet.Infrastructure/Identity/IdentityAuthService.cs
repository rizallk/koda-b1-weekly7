using Microsoft.AspNetCore.Identity;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Ewallet.Application.DTOs;
using Ewallet.Application.Services.Interfaces;
using Ewallet.Application.Security;
using Ewallet.Infrastructure.Persistence;
using Ewallet.Infrastructure.Repositories;
using Ewallet.Application.Repositories;
using Ewallet.Domain.Entities;

namespace Ewallet.Infrastructure.Identity;

public sealed class IdentityAuthService(IWalletRepository walletRepository, UserManager<AppUser> user, AppDbContext db) : IAuthService
{
  private readonly IWalletRepository _walletRepository = walletRepository;
  private readonly UserManager<AppUser> _user = user;
  private readonly AppDbContext _db = db;

  public async Task<LoginResults> LoginAsync(LoginRequest request, CancellationToken ct = default)
  {
    ct.ThrowIfCancellationRequested();
    var email = request.Email.Trim();
    var user = await _user.FindByEmailAsync(email);

    if (user is null)
    {
      return new LoginResults(false, null);
    }

    if (user.Status == "SUSPENDED")
    {
      return new LoginResults(false, null);
    }

    var passwordValid = await _user.CheckPasswordAsync(user, request.Password);

    if (!passwordValid)
    {
      return new LoginResults(false, null);
    }

    var roles = await _user.GetRolesAsync(user);
    var response = new AuthUserResponse(
        user.Id, user.Email!, user.FullName, roles.ToArray()
    );
    return new LoginResults(true, response);
  }

  public async Task<RegisterResult> RegisterAsync(RegisterRequest req, CancellationToken ct = default)
  {
    ct.ThrowIfCancellationRequested();

    if (req.Password != req.PasswordConfirm)
    {
      throw new InvalidOperationException("Password dan konfirmasi password tidak sama");
    }

    var email = req.Email.Trim();
    var existingUser = await _user.FindByEmailAsync(email);

    if (existingUser is not null)
    {
      return new RegisterResult(RegisterStatus.DuplicateEmail, null, ["Email sudah terdaftar"]);
    }

    string generatedWalletNumber = "W001";
    string? lastWalletNumber = await _walletRepository.GetLastWalletNumberAsync(ct);

    if (!string.IsNullOrWhiteSpace(lastWalletNumber) && lastWalletNumber.StartsWith('W'))
    {
      string numberPart = lastWalletNumber.Substring(1);

      if (int.TryParse(numberPart, out int lastNumber))
      {
        int newNumber = lastNumber + 1;
        generatedWalletNumber = $"W{newNumber:D3}";
      }
    }

    var user = new AppUser(req.Username, req.FullName, req.Email, req.PhoneNumber, "ACTIVE", null);

    user.AssignWallet(generatedWalletNumber);

    await using var transaction =
          await _db.Database.BeginTransactionAsync(ct);

    try
    {
      var createResult = await _user.CreateAsync(
                user,
                req.Password);

      if (!createResult.Succeeded)
      {
        await transaction.RollbackAsync(ct);

        var errors = createResult.Errors.ToArray();

        var duplicate = errors.Any(error =>
            error.Code is "DuplicateEmail" or "DuplicateUserName");

        if (duplicate)
        {
          return new RegisterResult(
              RegisterStatus.DuplicateEmail,
              null,
              ["Email sudah terdaftar."]);
        }

        return new RegisterResult(
            RegisterStatus.ValidationError,
            null,
            errors.Select(error => error.Description).ToArray());
      }

      var roleResult = await _user.AddToRoleAsync(
          user,
          AppRoles.Customer);

      if (!roleResult.Succeeded)
      {
        var errors = string.Join(
            "; ",
            roleResult.Errors.Select(error => error.Description));

        throw new InvalidOperationException(
            $"Gagal memberikan role CUSTOMER: {errors}");
      }

      await transaction.CommitAsync(ct);
    }
    catch (DbUpdateException e)
        when (e.InnerException is SqlException sqlError
        && sqlError.Number is 2601 or 2627)
    {
      return new RegisterResult(RegisterStatus.DuplicateEmail, null, [
          "Email sudah terdaftar"
      ]);
    }

    var roles = await _user.GetRolesAsync(user);
    var response = new AuthUserResponse(
        user.Id,
        user.Email!,
        user.FullName,
        roles.ToArray()
    );

    return new RegisterResult(RegisterStatus.Created, response, []);
  }
}