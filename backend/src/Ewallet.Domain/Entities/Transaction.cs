namespace Ewallet.Domain.Entities;

public sealed class Transaction
{
  public long Id { get; private set; }
  public string ReferenceNo { get; private set; } = null!;

  public long? SenderWalletId { get; private set; }
  public Wallet? SenderWallet { get; private set; }

  public long ReceiverWalletId { get; private set; }
  public Wallet ReceiverWallet { get; private set; } = null!;

  public string Type { get; private set; } = null!;
  public decimal Amount { get; private set; }
  public string Status { get; private set; } = null!;
  public string? Description { get; private set; }
  public DateTime CreatedAtUtc { get; private set; }
  public DateTime? CompletedAtUtc { get; private set; }

  public TopUpRequest? TopUpRequest { get; private set; }
  public ICollection<WalletMutation>? WalletMutation { get; private set; } = [];
  public ICollection<AuditLog> AuditLogs { get; private set; } = [];

  private Transaction() { }

  public Transaction(string referenceNo, long? senderWalletId, long receiverWalletId, string type, decimal amount, string status, string? description, DateTime? completedAtUtc)
  {
    if (string.IsNullOrWhiteSpace(referenceNo))
    {
      throw new ArgumentException("Reference no wajib diisi", nameof(referenceNo));
    }
    if (senderWalletId <= 0)
    {
      throw new ArgumentOutOfRangeException(nameof(senderWalletId), "Sender Wallet Id tidak boleh 0 atau negatif");
    }
    if (receiverWalletId <= 0)
    {
      throw new ArgumentOutOfRangeException(nameof(receiverWalletId), "Receiver Wallet Id tidak boleh 0 atau negatif");
    }
    if (string.IsNullOrWhiteSpace(type))
    {
      throw new ArgumentException("Type wajib diisi", nameof(type));
    }
    if (amount <= 0)
    {
      throw new ArgumentOutOfRangeException(nameof(amount), "Balance harus lebih dari 0");
    }

    ReferenceNo = referenceNo;
    SenderWalletId = senderWalletId;
    ReceiverWalletId = receiverWalletId;
    Type = type;
    Amount = amount;
    Status = status;
    Description = description;
    CompletedAtUtc = completedAtUtc;
  }

  public void MarkAsSuccess()
  {
    Status = "SUCCESS";
    CompletedAtUtc = DateTime.UtcNow;
  }

  public void MarkAsFailed()
  {
    if (Status != "PENDING")
      throw new InvalidOperationException($"Tidak dapat mengubah status transaksi dari {Status} menjadi FAILED.");

    Status = "FAILED";
    CompletedAtUtc = DateTime.UtcNow;
  }
}