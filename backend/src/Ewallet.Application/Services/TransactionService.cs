using Ewallet.Application.DTOs;
using Ewallet.Application.Repositories;
using Ewallet.Application.Services.Interfaces;

namespace Ewallet.Application.Services;

public sealed class TransactionService(ITransactionRepository transactionRepository) : ITransactionService
{
  private readonly ITransactionRepository _transactionRepository = transactionRepository;

  public async Task<TotalTransaction?> GetTransactionSummaryByWalletIdAsync(long walletId, CancellationToken cancellationToken)
  {
    var summaries = await _transactionRepository.GetTransactionSummaryByWalletIdAsync(walletId, cancellationToken);

    if (summaries.Count == 0)
    {
      return null;
    }

    return new TotalTransaction(
            Income: summaries.FirstOrDefault(x => string.Equals(x.Type, "Income", StringComparison.OrdinalIgnoreCase))?.TotalAmount ?? 0m,
            Expense: summaries.FirstOrDefault(x => string.Equals(x.Type, "Expense", StringComparison.OrdinalIgnoreCase))?.TotalAmount ?? 0m,
            TopUp: summaries.FirstOrDefault(x => string.Equals(x.Type, "TopUp", StringComparison.OrdinalIgnoreCase))?.TotalAmount ?? 0m
        );
  }
}