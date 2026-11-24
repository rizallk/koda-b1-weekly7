using Ewallet.Domain.Entities;

namespace Ewallet.Infrastructure.Identity;

public sealed class RefreshToken
{
  public Guid Id { get; set; }
  public long UserId { get; set; }
  public AppUser User { get; set; } = null!;
  public Guid FamilyId { get; set; }
  public string TokenHash { get; set; } = string.Empty;
  public DateTimeOffset CreatedAtUtc { get; set; }
  public DateTimeOffset ExpiresAtUtc { get; set; }

  public DateTimeOffset? UsedAtUtc { get; set; }
  public DateTimeOffset? RevokedAtUtc { get; set; }
}