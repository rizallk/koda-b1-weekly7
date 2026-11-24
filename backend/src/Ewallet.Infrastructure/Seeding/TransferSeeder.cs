using Microsoft.EntityFrameworkCore;
using Ewallet.Domain.Entities;
using Ewallet.Infrastructure.Identity;
using Ewallet.Infrastructure.Persistence;

namespace Ewallet.Infrastructure.Seeding;

public static class TransferSeeder
{
  public static async Task SeedAsync(
    AppDbContext context,
    List<AppUser> users,
    CancellationToken cancellationToken = default)
  {
    if (await context.Transactions.AnyAsync(t => t.Type == "TRANSFER", cancellationToken))
    {
      return;
    }

    await CreateSuccessTransferAsync(context, users[0], users[1], 200_000m, "TRF-20261115-0001", "Bayar patungan makan siang", "SEED-CORR-006", cancellationToken);
    await CreateSuccessTransferAsync(context, users[1], users[5], 150_000m, "TRF-20261115-0002", "Transfer uang operasional", "SEED-CORR-007", cancellationToken);
    await CreateSuccessTransferAsync(context, users[2], users[6], 250_000m, "TRF-20261115-0003", "Pembayaran desain UI/UX", "SEED-CORR-008", cancellationToken);
    await CreateSuccessTransferAsync(context, users[3], users[7], 100_000m, "TRF-20261115-0004", "Beli pulsa & paket data", "SEED-CORR-009", cancellationToken);

    var rejectedAudit = new AuditLog(
      actorUserId: users[4].Id,
      transactionId: null,
      action: "TRANSFER_REJECTED",
      entityType: "Wallet",
      entityId: users[4].Wallet.Id.ToString(),
      outcome: "REJECTED",
      description: "Transfer ditolak karena saldo wallet tidak mencukupi.",
      correlationId: "SEED-CORR-010"
    );

    await context.AuditLogs.AddAsync(rejectedAudit, cancellationToken);
    await context.SaveChangesAsync(cancellationToken);
  }

  private static async Task CreateSuccessTransferAsync(
    AppDbContext context,
    AppUser sender,
    AppUser receiver,
    decimal amount,
    string referenceNo,
    string description,
    string correlationId,
    CancellationToken cancellationToken)
  {
    var senderWallet = sender.Wallet;
    var receiverWallet = receiver.Wallet;
    var now = DateTime.UtcNow;

    var trx = new Transaction(referenceNo, senderWallet.Id, receiverWallet.Id, "TRANSFER", amount, "SUCCESS", description, now);
    await context.Transactions.AddAsync(trx, cancellationToken);
    await context.SaveChangesAsync(cancellationToken);

    decimal senderBefore = senderWallet.Balance;
    senderWallet.DecreaseBalance(amount);
    decimal senderAfter = senderWallet.Balance;

    var mutationOut = new WalletMutation(trx.Id, senderWallet.Id, "OUT", amount, senderBefore, senderAfter);

    decimal receiverBefore = receiverWallet.Balance;
    receiverWallet.IncreaseBalance(amount);
    decimal receiverAfter = receiverWallet.Balance;

    var mutationIn = new WalletMutation(trx.Id, receiverWallet.Id, "IN", amount, receiverBefore, receiverAfter);

    await context.WalletMutations.AddRangeAsync([mutationOut, mutationIn], cancellationToken);

    var auditTransfer = new AuditLog(
      sender.Id,
      trx.Id,
      "TRANSFER_CREATED",
      "Transaction",
      trx.Id.ToString(),
      "SUCCESS",
      $"Transfer {referenceNo} dari {senderWallet.WalletNumber} ke {receiverWallet.WalletNumber} berhasil.",
      correlationId);

    await context.AuditLogs.AddAsync(auditTransfer, cancellationToken);
    await context.SaveChangesAsync(cancellationToken);
  }
}