using Ewallet.Application.DTOs;

namespace Ewallet.Application.Repositories;

public interface IWalletMutationRepository
{
  Task<(IReadOnlyList<WalletMutationResponse> Items, int TotalCount)> GetWalletMutationsAsync(
    long walletId,
    WalletMutationFilterRequest filter,
    CancellationToken cancellationToken);
}