using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Ewallet.Infrastructure.Identity;
using Ewallet.Infrastructure.Persistence;

namespace Ewallet.Infrastructure.Seeding;

public static class UserWalletSeeder
{
  public static async Task<List<AppUser>> SeedAsync(
    AppDbContext context,
    UserManager<AppUser> userManager,
    RoleManager<IdentityRole<long>> roleManager,
    IConfiguration configuration,
    CancellationToken cancellationToken = default)
  {
    string[] roles = ["ADMIN", "CUSTOMER"];
    foreach (var roleName in roles)
    {
      if (!await roleManager.RoleExistsAsync(roleName))
      {
        var roleResult = await roleManager.CreateAsync(new IdentityRole<long>(roleName));
        if (!roleResult.Succeeded)
        {
          throw new InvalidOperationException(
            $"Gagal membuat role {roleName}: {string.Join(", ", roleResult.Errors.Select(e => e.Description))}");
        }
      }
    }

    if (await context.Users.AnyAsync(cancellationToken))
    {
      return await (
        from u in context.Users.Include(u => u.Wallet)
        join ur in context.UserRoles on u.Id equals ur.UserId
        join r in context.Roles on ur.RoleId equals r.Id
        where r.NormalizedName == "CUSTOMER"
        orderby u.Id
        select u
      ).ToListAsync(cancellationToken);
    }

    // var adminPassword = configuration["Seed:AdminPassword"]
    // ?? throw new InvalidOperationException("Konfigurasi 'Seed:AdminPassword' belum diatur untuk seeding akun ADMIN.");
    var adminPassword = configuration["Seed:AdminPassword"] ?? "AdminEwallet@123";

    var adminUser = new AppUser(
      username: "admin.ewallet",
      fullName: "Administrator Ewallet",
      email: "admin@ewallet.com",
      phone: "081200000000",
      status: "ACTIVE",
      updatedAtUtc: null
    );

    var createAdminResult = await userManager.CreateAsync(adminUser, adminPassword);
    if (!createAdminResult.Succeeded)
    {
      throw new InvalidOperationException(
        $"Gagal membuat akun ADMIN: {string.Join(", ", createAdminResult.Errors.Select(e => e.Description))}");
    }

    await userManager.AddToRoleAsync(adminUser, "ADMIN");

    var defaultCustomerPassword = configuration["Seed:CustomerPassword"] ?? "Customer@123";

    var customersData = new List<(string Username, string FullName, string Email, string Phone, string Status)>
    {
      ("rizal.kadamong", "Mohalim Rizal Kadamong", "rizal@example.com", "081234567801", "ACTIVE"),
      ("budi.santoso", "Budi Santoso", "budi@example.com", "081234567802", "ACTIVE"),
      ("siti.aminah", "Siti Aminah", "siti@example.com", "081234567803", "ACTIVE"),
      ("andi.pratama", "Andi Pratama", "andi@example.com", "081234567804", "ACTIVE"),
      ("dewi.lestari", "Dewi Lestari", "dewi@example.com", "081234567805", "ACTIVE"),
      ("eko.saputra", "Eko Saputra", "eko@example.com", "081234567806", "ACTIVE"),
      ("fitri.handayani", "Fitri Handayani", "fitri@example.com", "081234567807", "ACTIVE"),
      ("gilang.ramadhan", "Gilang Ramadhan", "gilang@example.com", "081234567808", "ACTIVE"),
      ("hani.puspita", "Hani Puspita", "hani@example.com", "081234567809", "ACTIVE"),
      ("irfan.hakim", "Irfan Hakim", "irfan@example.com", "081234567810", "SUSPENDED")
    };

    var seededCustomers = new List<AppUser>();

    for (int i = 0; i < customersData.Count; i++)
    {
      var data = customersData[i];
      var customer = new AppUser(
        username: data.Username,
        fullName: data.FullName,
        email: data.Email,
        phone: data.Phone,
        status: data.Status,
        updatedAtUtc: null
      );

      customer.AssignWallet($"W{i + 1:D3}");

      var createResult = await userManager.CreateAsync(customer, defaultCustomerPassword);
      if (!createResult.Succeeded)
      {
        throw new InvalidOperationException(
          $"Gagal membuat user {data.Username}: {string.Join(", ", createResult.Errors.Select(e => e.Description))}");
      }

      var roleResult = await userManager.AddToRoleAsync(customer, "CUSTOMER");
      if (!roleResult.Succeeded)
      {
        throw new InvalidOperationException(
          $"Gagal menambahkan role CUSTOMER ke {data.Username}: {string.Join(", ", roleResult.Errors.Select(e => e.Description))}");
      }

      seededCustomers.Add(customer);
    }

    return seededCustomers;
  }
}