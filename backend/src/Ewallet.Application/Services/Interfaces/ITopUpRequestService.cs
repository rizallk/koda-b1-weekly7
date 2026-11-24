using Ewallet.Application.DTOs;

namespace Ewallet.Application.Services.Interfaces;

public interface ITopUpRequestService
{
  Task<IReadOnlyList<TopUpResponse>> GetAllAsync(CancellationToken cancellationToken);
}