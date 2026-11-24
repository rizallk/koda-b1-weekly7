namespace Ewallet.Domain.Entities;

public sealed class Wallet
{
  public long Id { get; private set; }
  public long UserId { get; private set; }
  // public AppUser User { get; private set; } = null!;
  public string WalletNumber { get; private set; } = null!;
  public decimal Balance { get; private set; }
  public string Status { get; private set; } = null!;

  public byte[] RowVersion { get; private set; } = null!;
  public DateTime CreatedAtUtc { get; private set; }
  public DateTime? UpdatedAtUtc { get; private set; }

  public ICollection<TopUpRequest> TopUpRequests { get; private set; } = [];
  public ICollection<Transaction> Transactions { get; private set; } = [];
  public ICollection<WalletMutation> WalletMutations { get; private set; } = [];

  private Wallet() { }

  public Wallet(long userId, string walletNumber, decimal balance, string status, DateTime? updatedAtUtc)
  {
    if (string.IsNullOrWhiteSpace(walletNumber))
    {
      throw new ArgumentException("Wallet Number wajib diisi", nameof(walletNumber));
    }
    if (balance < 0)
    {
      throw new ArgumentOutOfRangeException(nameof(balance), "Balance tidak boleh negatif");
    }

    UserId = userId;
    WalletNumber = walletNumber;
    Balance = balance;
    Status = status;
    UpdatedAtUtc = updatedAtUtc;
  }

  public Wallet(string walletNumber, decimal balance, string status, DateTime? updatedAtUtc)
  {
    if (string.IsNullOrWhiteSpace(walletNumber))
    {
      throw new ArgumentException("Wallet Number wajib diisi", nameof(walletNumber));
    }
    if (balance < 0)
    {
      throw new ArgumentOutOfRangeException(nameof(balance), "Balance tidak boleh negatif");
    }

    WalletNumber = walletNumber;
    Balance = balance;
    Status = status;
    UpdatedAtUtc = updatedAtUtc;
  }

  public void IncreaseBalance(decimal amount)
  {
    if (amount <= 0)
    {
      throw new ArgumentOutOfRangeException(nameof(amount), "Jumlah top up harus lebih dari 0");
    }
    Balance += amount;
    UpdatedAtUtc = DateTime.UtcNow;
  }

  public void DecreaseBalance(decimal amount)
  {
    if (amount <= 0)
    {
      throw new ArgumentOutOfRangeException(nameof(amount), "Jumlah transfer harus lebih dari 0");
    }
    if (Balance < amount)
    {
      throw new InvalidOperationException("Saldo tidak mencukupi untuk melakukan transfer");
    }
    Balance -= amount;
    UpdatedAtUtc = DateTime.UtcNow;
  }
}