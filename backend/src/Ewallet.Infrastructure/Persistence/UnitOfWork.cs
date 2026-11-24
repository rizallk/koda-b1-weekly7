using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using Ewallet.Application.Exceptions;
using Ewallet.Application.Interfaces;

namespace Ewallet.Infrastructure.Persistence;

public class UnitOfWork(AppDbContext db) : IUnitOfWork
{
  private readonly AppDbContext _db = db;
  private IDbContextTransaction? _currentTransaction;

  public async Task AddAsync<TEntity>(TEntity entity, CancellationToken cancellationToken = default)
        where TEntity : class
  {
    await _db.Set<TEntity>().AddAsync(entity, cancellationToken);
  }

  public async Task AddRangeAsync<TEntity>(IEnumerable<TEntity> entities, CancellationToken cancellationToken = default)
      where TEntity : class
  {
    await _db.Set<TEntity>().AddRangeAsync(entities, cancellationToken);
  }

  public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
  {
    try
    {

      return await _db.SaveChangesAsync(cancellationToken);
    }
    catch (DbUpdateConcurrencyException ex)
    {
      throw new ConcurrencyConflictException("Data telah diperbarui oleh proses lain secara bersamaan.", ex);
    }
  }

  public async Task BeginTransactionAsync(CancellationToken cancellationToken = default)
  {
    if (_currentTransaction is not null)
      return;

    _currentTransaction = await _db.Database.BeginTransactionAsync(cancellationToken);
  }

  public async Task CommitTransactionAsync(CancellationToken cancellationToken = default)
  {
    try
    {
      await _db.SaveChangesAsync(cancellationToken);
      if (_currentTransaction is not null)
      {
        await _currentTransaction.CommitAsync(cancellationToken);
      }
    }
    catch
    {
      await RollbackTransactionAsync(cancellationToken);
      throw;
    }
    finally
    {
      if (_currentTransaction is not null)
      {
        await _currentTransaction.DisposeAsync();
        _currentTransaction = null;
      }
    }
  }

  public async Task RollbackTransactionAsync(CancellationToken cancellationToken = default)
  {
    try
    {
      if (_currentTransaction is not null)
      {
        await _currentTransaction.RollbackAsync(cancellationToken);
      }
    }
    finally
    {
      if (_currentTransaction is not null)
      {
        await _currentTransaction.DisposeAsync();
        _currentTransaction = null;
      }
    }
  }

  public void ClearChangeTracker()
  {
    _db.ChangeTracker.Clear();
  }
}