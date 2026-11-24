using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Ewallet.Application.DTOs;
using Ewallet.Application.Services.Interfaces;
using Ewallet.Infrastructure.Persistence;

namespace Ewallet.Infrastructure.Identity;

public sealed class RefreshTokenService(AppDbContext db, UserManager<AppUser> userManager, IJwtTokenService jwtTokenService) : IRefreshTokenService
{
  private static readonly TimeSpan RefreshLifetime = TimeSpan.FromDays(7);

  public async Task<RefreshTokenSessionResult> CreateSessionAsync(AuthUserResponse user, CancellationToken ct = default)
  {
    var now = DateTimeOffset.UtcNow;
    var rawToken = GenerateToken();
    var expiredAt = now.Add(RefreshLifetime);

    var accessToken = jwtTokenService.IssueAccessToken(user);
    var tokenEntity = CreateTokenEntity(user.Id, Guid.NewGuid(), HashToken(rawToken), now, expiredAt);

    db.RefreshToken.Add(tokenEntity);
    await db.SaveChangesAsync(ct);
    return new RefreshTokenSessionResult(user, accessToken, rawToken, expiredAt);
  }

  public async Task RevokeFamilyAsync(string rawRefreshToken, CancellationToken ct = default)
  {
    var hash = HashToken(rawRefreshToken);
    var token = await db.RefreshToken
        .AsNoTracking()
        .SingleOrDefaultAsync(t => t.TokenHash == hash, ct);

    if (token is not null)
    {
      await RevokeFamilyByIdAsync(token.FamilyId, ct);
    }
  }

  private Task RevokeFamilyByIdAsync(Guid familyId, CancellationToken ct)
  {
    var now = DateTimeOffset.UtcNow;
    return db.RefreshToken
        .Where(t => t.FamilyId == familyId && t.RevokedAtUtc == null)
        .ExecuteUpdateAsync(s => s.SetProperty(t => t.RevokedAtUtc, (DateTimeOffset?)now), ct);
  }

  public async Task<RefreshTokenSessionResult> RotateAsync(string rawRefreshToken, CancellationToken ct = default)
  {
    var hash = HashToken(rawRefreshToken);
    var now = DateTimeOffset.UtcNow;

    var currentToken = await db.RefreshToken
        .AsNoTracking()
        .SingleOrDefaultAsync(t => t.TokenHash == hash, ct);
    if (currentToken is null) return null!;
    if (currentToken.UsedAtUtc is not null)
    {
      await RevokeFamilyByIdAsync(currentToken.FamilyId, ct);
      return null!;
    }

    if (currentToken.RevokedAtUtc is not null || currentToken.ExpiresAtUtc <= now)
    {
      return null!;
    }

    var identityUser = await userManager.FindByIdAsync(currentToken.UserId.ToString("D"));
    if (identityUser is null || string.IsNullOrWhiteSpace(identityUser.Email))
    {
      return null!;
    }

    var roles = await userManager.GetRolesAsync(identityUser);
    var user = new AuthUserResponse(identityUser.Id, identityUser.Email, identityUser.FullName, roles.ToArray());
    var nextRawToken = GenerateToken();
    var nextExpiresAt = now.Add(RefreshLifetime);
    var nextAccessToken = jwtTokenService.IssueAccessToken(user);

    await using var transaction = await db.Database.BeginTransactionAsync(ct);

    var affectedRows = await db.RefreshToken
        .Where(t =>
            t.Id == currentToken.Id &&
            t.UsedAtUtc == null &&
            t.RevokedAtUtc == null &&
            t.ExpiresAtUtc > now)
        .ExecuteUpdateAsync(s => s.SetProperty(t => t.UsedAtUtc, (DateTimeOffset?)now), ct);

    if (affectedRows != 1)
    {
      await transaction.RollbackAsync(ct);
      return null!;
    }

    var newTokenEntity = CreateTokenEntity(
        currentToken.UserId,
        currentToken.FamilyId,
        HashToken(nextRawToken),
        now,
        nextExpiresAt);

    db.RefreshToken.Add(newTokenEntity);
    await db.SaveChangesAsync(ct);
    await transaction.CommitAsync(ct);

    return new RefreshTokenSessionResult(user, nextAccessToken, nextRawToken, nextExpiresAt);
  }

  private static RefreshToken CreateTokenEntity(
      long userId,
      Guid familyId,
      string tokenHash,
      DateTimeOffset now,
      DateTimeOffset expiredAt
  ) => new()
  {
    Id = Guid.NewGuid(),
    UserId = userId,
    FamilyId = familyId,
    TokenHash = tokenHash,
    CreatedAtUtc = now,
    ExpiresAtUtc = expiredAt
  };
  private static string GenerateToken() =>
      Convert.ToHexString(RandomNumberGenerator.GetBytes(32));

  private static string HashToken(string rawToken) =>
      Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(rawToken)));
}