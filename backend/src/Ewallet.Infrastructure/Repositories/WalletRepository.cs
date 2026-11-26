using Microsoft.EntityFrameworkCore;
using Ewallet.Application.DTOs;
using Ewallet.Application.Repositories;
using Ewallet.Domain.Entities;
using Ewallet.Infrastructure.Persistence;

namespace Ewallet.Infrastructure.Repositories;

public sealed class WalletRepository(AppDbContext db) : IWalletRepository
{
  private readonly AppDbContext _db = db;

  // TRACKED ENTITY QUERIES (Untuk Transaksi & Update Saldo)
  public async Task<Wallet?> GetByUserIdAsync(long userId, CancellationToken cancellationToken = default)
  {
    return await _db.Wallets
      .FirstOrDefaultAsync(w => w.UserId == userId, cancellationToken);
  }

  public async Task<Wallet?> GetByIdAsync(long id, CancellationToken cancellationToken = default)
  {
    return await _db.Wallets
      .FirstOrDefaultAsync(w => w.Id == id, cancellationToken);
  }

  public async Task<Wallet?> GetByWalletNumberAsync(string walletNumber, CancellationToken cancellationToken = default)
  {
    return await _db.Wallets
      .FirstOrDefaultAsync(w => w.WalletNumber == walletNumber, cancellationToken);
  }

  // READ-ONLY DTO QUERIES VIA LINQ JOIN (Untuk Dashboard & Konfirmasi Transfer)
  public async Task<WalletResponse?> GetWalletResponseByUserIdAsync(long userId, CancellationToken cancellationToken = default)
  {
    return await (
      from w in _db.Wallets.AsNoTracking()
      join u in _db.Users.AsNoTracking() on w.UserId equals u.Id
      where w.UserId == userId
      select new WalletResponse(
        w.Id,
        w.UserId,
        _db.Transactions
          .AsNoTracking()
          .Where(t => t.SenderWalletId == w.Id || t.ReceiverWalletId == w.Id)
          .OrderByDescending(t => t.CreatedAtUtc)
          .Select(t => t.ReferenceNo)
          .FirstOrDefault(),
        w.WalletNumber,
        w.Balance,
        w.Status,
        u.Status,
        w.CreatedAtUtc,
        w.UpdatedAtUtc
      )
    ).FirstOrDefaultAsync(cancellationToken);
  }

  public async Task<WalletResponse?> GetWalletResponseByIdAsync(long id, CancellationToken cancellationToken = default)
  {
    return await (
      from w in _db.Wallets.AsNoTracking()
      join u in _db.Users.AsNoTracking() on w.UserId equals u.Id
      select new WalletResponse(
        w.Id,
        w.UserId,
        _db.Transactions
          .AsNoTracking()
          .Where(t => t.SenderWalletId == w.Id || t.ReceiverWalletId == w.Id)
          .OrderByDescending(t => t.CreatedAtUtc)
          .Select(t => t.ReferenceNo)
          .FirstOrDefault(),
        w.WalletNumber,
        w.Balance,
        w.Status,
        u.Status,
        w.CreatedAtUtc,
        w.UpdatedAtUtc
      )
    ).FirstOrDefaultAsync(cancellationToken);
  }

  public async Task<RecipientWalletResponse?> GetRecipientByWalletNumberAsync(string walletNumber, CancellationToken cancellationToken = default)
  {
    return await (
      from w in _db.Wallets.AsNoTracking()
      join u in _db.Users.AsNoTracking() on w.UserId equals u.Id
      where w.WalletNumber == walletNumber
      select new RecipientWalletResponse(
        w.Id,
        w.WalletNumber,
        u.FullName,
        u.UserName,
        w.Status,
        u.Status
      )
    ).FirstOrDefaultAsync(cancellationToken);
  }

  // PERSISTENCE & HELPER
  public async Task<bool> TryAddAsync(Wallet wallet, CancellationToken cancellationToken = default)
  {
    await _db.Wallets.AddAsync(wallet, cancellationToken);

    var affectedRows = await _db.SaveChangesAsync(cancellationToken);

    return affectedRows > 0;
  }

  public async Task<bool> TryUpdateBalanceAsync(Wallet wallet, CancellationToken cancellationToken = default)
  {
    _db.Wallets.Update(wallet);

    var affectedRows = await _db.SaveChangesAsync(cancellationToken);

    return affectedRows > 0;
  }

  public async Task<string?> GetLastWalletNumberAsync(CancellationToken cancellationToken = default)
  {
    return await _db.Wallets
      .AsNoTracking()
      .OrderByDescending(w => w.Id)
      .Select(w => w.WalletNumber)
      .FirstOrDefaultAsync(cancellationToken);
  }
}