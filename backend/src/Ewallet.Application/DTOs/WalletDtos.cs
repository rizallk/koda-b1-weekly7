using System.ComponentModel.DataAnnotations;
using Ewallet.Domain.Entities;

namespace Ewallet.Application.DTOs;

public record WalletRequest(
  [Required]
  long UserId,

  [Required]
  [StringLength(20)]
  string WalletNumber,

  [Required]
  [Range(typeof(decimal), "0", "99999999999.99", ParseLimitsInInvariantCulture = true, ConvertValueInInvariantCulture = true)]
  decimal Balance
);

public sealed record WalletResponse(
  long Id,
  long UserId,
  string ReferenceNo,
  string WalletNumber,
  decimal Balance,
  string WalletStatus,
  string UserStatus,
  DateTime CreatedAtUtc,
  DateTime? UpdatedAtUtc
)
{
  public static WalletResponse FromModel(Wallet wallet, string referenceNo, string userStatus) => new(
    wallet.Id,
    wallet.UserId,
    referenceNo,
    wallet.WalletNumber,
    wallet.Balance,
    wallet.Status,
    userStatus,
    wallet.CreatedAtUtc,
    wallet.UpdatedAtUtc
  );
}

public sealed record RecipientWalletResponse(
  long WalletId,
  string WalletNumber,
  string FullName,
  string? UserName,
  string WalletStatus,
  string UserStatus
);