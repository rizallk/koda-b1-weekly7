using System.ComponentModel.DataAnnotations;

namespace Ewallet.Application.DTOs;

public sealed record UserResponse(
  long Id,
  string? UserName,
  string FullName,
  string? Email,
  string? PhoneNumber,
  string Status,
  IReadOnlyList<string> Roles,
  UserWalletSummary? Wallet,
  DateTime CreatedAtUtc,
  DateTime? UpdatedAtUtc
);

public sealed record UserWalletSummary(
  long WalletId,
  string WalletNumber,
  decimal Balance,
  string Status
);

public sealed record UserUpdateRequest(
  [Required, StringLength(50, MinimumLength = 3)]
  string UserName,

  [Required, StringLength(100)]
  string FullName,

  [Required, StringLength(150), EmailAddress]
  string Email,

  [Required, StringLength(20), Phone]
  string PhoneNumber
);

public sealed record UpdateUserStatusRequest(
  [Required, RegularExpression("^(ACTIVE|SUSPENDED)$", ErrorMessage = "Status harus ACTIVE atau SUSPENDED.")]
  string Status,

  [StringLength(250)]
  string? Reason
);

public sealed record UserFilterRequest(
  string? Search,
  string? Status,
  string? Role,
  int Page = 1,
  int PageSize = 10
);

public record UserTransaction(
  long TransactionId,
  DateTime CreatedAt,
  string Type,
  decimal Amount,
  string? Description
);

public record UserWallet(
  long UserId,
  string UserName,
  string FullName,
  string Email,
  string PhoneNumber,
  string Status,
  long WalletId,
  string WalletNumber,
  decimal Balance
);