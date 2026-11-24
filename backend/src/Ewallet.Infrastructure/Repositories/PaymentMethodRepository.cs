using Microsoft.EntityFrameworkCore;
using Ewallet.Infrastructure.Persistence;
using Ewallet.Application.DTOs;
using Ewallet.Domain.Entities;
using Ewallet.Application.Repositories;

namespace Ewallet.Infrastructure.Repositories;

public sealed class PaymentMethodRepository(AppDbContext db) : IPaymentMethodRepository
{
  private readonly AppDbContext _db = db;

  public async Task<IReadOnlyList<PaymentMethod>> GetAllAsync(PaymentMethodFilterRequest filter, CancellationToken cancellationToken)
  {
    IQueryable<PaymentMethod> paymentMethods = _db.PaymentMethods.AsNoTracking();

    if (filter.IsActive.HasValue)
    {
      paymentMethods = paymentMethods.Where(p => p.IsActive == filter.IsActive.Value);
    }

    return await paymentMethods.OrderByDescending(p => p.CreatedAtUtc).ToListAsync(cancellationToken);
  }

  public async Task<PaymentMethod?> GetByIdAsync(long id, CancellationToken cancellationToken)
  {
    return await _db.PaymentMethods
      .AsNoTracking()
      .Where(p => p.Id == id)
      .FirstOrDefaultAsync(cancellationToken);
  }
}