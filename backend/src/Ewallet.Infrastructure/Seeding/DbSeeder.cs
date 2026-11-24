using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;
using Ewallet.Infrastructure.Identity;
using Ewallet.Infrastructure.Persistence;

namespace Ewallet.Infrastructure.Seeding;

public static class DbSeeder
{
    public static void Seed(AppDbContext context, IServiceProvider serviceProvider)
    {
        SeedAsync(context, serviceProvider, CancellationToken.None).GetAwaiter().GetResult();
    }

    public static async Task SeedAsync(
      AppDbContext context,
      IServiceProvider serviceProvider,
      CancellationToken cancellationToken = default)
    {
        var configuration = serviceProvider.GetRequiredService<IConfiguration>();
        var identityOptions = serviceProvider.GetService<IOptions<IdentityOptions>>()
          ?? Options.Create(new IdentityOptions());

        using var roleStore = new RoleStore<IdentityRole<long>, AppDbContext, long>(context);
        using var roleManager = new RoleManager<IdentityRole<long>>(
          roleStore,
          [new RoleValidator<IdentityRole<long>>()],
          new UpperInvariantLookupNormalizer(),
          new IdentityErrorDescriber(),
          NullLogger<RoleManager<IdentityRole<long>>>.Instance
        );

        using var userStore = new UserStore<AppUser, IdentityRole<long>, AppDbContext, long>(context);
        using var userManager = new UserManager<AppUser>(
          userStore,
          identityOptions,
          new PasswordHasher<AppUser>(),
          [new UserValidator<AppUser>()],
          [new PasswordValidator<AppUser>()],
          new UpperInvariantLookupNormalizer(),
          new IdentityErrorDescriber(),
          serviceProvider,
          NullLogger<UserManager<AppUser>>.Instance
        );

        var hasExternalTransaction = context.Database.CurrentTransaction is not null;
        await using var dbTransaction = hasExternalTransaction
          ? null
          : await context.Database.BeginTransactionAsync(cancellationToken);

        try
        {
            var paymentMethods = await PaymentMethodSeeder.SeedAsync(context, cancellationToken);
            var customers = await UserWalletSeeder.SeedAsync(context, userManager, roleManager, configuration, cancellationToken);

            await TopUpSeeder.SeedAsync(context, customers, paymentMethods, cancellationToken);
            await TransferSeeder.SeedAsync(context, customers, cancellationToken);

            if (dbTransaction is not null)
            {
                await dbTransaction.CommitAsync(cancellationToken);
            }
        }
        catch
        {
            if (dbTransaction is not null)
            {
                await dbTransaction.RollbackAsync(cancellationToken);
            }

            throw;
        }
    }
}