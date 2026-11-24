using Ewallet.Application.DTOs;
using Ewallet.Application.Repositories;
using Ewallet.Application.Services.Interfaces;

namespace Ewallet.Application.Services;

public sealed class PaymentMethodService(IPaymentMethodRepository repository) : IPaymentMethodService
{
  private readonly IPaymentMethodRepository _repository = repository;

  public async Task<IReadOnlyList<PaymentMethodResponse>> GetAllAsync(PaymentMethodFilterRequest filter, CancellationToken cancellationToken)
  {
    var paymentMethods = await _repository.GetAllAsync(filter, cancellationToken);

    return paymentMethods.Select(PaymentMethodResponse.FromModel).ToArray();
  }
}