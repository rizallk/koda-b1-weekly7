using System.ComponentModel.DataAnnotations;
using Ewallet.Domain.Entities;

namespace Ewallet.Application.DTOs;

public sealed record TransactionRequest(
  [Required]
  int SenderWalletId,

  [Required]
  int ReceiverWalletId,

  [Required]
  [StringLength(30)]
  string Type,

  [Required]
  [Range(typeof(decimal), "10000", "100000000.99", ParseLimitsInInvariantCulture = true, ConvertValueInInvariantCulture = true)]
  decimal Amount,

  [StringLength(100)]
  string Description,

  [DataType(DataType.Date)]
  DateTime CreatedAt
);

public sealed record TransferRequest(
  long SenderWalletId,
  long ReceiverWalletId,

  [Required]
  [Range(typeof(decimal), "10000", "100000000.99", ParseLimitsInInvariantCulture = true, ConvertValueInInvariantCulture = true)]
  decimal Amount,

  string? Description
);

public sealed record TransactionResponse(
  long? Id,
  string ReferenceNo,
  long? SenderWalletId,
  long ReceiverWalletId,
  string Type,
  decimal Amount,
  string Status,
  string? Description,
  DateTime CreatedAtUtc,
  DateTime? CompletedAtUtc
)
{
  public static TransactionResponse FromModel(Transaction trx) => new(trx.Id, trx.ReferenceNo, trx.SenderWalletId, trx.ReceiverWalletId, trx.Type, trx.Amount, trx.Status, trx.Description, trx.CreatedAtUtc, trx.CompletedAtUtc);
}

public sealed record TransactionSummary
(
  string Type,
  decimal TotalAmount
);

public sealed record TransactionFilterRequest(
  string? Search = null,
  string? Type = null,
  string? Status = null,
  DateTime? StartDateUtc = null,
  DateTime? EndDateUtc = null,
  string? SortBy = "createdAtUtc",
  string? OrderBy = "desc",
  int Page = 1,
  int PageSize = 10
);