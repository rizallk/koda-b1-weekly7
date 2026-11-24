using Ewallet.Application.DTOs;

namespace Ewallet.Application.Services.Interfaces;

public interface ITransactionService
{
  Task<TotalTransaction?> GetTransactionSummaryByWalletIdAsync(long walletId, CancellationToken cancellationToken);
}