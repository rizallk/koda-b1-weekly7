using Ewallet.Application.DTOs;
using Ewallet.Domain.Entities;

namespace Ewallet.Application.Repositories;

public interface IWalletRepository
{
  Task<Wallet?> GetByUserIdAsync(long userId, CancellationToken cancellationToken = default);
  Task<Wallet?> GetByIdAsync(long id, CancellationToken cancellationToken = default);
  Task<Wallet?> GetByWalletNumberAsync(string walletNumber, CancellationToken cancellationToken = default);

  Task<WalletResponse?> GetWalletResponseByUserIdAsync(long userId, CancellationToken cancellationToken = default);
  Task<WalletResponse?> GetWalletResponseByIdAsync(long id, CancellationToken cancellationToken = default);
  Task<RecipientWalletResponse?> GetRecipientByWalletNumberAsync(string walletNumber, CancellationToken cancellationToken = default);

  Task<bool> TryUpdateBalanceAsync(Wallet wallet, CancellationToken cancellationToken = default);
  Task<string?> GetLastWalletNumberAsync(CancellationToken cancellationToken = default);
}