using Microsoft.EntityFrameworkCore;
using Ewallet.Infrastructure.Persistence;
using Ewallet.Application.DTOs;
using Ewallet.Domain.Entities;

namespace Ewallet.Application.Repositories;

public sealed class WalletMutationRepository(AppDbContext db) : IWalletMutationRepository
{
  private readonly AppDbContext _db = db;

  public async Task<(IReadOnlyList<WalletMutationResponse> Items, int TotalCount)> GetWalletMutationsAsync(
    long walletId,
    WalletMutationFilterRequest filter,
    CancellationToken cancellationToken)
  {
    IQueryable<WalletMutation> query = _db.WalletMutations
      .AsNoTracking()
      .Where(m => m.WalletId == walletId);

    if (!string.IsNullOrWhiteSpace(filter.Search))
    {
      var keyword = filter.Search.Trim();
      query = query.Where(m => m.Transaction.ReferenceNo.Contains(keyword));
    }

    if (!string.IsNullOrWhiteSpace(filter.Type))
    {
      var type = filter.Type.Trim().ToUpper();
      query = query.Where(m => m.Transaction.Type == type);
    }

    if (!string.IsNullOrWhiteSpace(filter.Direction))
    {
      var direction = filter.Direction.Trim().ToUpper();
      query = query.Where(m => m.Direction == direction);
    }

    if (filter.StartDateUtc.HasValue)
    {
      query = query.Where(m => m.CreatedAtUtc >= filter.StartDateUtc.Value);
    }

    if (filter.EndDateUtc.HasValue)
    {
      query = query.Where(m => m.CreatedAtUtc <= filter.EndDateUtc.Value);
    }

    var totalCount = await query.CountAsync(cancellationToken);

    var isAscending = string.Equals(filter.OrderBy, "asc", StringComparison.OrdinalIgnoreCase);
    query = filter.SortBy?.ToLower() switch
    {
      "amount" => isAscending ? query.OrderBy(m => m.Amount) : query.OrderByDescending(m => m.Amount),
      "referenceno" => isAscending ? query.OrderBy(m => m.Transaction.ReferenceNo) : query.OrderByDescending(m => m.Transaction.ReferenceNo),
      _ => isAscending
        ? query.OrderBy(m => m.CreatedAtUtc).ThenBy(m => m.Id)
        : query.OrderByDescending(m => m.CreatedAtUtc).ThenByDescending(m => m.Id)
    };

    var page = filter.Page < 1 ? 1 : filter.Page;
    var pageSize = filter.PageSize is < 1 or > 100 ? 10 : filter.PageSize;

    var items = await query
      .Skip((page - 1) * pageSize)
      .Take(pageSize)
      .Select(m => new WalletMutationResponse(
        m.Id,
        m.TransactionId,
        m.Transaction.ReferenceNo,
        m.Transaction.Type,
        m.Direction,
        m.Amount,
        m.BalanceBefore,
        m.BalanceAfter,
        m.Transaction.Description,
        m.CreatedAtUtc
      ))
      .ToListAsync(cancellationToken);

    return (items, totalCount);
  }
}