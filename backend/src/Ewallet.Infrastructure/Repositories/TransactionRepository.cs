using Microsoft.EntityFrameworkCore;
using Ewallet.Infrastructure.Persistence;
using Ewallet.Application.DTOs;
using Ewallet.Domain.Entities;
using Ewallet.Application.Repositories;

namespace Ewallet.Infrastructure.Repositories;

public sealed class TransactionRepository(AppDbContext db) : ITransactionRepository
{
  private readonly AppDbContext _db = db;

  public async Task<bool> TryAddAsync(Transaction trx, CancellationToken cancellationToken)
  {
    await _db.Transactions.AddAsync(trx, cancellationToken);
    var affectedRows = await _db.SaveChangesAsync(cancellationToken);
    return affectedRows > 0;
  }

  public async Task<Transaction?> GetByIdAsync(long id, CancellationToken cancellationToken)
  {
    return await _db.Transactions
      .FirstOrDefaultAsync(t => t.Id == id, cancellationToken);
  }

  public async Task<Transaction?> GetReadOnlyByReferenceNoAsync(string referenceNo, CancellationToken cancellationToken)
  {
    return await _db.Transactions
      .AsNoTracking()
      .FirstOrDefaultAsync(t => t.ReferenceNo == referenceNo, cancellationToken);
  }

  public async Task<IReadOnlyList<TransactionSummary>> GetTransactionSummaryByWalletIdAsync(
    long walletId,
    CancellationToken cancellationToken)
  {
    return await _db.Transactions
      .AsNoTracking()
      .Where(t => t.Status == "SUCCESS" &&
                  (t.SenderWalletId == walletId || t.ReceiverWalletId == walletId))
      .GroupBy(t => t.Type)
      .Select(g => new TransactionSummary(
        g.Key,
        g.Sum(t => t.Amount)
      ))
      .ToListAsync(cancellationToken);
  }

  public async Task<(IReadOnlyList<TransactionResponse> Items, int TotalCount)> GetTransactionHistoryAsync(
    long walletId,
    TransactionFilterRequest filter,
    CancellationToken cancellationToken)
  {
    IQueryable<Transaction> query = _db.Transactions
      .AsNoTracking()
      .Where(t => t.SenderWalletId == walletId || t.ReceiverWalletId == walletId);

    // Search berdasarkan ReferenceNo
    if (!string.IsNullOrWhiteSpace(filter.Search))
    {
      var keyword = filter.Search.Trim();
      query = query.Where(t => t.ReferenceNo.Contains(keyword));
    }

    // Filter Type (TOPUP / TRANSFER)
    if (!string.IsNullOrWhiteSpace(filter.Type))
    {
      var type = filter.Type.Trim().ToUpper();
      query = query.Where(t => t.Type == type);
    }

    // Filter Status (PENDING / SUCCESS / FAILED)
    if (!string.IsNullOrWhiteSpace(filter.Status))
    {
      var status = filter.Status.Trim().ToUpper();
      query = query.Where(t => t.Status == status);
    }

    // Filter Rentang Tanggal (CreatedAtUtc)
    if (filter.StartDateUtc.HasValue)
    {
      query = query.Where(t => t.CreatedAtUtc >= filter.StartDateUtc.Value);
    }

    if (filter.EndDateUtc.HasValue)
    {
      query = query.Where(t => t.CreatedAtUtc <= filter.EndDateUtc.Value);
    }

    var totalCount = await query.CountAsync(cancellationToken);

    // Sorting dinamis
    var isAscending = string.Equals(filter.OrderBy, "asc", StringComparison.OrdinalIgnoreCase);
    query = filter.SortBy?.ToLower() switch
    {
      "amount" => isAscending ? query.OrderBy(t => t.Amount) : query.OrderByDescending(t => t.Amount),
      "referenceno" => isAscending ? query.OrderBy(t => t.ReferenceNo) : query.OrderByDescending(t => t.ReferenceNo),
      _ => isAscending
        ? query.OrderBy(t => t.CreatedAtUtc).ThenBy(t => t.Id)
        : query.OrderByDescending(t => t.CreatedAtUtc).ThenByDescending(t => t.Id)
    };

    // Pagination & Projection DTO
    var page = filter.Page < 1 ? 1 : filter.Page;
    var pageSize = filter.PageSize is < 1 or > 100 ? 10 : filter.PageSize;

    var items = await query
      .Skip((page - 1) * pageSize)
      .Take(pageSize)
      .Select(t => new TransactionResponse(
        t.Id,
        t.ReferenceNo,
        t.SenderWalletId,
        t.ReceiverWalletId,
        t.Type,
        t.Amount,
        t.Status,
        t.Description,
        t.CreatedAtUtc,
        t.CompletedAtUtc
      ))
      .ToListAsync(cancellationToken);

    return (items, totalCount);
  }
}