namespace Ewallet.Application.DTOs;

public sealed record WalletMutationResponse(
  long Id,
  long TransactionId,
  string ReferenceNo,
  string Type,
  string Direction,
  decimal Amount,
  decimal BalanceBefore,
  decimal BalanceAfter,
  string? Description,
  DateTime CreatedAtUtc
);

public sealed record WalletMutationFilterRequest(
  string? Search = null,
  string? Type = null,
  string? Direction = null,
  DateTime? StartDateUtc = null,
  DateTime? EndDateUtc = null,
  string? SortBy = "createdAtUtc",
  string? OrderBy = "desc",
  int Page = 1,
  int PageSize = 10
);