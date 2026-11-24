using Ewallet.Application.DTOs;

namespace Ewallet.Application.Services.Interfaces;

public interface IPaymentMethodService
{
  Task<IReadOnlyList<PaymentMethodResponse>> GetAllAsync(PaymentMethodFilterRequest filter, CancellationToken cancellationToken);
}