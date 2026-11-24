using Ewallet.Application.DTOs;
using Ewallet.Application.Repositories;
using Ewallet.Application.Services.Interfaces;

namespace Ewallet.Application.Services;

public sealed class TopUpRequestService(ITopUpRequestRepository repository) : ITopUpRequestService
{
  private readonly ITopUpRequestRepository _repository = repository;

  public async Task<IReadOnlyList<TopUpResponse>> GetAllAsync(CancellationToken cancellationToken)
  {
    var topUpRequests = await _repository.GetAllAsync(cancellationToken);

    return topUpRequests.Select(r => TopUpResponse.FromModel(r, r.Transaction, r.PaymentMethod)).ToArray();
  }
}