using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Ewallet.Application.DTOs;
using Ewallet.Application.Repositories;
using Ewallet.Application.Services.Interfaces;
using Ewallet.Domain.Entities;
using Ewallet.Infrastructure.Persistence;

namespace Ewallet.Infrastructure.Identity;

public sealed class UserService(
  UserManager<AppUser> userManager,
  AppDbContext db,
  IWalletRepository walletRepository,
  ITransactionRepository transactionRepository,
  IWalletMutationRepository walletMutationRepository) : IUserService
{
  private readonly UserManager<AppUser> _userManager = userManager;
  private readonly AppDbContext _db = db;
  private readonly IWalletRepository _walletRepository = walletRepository;
  private readonly ITransactionRepository _transactionRepository = transactionRepository;
  private readonly IWalletMutationRepository _walletMutationRepository = walletMutationRepository;

  public async Task<(bool Succeeded, UserResponse? User, IReadOnlyList<string> Errors)> UpdateUserAsync(
    long userId,
    UserUpdateRequest request,
    CancellationToken cancellationToken = default)
  {
    var user = await _userManager.FindByIdAsync(userId.ToString("D"));
    if (user is null)
      return (false, null, ["User tidak ditemukan."]);

    var trimmedPhone = request.PhoneNumber.Trim();
    var phoneExists = await _userManager.Users
      .AsNoTracking()
      .AnyAsync(u => u.PhoneNumber == trimmedPhone && u.Id != userId, cancellationToken);

    if (phoneExists)
      return (false, null, ["Nomor HP sudah digunakan oleh pengguna lain."]);

    user.UpdateDetail(
      request.UserName.Trim(),
      request.FullName.Trim(),
      request.Email.Trim(),
      trimmedPhone,
      user.Status
    );

    var result = await _userManager.UpdateAsync(user);
    if (!result.Succeeded)
    {
      return (false, null, result.Errors.Select(e => e.Description).ToArray());
    }

    var updated = await GetUserResponseInternalAsync(userId, cancellationToken);
    return (true, updated, []);
  }

  public async Task<PagedResponse<TransactionResponse>?> GetMyTransactionsAsync(
    long userId,
    TransactionFilterRequest filter,
    CancellationToken cancellationToken = default)
  {
    if (userId <= 0) return null;

    var wallet = await _walletRepository.GetWalletResponseByUserIdAsync(userId, cancellationToken);
    if (wallet is null) return null;

    var (items, totalCount) = await _transactionRepository.GetTransactionHistoryAsync(
      wallet.Id,
      filter,
      cancellationToken);

    var page = filter.Page < 1 ? 1 : filter.Page;
    var pageSize = filter.PageSize is < 1 or > 100 ? 10 : filter.PageSize;

    return new PagedResponse<TransactionResponse>(items, page, pageSize, totalCount);
  }

  public async Task<PagedResponse<WalletMutationResponse>?> GetMyMutationsAsync(
    long userId,
    WalletMutationFilterRequest filter,
    CancellationToken cancellationToken = default)
  {
    if (userId <= 0) return null;

    var wallet = await _walletRepository.GetWalletResponseByUserIdAsync(userId, cancellationToken);
    if (wallet is null) return null;

    var (items, totalCount) = await _walletMutationRepository.GetWalletMutationsAsync(
      wallet.Id,
      filter,
      cancellationToken);

    var page = filter.Page < 1 ? 1 : filter.Page;
    var pageSize = filter.PageSize is < 1 or > 100 ? 10 : filter.PageSize;

    return new PagedResponse<WalletMutationResponse>(items, page, pageSize, totalCount);
  }

  public async Task<PagedResponse<UserResponse>> GetAllUsersAsync(
    UserFilterRequest filter,
    CancellationToken cancellationToken = default)
  {
    var page = filter.Page < 1 ? 1 : filter.Page;
    var pageSize = filter.PageSize is < 1 or > 100 ? 10 : filter.PageSize;

    var query = _userManager.Users
      .AsNoTracking()
      .Include(u => u.Wallet)
      .AsQueryable();

    if (!string.IsNullOrWhiteSpace(filter.Search))
    {
      var keyword = filter.Search.Trim().ToLower();
      query = query.Where(u =>
        u.FullName.ToLower().Contains(keyword) ||
        (u.UserName != null && u.UserName.ToLower().Contains(keyword)) ||
        (u.Email != null && u.Email.ToLower().Contains(keyword)) ||
        (u.PhoneNumber != null && u.PhoneNumber.Contains(keyword)));
    }

    if (!string.IsNullOrWhiteSpace(filter.Status))
    {
      var status = filter.Status.Trim().ToUpper();
      query = query.Where(u => u.Status == status);
    }

    if (!string.IsNullOrWhiteSpace(filter.Role))
    {
      var normalizedRole = filter.Role.Trim().ToUpper();
      query = query.Where(u =>
        _db.UserRoles.Any(ur =>
          ur.UserId == u.Id &&
          _db.Roles.Any(r => r.Id == ur.RoleId && r.NormalizedName == normalizedRole)));
    }

    var totalCount = await query.CountAsync(cancellationToken);

    var users = await query
      .OrderByDescending(u => u.CreatedAtUtc)
      .Skip((page - 1) * pageSize)
      .Take(pageSize)
      .ToListAsync(cancellationToken);

    var userIds = users.Select(u => u.Id).ToList();

    var rolesMap = await (
      from ur in _db.UserRoles.AsNoTracking()
      join r in _db.Roles.AsNoTracking() on ur.RoleId equals r.Id
      where userIds.Contains(ur.UserId)
      select new { ur.UserId, RoleName = r.Name! }
    ).ToListAsync(cancellationToken);

    var items = users.Select(u =>
    {
      var roles = rolesMap
        .Where(x => x.UserId == u.Id)
        .Select(x => x.RoleName)
        .ToArray();

      return MapToUserResponse(u, roles);
    }).ToArray();

    return new PagedResponse<UserResponse>(items, page, pageSize, totalCount);
  }

  public async Task<UserResponse?> GetUserByIdAsync(long userId, CancellationToken cancellationToken = default)
  {
    if (userId <= 0) return null;
    return await GetUserResponseInternalAsync(userId, cancellationToken);
  }

  public async Task<(bool Succeeded, UserResponse? User, string? Error)> UpdateUserStatusAsync(
    long adminUserId,
    long targetUserId,
    UpdateUserStatusRequest request,
    string? correlationId,
    CancellationToken cancellationToken = default)
  {
    if (adminUserId == targetUserId)
      return (false, null, "Admin tidak dapat mengubah status akunnya sendiri.");

    var targetUser = await _userManager.FindByIdAsync(targetUserId.ToString("D"));
    if (targetUser is null)
      return (false, null, "User tidak ditemukan.");

    var newStatus = request.Status.Trim().ToUpper();
    if (targetUser.Status == newStatus)
      return (false, null, $"Status user sudah {newStatus}.");

    var oldStatus = targetUser.Status;

    await using var transaction = await _db.Database.BeginTransactionAsync(cancellationToken);
    try
    {
      targetUser.UpdateDetail(
        targetUser.UserName!,
        targetUser.FullName,
        targetUser.Email!,
        targetUser.PhoneNumber!,
        newStatus
      );

      var updateResult = await _userManager.UpdateAsync(targetUser);
      if (!updateResult.Succeeded)
      {
        await transaction.RollbackAsync(cancellationToken);
        return (false, null, string.Join(" ", updateResult.Errors.Select(e => e.Description)));
      }

      var auditLog = new AuditLog(
        actorUserId: adminUserId,
        transactionId: null,
        action: "USER_STATUS_UPDATED",
        entityType: "AspNetUsers",
        entityId: targetUser.Id.ToString(),
        outcome: "SUCCESS",
        description: $"Status user diubah dari {oldStatus} menjadi {newStatus}. Alasan: {request.Reason ?? "-"}",
        correlationId: correlationId
      );

      _db.AuditLogs.Add(auditLog);
      await _db.SaveChangesAsync(cancellationToken);
      await transaction.CommitAsync(cancellationToken);

      var updated = await GetUserResponseInternalAsync(targetUserId, cancellationToken);
      return (true, updated, null);
    }
    catch
    {
      await transaction.RollbackAsync(cancellationToken);
      throw;
    }
  }

  public async Task<UserSummary?> GetUserSummaryAsync(CancellationToken cancellationToken)
  {
    var statusCounts = await _userManager.Users
      .AsNoTracking()
      .GroupBy(u => u.Status)
      .Select(g => new
      {
        Status = g.Key,
        Count = g.LongCount()
      })
      .ToListAsync(cancellationToken);

    var totalUsers = statusCounts.Sum(x => x.Count);
    var totalUsersActive = statusCounts
      .FirstOrDefault(x => string.Equals(x.Status, "ACTIVE", StringComparison.OrdinalIgnoreCase))?.Count ?? 0L;
    var totalUsersSuspended = statusCounts
      .FirstOrDefault(x => string.Equals(x.Status, "SUSPENDED", StringComparison.OrdinalIgnoreCase))?.Count ?? 0L;

    return new UserSummary(
      TotalUsers: totalUsers,
      TotalUsersActive: totalUsersActive,
      TotalUsersSuspended: totalUsersSuspended
    );
  }

  private async Task<UserResponse?> GetUserResponseInternalAsync(long userId, CancellationToken cancellationToken)
  {
    var user = await _userManager.Users
      .AsNoTracking()
      .Include(u => u.Wallet)
      .FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);

    if (user is null) return null;

    var roles = await _userManager.GetRolesAsync(user);
    return MapToUserResponse(user, roles.ToArray());
  }

  private static UserResponse MapToUserResponse(AppUser user, IReadOnlyList<string> roles)
  {
    UserWalletSummary? walletSummary = user.Wallet is null
      ? null
      : new UserWalletSummary(
          user.Wallet.Id,
          user.Wallet.WalletNumber,
          user.Wallet.Balance,
          user.Wallet.Status
        );

    return new UserResponse(
      user.Id,
      user.UserName,
      user.FullName,
      user.Email,
      user.PhoneNumber,
      user.Status,
      roles,
      walletSummary,
      user.CreatedAtUtc,
      user.UpdatedAtUtc
    );
  }
}