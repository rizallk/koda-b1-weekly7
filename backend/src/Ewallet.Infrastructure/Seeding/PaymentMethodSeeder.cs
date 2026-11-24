using Microsoft.EntityFrameworkCore;
using Ewallet.Infrastructure.Persistence;
using Ewallet.Domain.Entities;

namespace Ewallet.Infrastructure.Seeding;

public static class PaymentMethodSeeder
{
  public static Dictionary<string, PaymentMethod> Seed(AppDbContext context)
  {
    if (context.PaymentMethods.Any())
    {
      return context.PaymentMethods.ToDictionary(pm => pm.Code);
    }

    var methods = GetInitialPaymentMethods();
    context.PaymentMethods.AddRange(methods);
    context.SaveChanges();

    return methods.ToDictionary(pm => pm.Code);
  }

  public static async Task<Dictionary<string, PaymentMethod>> SeedAsync(AppDbContext context, CancellationToken cancellationToken = default)
  {
    if (await context.PaymentMethods.AnyAsync(cancellationToken))
    {
      return await context.PaymentMethods.ToDictionaryAsync(pm => pm.Code, cancellationToken);
    }

    var methods = GetInitialPaymentMethods();
    await context.PaymentMethods.AddRangeAsync(methods, cancellationToken);
    await context.SaveChangesAsync(cancellationToken);

    return methods.ToDictionary(pm => pm.Code);
  }

  private static List<PaymentMethod> GetInitialPaymentMethods() =>
  [
      new("BANK_TRANSFER", "Virtual Account Bank Transfer", "BCA / Mandiri VA", true),
        new("QRIS", "QRIS Instant Payment", "GPN / QRIS", true),
        new("EWALLET_LINK", "Direct E-Wallet Link", "OVO / GoPay", false)
  ];
}