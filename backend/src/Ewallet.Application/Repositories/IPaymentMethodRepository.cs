using Ewallet.Application.DTOs;
using Ewallet.Domain.Entities;

namespace Ewallet.Application.Repositories;

public interface IPaymentMethodRepository
{
  Task<IReadOnlyList<PaymentMethod>> GetAllAsync(PaymentMethodFilterRequest filter, CancellationToken cancellationToken);
  Task<PaymentMethod?> GetByIdAsync(long id, CancellationToken cancellationToken);
}
