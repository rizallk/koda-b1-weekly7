namespace Ewallet.Domain.Entities;

public sealed class WalletMutation
{
  public long Id { get; private set; }

  public long TransactionId { get; private set; }
  public Transaction Transaction { get; private set; } = null!;

  public long WalletId { get; private set; }
  public Wallet Wallet { get; private set; } = null!;

  public string Direction { get; private set; } = null!;
  public decimal Amount { get; private set; }
  public decimal BalanceBefore { get; private set; }
  public decimal BalanceAfter { get; private set; }
  public DateTime CreatedAtUtc { get; private set; }



  private WalletMutation() { }

  public WalletMutation(long transactionId, long walletId, string direction, decimal amount, decimal balanceBefore, decimal balanceAfter)
  {
    if (transactionId <= 0)
    {
      throw new ArgumentOutOfRangeException(nameof(transactionId), "Transaction id tidak boleh 0 atau negatif");
    }
    if (walletId <= 0)
    {
      throw new ArgumentOutOfRangeException(nameof(walletId), "Wallet id tidak boleh 0 atau negatif");
    }
    if (string.IsNullOrWhiteSpace(direction))
    {
      throw new ArgumentException("Direction wajib diisi", nameof(direction));
    }
    if (amount <= 0)
    {
      throw new ArgumentOutOfRangeException(nameof(amount), "Amount harus lebih 0");
    }
    if (balanceBefore < 0)
    {
      throw new ArgumentOutOfRangeException(nameof(balanceBefore), "Balance before tidak boleh negatif");
    }
    if (balanceAfter < 0)
    {
      throw new ArgumentOutOfRangeException(nameof(balanceAfter), "Balance after tidak boleh negatif");
    }

    TransactionId = transactionId;
    WalletId = walletId;
    Direction = direction;
    Amount = amount;
    BalanceBefore = balanceBefore;
    BalanceAfter = balanceAfter;
  }
}