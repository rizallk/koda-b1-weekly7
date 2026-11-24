using Ewallet.Application.DTOs;

namespace Ewallet.Application.Services.Interfaces;

public interface ITransferService
{
  Task<TransactionResponse?> TransferAsync(long actorUserId, TransferRequest transfer, string? correlationId, CancellationToken cancellationToken);
}