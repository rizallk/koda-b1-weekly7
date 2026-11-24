using Microsoft.EntityFrameworkCore;
using Ewallet.Infrastructure.Persistence;
using Ewallet.Domain.Entities;
using Ewallet.Application.Repositories;

namespace Ewallet.Infrastructure.Repositories;

public sealed class TopUpRequestRepository(AppDbContext db) : ITopUpRequestRepository
{
  private readonly AppDbContext _db = db;

  public async Task<IReadOnlyList<TopUpRequest>> GetAllAsync(CancellationToken cancellationToken)
  {
    return await _db.TopUpRequests
     .AsNoTracking()
     .Include(t => t.Transaction)
     .Include(t => t.PaymentMethod)
     .OrderByDescending(t => t.CreatedAtUtc)
     .ToListAsync(cancellationToken);
  }

  public async Task<TopUpRequest?> GetWithTransactionByIdAsync(long id, CancellationToken cancellationToken)
  {
    return await _db.TopUpRequests.Include(t => t.Transaction).FirstOrDefaultAsync(t => t.Id == id, cancellationToken);
  }
}