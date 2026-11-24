using Ewallet.Domain.Entities;

namespace Ewallet.Application.Repositories;

public interface ITopUpRequestRepository
{
  Task<IReadOnlyList<TopUpRequest>> GetAllAsync(CancellationToken cancellationToken);
  Task<TopUpRequest?> GetWithTransactionByIdAsync(long id, CancellationToken cancellationToken);
}
