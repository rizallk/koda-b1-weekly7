using System.ComponentModel.DataAnnotations;
using Ewallet.Domain.Entities;

namespace Ewallet.Application.DTOs;

public sealed record TopUpRequestDto(
  long PaymentMethodId,

  [Required]
  [Range(typeof(decimal), "10000", "100000000.99", ParseLimitsInInvariantCulture = true, ConvertValueInInvariantCulture = true)]
  decimal Amount
);

public sealed record TopUpResponse(
  long WalletId,
  long TopUpRequestId,
  long TransactionId,
  string ReferenceNo,
  string PaymentMethodCode,
  string PaymentMethodName,
  string? ProviderReference,
  decimal Amount,
  string Status,
  DateTime CreatedAtUtc,
  DateTime? ExpiresAtUtc
)
{
  public static TopUpResponse FromModel(
    TopUpRequest topUpRequest,
    Transaction transaction,
    PaymentMethod paymentMethod)
  {
    return new TopUpResponse(
      WalletId: topUpRequest.WalletId,
      TopUpRequestId: topUpRequest.Id,
      TransactionId: transaction.Id,
      ReferenceNo: transaction.ReferenceNo,
      PaymentMethodCode: paymentMethod.Code,
      PaymentMethodName: paymentMethod.Name,
      ProviderReference: topUpRequest.ProviderReference,
      Amount: topUpRequest.Amount,
      Status: topUpRequest.Status,
      CreatedAtUtc: topUpRequest.CreatedAtUtc,
      ExpiresAtUtc: topUpRequest.ExpiresAtUtc
    );
  }
}