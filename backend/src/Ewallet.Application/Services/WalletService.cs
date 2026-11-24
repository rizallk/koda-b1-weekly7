using Ewallet.Application.DTOs;
using Ewallet.Application.Interfaces;
using Ewallet.Application.Repositories;
using Ewallet.Application.Services.Interfaces;
using Ewallet.Domain.Entities;

namespace Ewallet.Application.Services;

public sealed class WalletService(
  IUnitOfWork uow,
  IWalletRepository walletRepository,
  IPaymentMethodRepository paymentMethodRepository,
  IUserService userService,
  ITopUpRequestRepository topUpRequestRepository) : IWalletService
{
  private readonly IUnitOfWork _uow = uow;
  private readonly IWalletRepository _walletRepository = walletRepository;
  private readonly IPaymentMethodRepository _paymentMethodRepository = paymentMethodRepository;
  private readonly IUserService _userService = userService;
  private readonly ITopUpRequestRepository _topUpRequestRepository = topUpRequestRepository;

  public async Task<WalletResponse?> GetByUserIdAsync(long userId, CancellationToken cancellationToken = default)
  {
    if (userId <= 0)
    {
      return null;
    }

    return await _walletRepository.GetWalletResponseByUserIdAsync(userId, cancellationToken);
  }

  public async Task<WalletResponse?> GetByIdAsync(long id, CancellationToken cancellationToken = default)
  {
    if (id <= 0)
    {
      return null;
    }

    return await _walletRepository.GetWalletResponseByIdAsync(id, cancellationToken);
  }

  public async Task<RecipientWalletResponse?> GetRecipientByWalletNumberAsync(
    string walletNumber,
    CancellationToken cancellationToken = default)
  {
    if (string.IsNullOrWhiteSpace(walletNumber))
    {
      return null;
    }

    return await _walletRepository.GetRecipientByWalletNumberAsync(walletNumber.Trim(), cancellationToken);
  }

  public async Task<TopUpResponse?> RequestTopUpAsync(
    long userId,
    TopUpRequestDto req,
    string? correlationId,
    CancellationToken cancellationToken = default)
  {
    var walletInfo = await _walletRepository.GetWalletResponseByUserIdAsync(userId, cancellationToken);

    if (walletInfo is null || walletInfo.WalletStatus != "ACTIVE" || walletInfo.UserStatus != "ACTIVE")
    {
      return null;
    }

    var paymentMethod = await _paymentMethodRepository.GetByIdAsync(req.PaymentMethodId, cancellationToken);

    if (paymentMethod is null) return null;
    if (!paymentMethod.IsActive)
    {
      throw new InvalidOperationException($"Payment method dengan ID {paymentMethod.Id} tidak aktif.");
    }

    // Begin transaction
    await _uow.BeginTransactionAsync(cancellationToken);

    try
    {
      var referenceNo = $"TOPUP-{DateTime.UtcNow:yyyyMMddHHmmss}-{Guid.NewGuid().ToString("N")[..6].ToUpper()}";

      var transaction = new Transaction(
        referenceNo,
        senderWalletId: null,
        receiverWalletId: walletInfo.Id,
        type: "TOPUP",
        req.Amount,
        status: "PENDING",
        description: $"Top up via {paymentMethod.Name}",
        completedAtUtc: null
      );

      await _uow.AddAsync(transaction, cancellationToken);
      await _uow.SaveChangesAsync(cancellationToken);

      var topUpRequest = new TopUpRequest(
        transaction.Id,
        walletInfo.Id,
        paymentMethod.Id,
        req.Amount,
        status: "PENDING",
        providerReference: $"VA-{Guid.NewGuid().ToString("N")[..10].ToUpper()}",
        expiresAtUtc: DateTime.UtcNow.AddHours(1),
        paidAtUtc: null
      );

      await _uow.AddAsync(topUpRequest, cancellationToken);
      await _uow.SaveChangesAsync(cancellationToken);

      var auditLog = new AuditLog(
        userId,
        transaction.Id,
        action: "TOPUP_REQUESTED",
        entityType: "TopUpRequest",
        entityId: topUpRequest.Id.ToString(),
        outcome: "SUCCESS",
        description: $"Permintaan top up sebesar {req.Amount:C0} dibuat dengan status PENDING.",
        correlationId
      );

      await _uow.AddAsync(auditLog, cancellationToken);
      await _uow.SaveChangesAsync(cancellationToken);

      // Commit
      await _uow.CommitTransactionAsync(cancellationToken);

      return TopUpResponse.FromModel(topUpRequest, transaction, paymentMethod);
    }
    catch
    {
      // Rollback
      await _uow.RollbackTransactionAsync(cancellationToken);
      _uow.ClearChangeTracker();
      throw;
    }
  }

  public async Task<WalletResponse?> ConfirmTopUpAsync(
    long topUpRequestId,
    long actorUserId,
    string? correlationId,
    CancellationToken cancellationToken = default)
  {
    var actor = await _userService.GetUserByIdAsync(actorUserId, cancellationToken)
      ?? throw new KeyNotFoundException($"User dengan ID {actorUserId} tidak ditemukan.");

    if (actor.Status != "ACTIVE")
    {
      throw new InvalidOperationException("Akun tidak berstatus ACTIVE untuk melakukan konfirmasi top up.");
    }

    // Begin transaction
    await _uow.BeginTransactionAsync(cancellationToken);
    var isCommitted = false;

    try
    {
      var topUpRequest = await _topUpRequestRepository.GetWithTransactionByIdAsync(topUpRequestId, cancellationToken);

      if (topUpRequest is null) return null;

      if (topUpRequest.Status == "PAID" || topUpRequest.Transaction.Status == "SUCCESS")
      {
        throw new InvalidOperationException("Permintaan top up ini sudah lunas (PAID) dan tidak dapat diproses ulang.");
      }

      if (topUpRequest.Status != "PENDING")
      {
        throw new InvalidOperationException($"Status top up tidak valid untuk dikonfirmasi ({topUpRequest.Status}).");
      }

      if (topUpRequest.ExpiresAtUtc.HasValue && topUpRequest.ExpiresAtUtc.Value <= DateTime.UtcNow)
      {
        topUpRequest.MarkAsExpired();
        topUpRequest.Transaction.MarkAsFailed();

        var expiredLog = new AuditLog(
          actorUserId: actorUserId,
          transactionId: topUpRequest.TransactionId,
          action: "TOPUP_EXPIRED",
          entityType: "TopUpRequest",
          entityId: topUpRequest.Id.ToString(),
          outcome: "FAILED",
          description: $"Permintaan top up referensi {topUpRequest.Transaction.ReferenceNo} telah kedaluwarsa.",
          correlationId: correlationId);

        await _uow.AddAsync(expiredLog, cancellationToken);
        await _uow.SaveChangesAsync(cancellationToken);
        await _uow.CommitTransactionAsync(cancellationToken);
        isCommitted = true;

        throw new InvalidOperationException("Permintaan top up sudah kedaluwarsa (EXPIRED).");
      }

      // Tetap gunakan GetByIdAsync (tracked) agar RowVersion & perubahan saldo tersimpan
      var wallet = await _walletRepository.GetByIdAsync(topUpRequest.WalletId, cancellationToken);

      if (wallet is null || wallet.Status != "ACTIVE")
      {
        topUpRequest.MarkAsFailed();
        topUpRequest.Transaction.MarkAsFailed();

        var failedLog = new AuditLog(
          actorUserId: actorUserId,
          transactionId: topUpRequest.TransactionId,
          action: "TOPUP_FAILED",
          entityType: "TopUpRequest",
          entityId: topUpRequest.Id.ToString(),
          outcome: "FAILED",
          description: $"Konfirmasi top up referensi {topUpRequest.Transaction.ReferenceNo} gagal karena wallet tidak ACTIVE.",
          correlationId: correlationId);

        await _uow.AddAsync(failedLog, cancellationToken);
        await _uow.SaveChangesAsync(cancellationToken);
        await _uow.CommitTransactionAsync(cancellationToken);
        isCommitted = true;

        throw new InvalidOperationException("Wallet tidak ditemukan atau tidak berstatus ACTIVE.");
      }

      var balanceBefore = wallet.Balance;
      wallet.IncreaseBalance(topUpRequest.Amount);
      var balanceAfter = wallet.Balance;

      topUpRequest.MarkAsPaid();
      topUpRequest.Transaction.MarkAsSuccess();

      var mutation = new WalletMutation(
        transactionId: topUpRequest.TransactionId,
        walletId: wallet.Id,
        direction: "IN",
        amount: topUpRequest.Amount,
        balanceBefore: balanceBefore,
        balanceAfter: balanceAfter);

      await _uow.AddAsync(mutation, cancellationToken);

      var auditLog = new AuditLog(
        actorUserId: actorUserId,
        transactionId: topUpRequest.TransactionId,
        action: "TOPUP_PAID",
        entityType: "Wallet",
        entityId: wallet.Id.ToString(),
        outcome: "SUCCESS",
        description: $"Top up referensi {topUpRequest.Transaction.ReferenceNo} berhasil dikonfirmasi.",
        correlationId: correlationId);

      await _uow.AddAsync(auditLog, cancellationToken);

      await _uow.SaveChangesAsync(cancellationToken);

      // Commit
      await _uow.CommitTransactionAsync(cancellationToken);
      isCommitted = true;

      // Ambil WalletResponse terbaru hasil LINQ join (sudah memuat UserStatus & Balance terkini)
      return await _walletRepository.GetWalletResponseByIdAsync(wallet.Id, cancellationToken);
    }
    catch
    {
      if (!isCommitted)
      {
        await _uow.RollbackTransactionAsync(cancellationToken);
        _uow.ClearChangeTracker();
      }

      throw;
    }
  }
}