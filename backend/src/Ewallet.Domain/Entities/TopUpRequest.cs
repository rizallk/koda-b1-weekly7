namespace Ewallet.Domain.Entities;

public sealed class TopUpRequest
{
  public long Id { get; private set; }

  public long TransactionId { get; private set; }
  public Transaction Transaction { get; private set; } = null!;

  public long WalletId { get; private set; }
  public Wallet Wallet { get; private set; } = null!;

  public int PaymentMethodId { get; private set; }
  public PaymentMethod PaymentMethod { get; private set; } = null!;

  public decimal Amount { get; private set; }
  public string Status { get; private set; } = null!;
  public string? ProviderReference { get; private set; }
  public DateTime CreatedAtUtc { get; private set; }
  public DateTime? ExpiresAtUtc { get; private set; }
  public DateTime? PaidAtUtc { get; private set; }

  private TopUpRequest() { }

  public TopUpRequest(long transactionId, long walletId, int paymentMethodId, decimal amount, string status, string? providerReference, DateTime? expiresAtUtc, DateTime? paidAtUtc)
  {
    if (transactionId <= 0)
    {
      throw new ArgumentOutOfRangeException(nameof(transactionId), "Transaction id tidak boleh 0 atau negatif");
    }
    if (walletId <= 0)
    {
      throw new ArgumentOutOfRangeException(nameof(walletId), "Wallet id tidak boleh 0 atau negatif");
    }
    if (paymentMethodId <= 0)
    {
      throw new ArgumentOutOfRangeException(nameof(PaymentMethodId), "Payment method id tidak boleh 0 atau negatif");
    }
    if (amount <= 0)
    {
      throw new ArgumentOutOfRangeException(nameof(amount), "Amount harus lebih dari 0");
    }
    if (string.IsNullOrWhiteSpace(status))
    {
      throw new ArgumentException("Status wajib diisi", nameof(status));
    }

    TransactionId = transactionId;
    WalletId = walletId;
    PaymentMethodId = paymentMethodId;
    Amount = amount;
    Status = status;
    ProviderReference = providerReference;
    ExpiresAtUtc = expiresAtUtc;
    PaidAtUtc = paidAtUtc;
  }

  public void MarkAsPaid()
  {
    Status = "PAID";
    PaidAtUtc = DateTime.UtcNow;
  }

  public void MarkAsFailed()
  {
    if (Status != "PENDING")
      throw new InvalidOperationException($"Tidak dapat mengubah status dari {Status} menjadi FAILED.");

    Status = "FAILED";
  }

  public void MarkAsExpired()
  {
    if (Status != "PENDING")
      throw new InvalidOperationException($"Tidak dapat mengubah status dari {Status} menjadi EXPIRED.");

    Status = "EXPIRED";
  }
}