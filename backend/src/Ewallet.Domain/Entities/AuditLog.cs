namespace Ewallet.Domain.Entities;

public sealed class AuditLog
{
  public long Id { get; private set; }

  public long? ActorUserId { get; private set; }
  // public AppUser? User { get; private set; }

  public long? TransactionId { get; private set; }
  public Transaction? Transaction { get; private set; }

  public string Action { get; private set; } = null!;
  public string EntityType { get; private set; } = null!;
  public string? EntityId { get; private set; }
  public string Outcome { get; private set; } = null!;
  public string? Description { get; private set; }
  public string? CorrelationId { get; private set; }
  public DateTime CreatedAtUtc { get; private set; }

  private AuditLog() { }

  public AuditLog(long? actorUserId, long? transactionId, string action, string entityType, string? entityId, string outcome, string? description, string? correlationId)
  {
    if (actorUserId is <= 0)
    {
      throw new ArgumentOutOfRangeException(nameof(actorUserId), "Actor user id tidak boleh 0 atau negatif");
    }
    if (transactionId is <= 0)
    {
      throw new ArgumentOutOfRangeException(nameof(transactionId), "Transaction id tidak boleh 0 atau negatif");
    }
    if (string.IsNullOrWhiteSpace(action))
    {
      throw new ArgumentException("Action wajib diisi", nameof(action));
    }
    if (string.IsNullOrWhiteSpace(entityType))
    {
      throw new ArgumentException("Entity type wajib diisi", nameof(entityType));
    }
    if (string.IsNullOrWhiteSpace(outcome))
    {
      throw new ArgumentException("Outcome wajib diisi", nameof(outcome));
    }

    ActorUserId = actorUserId;
    TransactionId = transactionId;
    Action = action;
    EntityType = entityType;
    EntityId = entityId;
    Outcome = outcome;
    Description = description;
    CorrelationId = correlationId;
  }
}