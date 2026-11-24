using Ewallet.Application.DTOs;
using Ewallet.Domain.Entities;
using Ewallet.Application.Repositories;
using Ewallet.Application.Interfaces;
using Ewallet.Application.Services.Interfaces;
using Ewallet.Application.Exceptions;

namespace Ewallet.Application.Services;

public sealed class TransferService(
  IWalletRepository walletRepository,
  IUnitOfWork uow) : ITransferService
{
  private readonly IWalletRepository _walletRepository = walletRepository;
  private readonly IUnitOfWork _uow = uow;

  public async Task<TransactionResponse?> TransferAsync(
    long actorUserId,
    TransferRequest req,
    string? correlationId,
    CancellationToken cancellationToken)
  {
    // Validasi
    if (req.SenderWalletId == req.ReceiverWalletId)
    {
      await LogRejectedTransferAsync(
        actorUserId: null,
        entityId: req.SenderWalletId.ToString(),
        description: "Tidak dapat melakukan transfer ke wallet sendiri.",
        correlationId: correlationId,
        cancellationToken: cancellationToken);

      throw new InvalidOperationException("Tidak bisa melakukan transfer ke akun sendiri.");
    }

    if (req.Amount <= 0)
    {
      await LogRejectedTransferAsync(
        actorUserId: null,
        entityId: req.SenderWalletId.ToString(),
        description: "Nominal transfer harus lebih dari 0.",
        correlationId: correlationId,
        cancellationToken: cancellationToken);

      throw new ArgumentOutOfRangeException(nameof(req.Amount), "Nominal transfer harus lebih dari 0.");
    }

    var senderWallet = await _walletRepository.GetByIdAsync(req.SenderWalletId, cancellationToken);
    var receiverWallet = await _walletRepository.GetByIdAsync(req.ReceiverWalletId, cancellationToken);

    var senderWalletInfo = await _walletRepository.GetWalletResponseByIdAsync(req.SenderWalletId, cancellationToken);
    var receiverWalletInfo = await _walletRepository.GetWalletResponseByIdAsync(req.ReceiverWalletId, cancellationToken);

    if (senderWallet is null || receiverWallet is null || senderWalletInfo is null || receiverWalletInfo is null)
    {
      await LogRejectedTransferAsync(
        actorUserId: senderWallet?.UserId,
        entityId: req.SenderWalletId.ToString(),
        description: "Wallet pengirim atau penerima tidak ditemukan.",
        correlationId: correlationId,
        cancellationToken: cancellationToken);

      return null;
    }

    if (senderWallet.UserId != actorUserId)
    {
      await LogRejectedTransferAsync(
        actorUserId: actorUserId,
        entityId: req.SenderWalletId.ToString(),
        description: $"User ID {actorUserId} mencoba melakukan transfer menggunakan wallet milik user lain (WalletId: {req.SenderWalletId}).",
        correlationId: correlationId,
        cancellationToken: cancellationToken);

      throw new UnauthorizedAccessException("Anda tidak memiliki akses untuk menggunakan wallet pengirim ini.");
    }

    // Mengecek status wallet
    if (senderWallet.Status != "ACTIVE" || receiverWallet.Status != "ACTIVE")
    {
      var reason = $"Status wallet tidak valid (Sender: {senderWallet.Status}, Receiver: {receiverWallet.Status}).";

      await RecordFailedTransferAsync(
        senderWallet: senderWallet,
        receiverWallet: receiverWallet,
        req: req,
        reason: reason,
        action: "TRANSFER_REJECTED",
        outcome: "REJECTED",
        correlationId: correlationId,
        cancellationToken: cancellationToken);

      throw new InvalidOperationException("Wallet pengirim dan penerima harus berstatus ACTIVE.");
    }

    // Mengecek status user
    if (senderWalletInfo.UserStatus != "ACTIVE" || receiverWalletInfo.UserStatus != "ACTIVE")
    {
      var reason = $"Status user tidak valid (Sender: {senderWallet.Status}, Receiver: {receiverWallet.Status}).";

      await RecordFailedTransferAsync(
        senderWallet: senderWallet,
        receiverWallet: receiverWallet,
        req: req,
        reason: reason,
        action: "TRANSFER_REJECTED",
        outcome: "REJECTED",
        correlationId: correlationId,
        cancellationToken: cancellationToken);

      throw new InvalidOperationException("User pengirim dan penerima harus berstatus ACTIVE.");
    }


    if (senderWallet.Balance < req.Amount)
    {
      var reason = "Saldo pengirim tidak mencukupi untuk melakukan transfer.";

      await RecordFailedTransferAsync(
        senderWallet: senderWallet,
        receiverWallet: receiverWallet,
        req: req,
        reason: reason,
        action: "TRANSFER_REJECTED",
        outcome: "REJECTED",
        correlationId: correlationId,
        cancellationToken: cancellationToken);

      throw new InvalidOperationException(reason);
    }

    // Begin Transaction
    await _uow.BeginTransactionAsync();

    try
    {
      var senderBalanceBefore = senderWallet.Balance;
      var receiverBalanceBefore = receiverWallet.Balance;

      senderWallet.DecreaseBalance(req.Amount);
      receiverWallet.IncreaseBalance(req.Amount);

      var senderBalanceAfter = senderWallet.Balance;
      var receiverBalanceAfter = receiverWallet.Balance;

      var now = DateTime.UtcNow;
      var referenceNo = GenerateReferenceNo(now);

      var transaction = new Transaction(
        referenceNo: referenceNo,
        senderWalletId: senderWallet.Id,
        receiverWalletId: receiverWallet.Id,
        type: "TRANSFER",
        amount: req.Amount,
        status: "SUCCESS",
        description: string.IsNullOrWhiteSpace(req.Description)
          ? $"Transfer ke {receiverWallet.WalletNumber}"
          : req.Description.Trim(),
        completedAtUtc: now);

      await _uow.AddAsync(transaction, cancellationToken);
      await _uow.SaveChangesAsync(cancellationToken);

      var outMutation = new WalletMutation(
        transactionId: transaction.Id,
        walletId: senderWallet.Id,
        direction: "OUT",
        amount: req.Amount,
        balanceBefore: senderBalanceBefore,
        balanceAfter: senderBalanceAfter);

      var inMutation = new WalletMutation(
        transactionId: transaction.Id,
        walletId: receiverWallet.Id,
        direction: "IN",
        amount: req.Amount,
        balanceBefore: receiverBalanceBefore,
        balanceAfter: receiverBalanceAfter);

      await _uow.AddRangeAsync([outMutation, inMutation], cancellationToken);

      var auditLog = new AuditLog(
        actorUserId: senderWallet.UserId,
        transactionId: transaction.Id,
        action: "TRANSFER_CREATED",
        entityType: "Transaction",
        entityId: transaction.Id.ToString(),
        outcome: "SUCCESS",
        description: $"Transfer referensi {referenceNo} sebesar {req.Amount:N0} dari {senderWallet.WalletNumber} ke {receiverWallet.WalletNumber} berhasil.",
        correlationId: correlationId);

      await _uow.AddAsync(auditLog, cancellationToken);

      await _uow.SaveChangesAsync(cancellationToken);

      // Commit
      await _uow.CommitTransactionAsync(cancellationToken);

      return TransactionResponse.FromModel(transaction);
    }
    catch (ConcurrencyConflictException ex)
    {
      // Rollback
      await _uow.RollbackTransactionAsync(cancellationToken);
      _uow.ClearChangeTracker();

      await RecordFailedTransferAsync(
        senderWallet: senderWallet,
        receiverWallet: receiverWallet,
        req: req,
        reason: "Konflik pembaruan saldo secara bersamaan (Concurrency Conflict).",
        action: "TRANSFER_FAILED",
        outcome: "FAILED",
        correlationId: correlationId,
        cancellationToken: cancellationToken);

      throw new ConcurrencyConflictException(
        "Transfer gagal karena saldo sedang diproses oleh transaksi lain. Silakan coba lagi.", ex);
    }
    catch
    {
      await _uow.RollbackTransactionAsync(cancellationToken);
      _uow.ClearChangeTracker();
      throw;
    }
  }

  // ========================= Method Helper
  private static string GenerateReferenceNo(DateTime utcNow) =>
    $"TRF-{utcNow:yyyyMMddHHmmss}-{Guid.NewGuid().ToString("N")[..6].ToUpper()}";

  private async Task RecordFailedTransferAsync(
    Wallet senderWallet,
    Wallet receiverWallet,
    TransferRequest req,
    string reason,
    string action,
    string outcome,
    string? correlationId,
    CancellationToken cancellationToken)
  {
    var now = DateTime.UtcNow;
    var referenceNo = GenerateReferenceNo(now);

    var failedTransaction = new Transaction(
      referenceNo: referenceNo,
      senderWalletId: senderWallet.Id,
      receiverWalletId: receiverWallet.Id,
      type: "TRANSFER",
      amount: req.Amount,
      status: "FAILED",
      description: string.IsNullOrWhiteSpace(req.Description)
        ? $"Gagal transfer ke {receiverWallet.WalletNumber}: {reason}"
        : $"{req.Description.Trim()} (Gagal: {reason})",
      completedAtUtc: now);

    await _uow.AddAsync(failedTransaction, cancellationToken);
    await _uow.SaveChangesAsync(cancellationToken);

    var auditLog = new AuditLog(
      actorUserId: senderWallet.UserId,
      transactionId: failedTransaction.Id,
      action: action,
      entityType: "Transaction",
      entityId: failedTransaction.Id.ToString(),
      outcome: outcome,
      description: $"Transfer referensi {referenceNo} gagal: {reason}",
      correlationId: correlationId);

    await _uow.AddAsync(auditLog, cancellationToken);
    await _uow.SaveChangesAsync(cancellationToken);
  }

  private async Task LogRejectedTransferAsync(
    long? actorUserId,
    string? entityId,
    string description,
    string? correlationId,
    CancellationToken cancellationToken)
  {
    var rejectedLog = new AuditLog(
      actorUserId: actorUserId,
      transactionId: null,
      action: "TRANSFER_REJECTED",
      entityType: "Wallet",
      entityId: entityId,
      outcome: "REJECTED",
      description: description,
      correlationId: correlationId);

    await _uow.AddAsync(rejectedLog, cancellationToken);
    await _uow.SaveChangesAsync(cancellationToken);
  }
}