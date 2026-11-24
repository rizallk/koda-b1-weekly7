using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Ewallet.Domain.Entities;
using Ewallet.Infrastructure.Identity;

namespace Ewallet.Infrastructure.Persistence;

public sealed class AppDbContext(DbContextOptions<AppDbContext> options) : IdentityDbContext<AppUser, IdentityRole<long>, long>(options)
{
  public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
  public DbSet<PaymentMethod> PaymentMethods => Set<PaymentMethod>();
  public DbSet<TopUpRequest> TopUpRequests => Set<TopUpRequest>();
  public DbSet<Transaction> Transactions => Set<Transaction>();
  public DbSet<Wallet> Wallets => Set<Wallet>();
  public DbSet<WalletMutation> WalletMutations => Set<WalletMutation>();
  public DbSet<RefreshToken> RefreshToken => Set<RefreshToken>();

  protected override void OnModelCreating(ModelBuilder modelBuilder)
  {
    base.OnModelCreating(modelBuilder);

    // AuditLog
    modelBuilder.Entity<AuditLog>(entity =>
    {
      entity.ToTable("AuditLogs", "dbo");

      entity.HasKey(a => a.Id);
      entity.Property(a => a.Id).UseIdentityColumn();
      entity.Property(a => a.Action).HasMaxLength(60).IsRequired();
      entity.Property(a => a.EntityType).HasMaxLength(60).IsRequired();
      entity.Property(a => a.EntityId).HasMaxLength(60);
      entity.Property(a => a.Outcome).HasMaxLength(20).IsRequired();
      entity.Property(a => a.Description).HasMaxLength(500);
      entity.Property(a => a.CorrelationId).HasMaxLength(100);
      entity.Property(a => a.CreatedAtUtc).HasColumnType("datetime2").HasDefaultValueSql("SYSUTCDATETIME()").IsRequired();

      entity.HasIndex(a => new { a.ActorUserId, a.CreatedAtUtc }).IsDescending(false, true);

      // entity.HasOne(a => a.User)
      entity.HasOne<AppUser>()
            .WithMany(u => u.AuditLogs)
            .HasForeignKey(a => a.ActorUserId)
            .OnDelete(DeleteBehavior.SetNull);

      entity.HasOne(a => a.Transaction)
            .WithMany(t => t.AuditLogs)
            .HasForeignKey(a => a.TransactionId)
            .OnDelete(DeleteBehavior.SetNull);
    });

    // Payment Method
    modelBuilder.Entity<PaymentMethod>(entity =>
    {
      entity.ToTable("PaymentMethods", "dbo");

      entity.HasKey(pm => pm.Id);
      entity.Property(pm => pm.Id).UseIdentityColumn();
      entity.Property(pm => pm.Code).HasMaxLength(30).IsRequired();
      entity.Property(pm => pm.Name).HasMaxLength(100).IsRequired();
      entity.Property(pm => pm.ProviderName).HasMaxLength(100);
      entity.Property(pm => pm.IsActive).IsRequired();
      entity.Property(pm => pm.CreatedAtUtc).HasColumnType("datetime2").HasDefaultValueSql("SYSUTCDATETIME()").IsRequired();

      entity.HasIndex(pm => pm.Code).IsUnique();
    });

    // Top Up Request
    modelBuilder.Entity<TopUpRequest>(entity =>
    {
      entity.ToTable("TopUpRequests", "dbo", t =>
      {
        t.HasCheckConstraint("CK_TopUpRequests_Amount", "[Amount] > 0");
        t.HasCheckConstraint("CK_TopUpRequests_Status", "[Status] IN ('PENDING', 'PAID', 'FAILED', 'EXPIRED')");
      });

      entity.HasKey(tr => tr.Id);
      entity.Property(tr => tr.Id).UseIdentityColumn();
      entity.Property(tr => tr.TransactionId).IsRequired();
      entity.Property(tr => tr.WalletId).IsRequired();
      entity.Property(tr => tr.PaymentMethodId).IsRequired();
      entity.Property(tr => tr.Amount).HasPrecision(18, 2).IsRequired();
      entity.Property(tr => tr.Status).HasMaxLength(20).IsUnicode(false).IsRequired();
      entity.Property(tr => tr.ProviderReference).HasMaxLength(100);
      entity.Property(tr => tr.CreatedAtUtc).HasColumnType("datetime2").HasDefaultValueSql("SYSUTCDATETIME()").IsRequired();
      entity.Property(tr => tr.ExpiresAtUtc).HasColumnType("datetime2");
      entity.Property(tr => tr.PaidAtUtc).HasColumnType("datetime2");

      entity.HasIndex(tr => tr.TransactionId).IsUnique();

      entity.HasOne(tr => tr.Transaction)
            .WithOne(t => t.TopUpRequest)
            .HasForeignKey<TopUpRequest>(tr => tr.TransactionId)
            .OnDelete(DeleteBehavior.Restrict);

      entity.HasOne(tr => tr.Wallet)
            .WithMany(w => w.TopUpRequests)
            .HasForeignKey(tr => tr.WalletId)
            .OnDelete(DeleteBehavior.Restrict);

      entity.HasOne(tr => tr.PaymentMethod)
            .WithMany(pm => pm.TopUpRequests)
            .HasForeignKey(tr => tr.PaymentMethodId)
            .OnDelete(DeleteBehavior.Restrict);
    });

    // Transaction
    modelBuilder.Entity<Transaction>(entity =>
    {
      entity.ToTable("Transactions", "dbo", t =>
      {
        t.HasCheckConstraint("CK_Transactions_Amount", "[Amount] > 0");
        t.HasCheckConstraint("CK_Transactions_Type", "[Type] IN ('TOPUP', 'TRANSFER')");
        t.HasCheckConstraint("CK_Transactions_Status", "[Status] IN ('PENDING', 'SUCCESS', 'FAILED')");
        t.HasCheckConstraint(
          "CK_Transactions_Type_Wallets",
          "([Type] = 'TOPUP' AND [SenderWalletId] IS NULL AND [ReceiverWalletId] IS NOT NULL) OR " +
          "([Type] = 'TRANSFER' AND [SenderWalletId] IS NOT NULL AND [ReceiverWalletId] IS NOT NULL AND [SenderWalletId] <> [ReceiverWalletId])"
        );
      });

      entity.HasKey(t => t.Id);
      entity.Property(t => t.Id).UseIdentityColumn();
      entity.Property(t => t.ReferenceNo).HasMaxLength(50).IsRequired();
      entity.Property(t => t.SenderWalletId);
      entity.Property(t => t.ReceiverWalletId).IsRequired();
      entity.Property(t => t.Type).HasMaxLength(20).IsUnicode(false).IsRequired();
      entity.Property(t => t.Amount).HasPrecision(18, 2).IsRequired();
      entity.Property(t => t.Status).HasMaxLength(20).IsUnicode(false).IsRequired();
      entity.Property(t => t.Description).HasMaxLength(255);
      entity.Property(t => t.CreatedAtUtc).HasColumnType("datetime2").HasDefaultValueSql("SYSUTCDATETIME()").IsRequired();
      entity.Property(t => t.CompletedAtUtc).HasColumnType("datetime2");

      entity.HasIndex(t => t.ReferenceNo).IsUnique();
      entity.HasIndex(t => new { t.SenderWalletId, t.CreatedAtUtc }).IsDescending(false, true);
      entity.HasIndex(t => new { t.ReceiverWalletId, t.CreatedAtUtc }).IsDescending(false, true);

      entity.HasOne(t => t.SenderWallet)
            .WithMany()
            .HasForeignKey(t => t.SenderWalletId)
            .OnDelete(DeleteBehavior.Restrict);

      entity.HasOne(t => t.ReceiverWallet)
            .WithMany(w => w.Transactions)
            .HasForeignKey(t => t.ReceiverWalletId)
            .OnDelete(DeleteBehavior.Restrict);
    });

    // User
    modelBuilder.Entity<AppUser>(entity =>
    {
      entity.Property(u => u.FullName).HasMaxLength(100).IsRequired();
      entity.Property(u => u.Status).HasMaxLength(20).IsUnicode(false).IsRequired();
      entity.Property(u => u.CreatedAtUtc).HasColumnType("datetime2").HasDefaultValueSql("SYSUTCDATETIME()").IsRequired();
      entity.Property(u => u.UpdatedAtUtc).HasColumnType("datetime2");

      entity.HasIndex(u => u.PhoneNumber).IsUnique();
    });

    // RefreshToken
    modelBuilder.Entity<RefreshToken>(entity =>
    {
      entity.ToTable("RefreshTokens", "dbo");
      entity.HasKey(token => token.Id);
      entity.Property(token => token.Id)
              .ValueGeneratedNever();
      entity.Property(token => token.TokenHash)
              .HasMaxLength(64)
              .IsUnicode(false).IsRequired();
      entity.HasIndex(token => token.TokenHash)
              .IsUnique();
      entity.HasIndex(token => new
      {
        token.UserId,
        token.FamilyId
      });
      entity.HasIndex(token => token.FamilyId);

      entity.HasOne(token => token.User)
              .WithMany()
              .HasForeignKey(token => token.UserId)
              .OnDelete(DeleteBehavior.Cascade);

      entity.Property(token => token.CreatedAtUtc)
              .HasColumnType("datetimeoffset");
      entity.Property(token => token.ExpiresAtUtc)
              .HasColumnType("datetimeoffset");
      entity.Property(token => token.UsedAtUtc)
              .HasColumnType("datetimeoffset");
      entity.Property(token => token.RevokedAtUtc)
              .HasColumnType("datetimeoffset");
    });

    // Wallet
    modelBuilder.Entity<Wallet>(entity =>
    {
      entity.ToTable("Wallets", "dbo", t =>
      {
        t.HasCheckConstraint("CK_Wallets_Balance", "[Balance] >= 0");
        t.HasCheckConstraint("CK_Wallets_Status", "[Status] IN ('ACTIVE', 'FROZEN', 'CLOSED')");
      });

      entity.HasKey(w => w.Id);
      entity.Property(w => w.Id).UseIdentityColumn();
      entity.Property(w => w.UserId).IsRequired();
      entity.Property(w => w.WalletNumber).HasMaxLength(30).IsRequired();
      entity.Property(w => w.Balance).HasPrecision(18, 2).IsRequired();
      entity.Property(w => w.Status).HasMaxLength(20).IsUnicode(false).IsRequired();
      entity.Property(w => w.RowVersion).IsRowVersion().IsRequired();
      entity.Property(w => w.CreatedAtUtc).HasColumnType("datetime2").HasDefaultValueSql("SYSUTCDATETIME()").IsRequired();
      entity.Property(w => w.UpdatedAtUtc).HasColumnType("datetime2");

      entity.HasIndex(w => w.UserId).IsUnique();
      entity.HasIndex(w => w.WalletNumber).IsUnique();

      // entity.HasOne(w => w.User)
      entity.HasOne<AppUser>()
            .WithOne(u => u.Wallet)
            .HasForeignKey<Wallet>(w => w.UserId)
            .OnDelete(DeleteBehavior.Restrict);
    });

    // Wallet Mutation
    modelBuilder.Entity<WalletMutation>(entity =>
    {
      entity.ToTable("WalletMutations", "dbo", t =>
      {
        t.HasCheckConstraint("CK_WalletMutations_Amount", "[Amount] > 0");
        t.HasCheckConstraint("CK_WalletMutations_BalanceBefore", "[BalanceBefore] >= 0");
        t.HasCheckConstraint("CK_WalletMutations_BalanceAfter", "[BalanceAfter] >= 0");
        t.HasCheckConstraint("CK_WalletMutations_Direction", "[Direction] IN ('IN', 'OUT')");
        t.HasCheckConstraint(
          "CK_WalletMutations_BalanceConsistency",
          "([Direction] = 'IN' AND [BalanceAfter] = [BalanceBefore] + [Amount]) OR " +
          "([Direction] = 'OUT' AND [BalanceAfter] = [BalanceBefore] - [Amount])"
        );
      });

      entity.HasKey(wm => wm.Id);
      entity.Property(wm => wm.Id).UseIdentityColumn();
      entity.Property(wm => wm.TransactionId).IsRequired();
      entity.Property(wm => wm.WalletId).IsRequired();
      entity.Property(wm => wm.Direction).HasMaxLength(3).IsUnicode(false).IsRequired();
      entity.Property(wm => wm.Amount).HasPrecision(18, 2).IsRequired();
      entity.Property(wm => wm.BalanceBefore).HasPrecision(18, 2).IsRequired();
      entity.Property(wm => wm.BalanceAfter).HasPrecision(18, 2).IsRequired();
      entity.Property(wm => wm.CreatedAtUtc).HasColumnType("datetime2").HasDefaultValueSql("SYSUTCDATETIME()").IsRequired();

      entity.HasIndex(wm => new { wm.TransactionId, wm.WalletId }).IsUnique();
      entity.HasIndex(wm => new { wm.WalletId, wm.CreatedAtUtc, wm.Id }).IsDescending(false, true, true);

      entity.HasOne(wm => wm.Transaction)
            .WithMany(t => t.WalletMutation)
            .HasForeignKey(wm => wm.TransactionId)
            .OnDelete(DeleteBehavior.Restrict);

      entity.HasOne(wm => wm.Wallet)
            .WithMany(w => w.WalletMutations)
            .HasForeignKey(wm => wm.WalletId)
            .OnDelete(DeleteBehavior.Restrict);
    });
  }
}