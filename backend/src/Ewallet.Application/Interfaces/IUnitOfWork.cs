namespace Ewallet.Application.Interfaces;

public interface IUnitOfWork
{
  Task AddAsync<TEntity>(TEntity entity, CancellationToken cancellationToken = default)
          where TEntity : class;
  Task AddRangeAsync<TEntity>(IEnumerable<TEntity> entities, CancellationToken cancellationToken = default)
      where TEntity : class;

  Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
  Task BeginTransactionAsync(CancellationToken cancellationToken = default);
  Task CommitTransactionAsync(CancellationToken cancellationToken = default);
  Task RollbackTransactionAsync(CancellationToken cancellationToken = default);
  void ClearChangeTracker();
}