using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Ewallet.Application.Interfaces;
using Ewallet.Application.Repositories;
using Ewallet.Infrastructure.Persistence;
using Ewallet.Infrastructure.Repositories;
using Ewallet.Infrastructure.Identity;
using Ewallet.Application.Services.Interfaces;
using Ewallet.Infrastructure.Seeding;

namespace EWallet.Infrastructure;

public static class DepedencyInjection
{
  public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
  {
    // Db config
    var connectionString = configuration.GetConnectionString("ewallet") ?? throw new InvalidOperationException("ConnectionString : Belum dikonfigurasi");

    services.AddDbContext<AppDbContext>((serviceProvider, options) =>
     {
       options.UseSqlServer(connectionString)
         .UseSeeding((context, _) =>
         {
           DbSeeder.Seed((AppDbContext)context, serviceProvider);
         })
         .UseAsyncSeeding(async (context, _, cancellationToken) =>
         {
           await DbSeeder.SeedAsync((AppDbContext)context, serviceProvider, cancellationToken);
         });
     });

    // Unit of work
    services.AddScoped<IUnitOfWork, UnitOfWork>();

    // Repository
    services.AddScoped<IWalletRepository, WalletRepository>();
    services.AddScoped<ITransactionRepository, TransactionRepository>();
    services.AddScoped<IWalletMutationRepository, WalletMutationRepository>();
    services.AddScoped<IPaymentMethodRepository, PaymentMethodRepository>();
    services.AddScoped<ITopUpRequestRepository, TopUpRequestRepository>();

    // Auth / Identity
    services.AddIdentityCore<AppUser>(options =>
        {
          options.User.RequireUniqueEmail = true;
          options.Password.RequiredLength = 8;
          options.Password.RequireDigit = true;
          options.Password.RequireLowercase = true;
          options.Password.RequireUppercase = true;
          options.Password.RequireNonAlphanumeric = true;
          options.Password.RequiredUniqueChars = 4;

          options.SignIn.RequireConfirmedEmail = false;
        }).AddRoles<IdentityRole<long>>()
        .AddEntityFrameworkStores<AppDbContext>();

    services.AddScoped<IAuthService, IdentityAuthService>();
    services.Configure<JwtOptions>(configuration.GetSection(JwtOptions.SectionName));
    services.AddScoped<IJwtTokenService, JwtTokenService>();
    services.AddScoped<IRefreshTokenService, RefreshTokenService>();
    return services;
  }

  // ============================================

  public static async Task InitializeDatabaseAsync(
    this IServiceProvider serviceProvider,
    CancellationToken cancellationToken = default)
  {
    using var scope = serviceProvider.CreateScope();
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();

    await dbContext.Database.MigrateAsync(cancellationToken);
  }
}