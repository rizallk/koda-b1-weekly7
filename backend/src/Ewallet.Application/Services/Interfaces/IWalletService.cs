using Ewallet.Application.DTOs;
using Ewallet.Domain.Entities;

namespace Ewallet.Application.Services.Interfaces;

public interface IWalletService
{
  Task<WalletResponse?> GetByUserIdAsync(long userId, CancellationToken cancellationToken = default);
  Task<WalletResponse?> GetByIdAsync(long id, CancellationToken cancellationToken = default);
  Task<RecipientWalletResponse?> GetRecipientByWalletNumberAsync(string walletNumber, CancellationToken cancellationToken = default);

  Task<TopUpResponse?> RequestTopUpAsync(
    long userId,
    TopUpRequestDto request,
    string? correlationId,
    CancellationToken cancellationToken = default);

  Task<WalletResponse?> ConfirmTopUpAsync(
    long topUpRequestId,
    long actorUserId,
    string? correlationId,
    CancellationToken cancellationToken = default);
}