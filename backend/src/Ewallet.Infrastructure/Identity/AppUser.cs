using Ewallet.Domain.Entities;
using Microsoft.AspNetCore.Identity;

namespace Ewallet.Infrastructure.Identity;

public sealed class AppUser : IdentityUser<long>
{
  public string FullName { get; private set; } = null!;
  public string Status { get; private set; } = null!;
  public DateTime CreatedAtUtc { get; private set; }
  public DateTime? UpdatedAtUtc { get; private set; }

  public ICollection<AuditLog> AuditLogs { get; private set; } = [];
  public Wallet Wallet { get; private set; } = null!;

  private AppUser() { }

  public AppUser(string username, string fullName, string email, string phone, string status, DateTime? updatedAtUtc)
  {
    ValidateFields(username, fullName, email, phone, status);

    UserName = username;
    FullName = fullName;
    Email = email;
    PhoneNumber = phone;
    Status = status;
    CreatedAtUtc = DateTime.UtcNow;
    UpdatedAtUtc = updatedAtUtc;
  }

  public void AssignWallet(string walletNumber)
  {
    if (Wallet != null)
      throw new InvalidOperationException("User sudah memiliki wallet.");

    Wallet = new Wallet(walletNumber, 0, "ACTIVE", null);
  }

  public void UpdateDetail(string username, string fullName, string email, string phone, string status)
  {
    ValidateFields(username, fullName, email, phone, status);

    UserName = username;
    FullName = fullName;
    Email = email;
    PhoneNumber = phone;
    Status = status;
    UpdatedAtUtc = DateTime.UtcNow;
  }

  // ============================================

  private static void ValidateFields(string username, string fullName, string email, string phone, string status)
  {
    if (string.IsNullOrWhiteSpace(username))
      throw new ArgumentException("Username wajib diisi", nameof(username));

    if (string.IsNullOrWhiteSpace(fullName))
      throw new ArgumentException("Nama lengkap wajib diisi", nameof(fullName));

    if (string.IsNullOrWhiteSpace(email))
      throw new ArgumentException("Email wajib diisi", nameof(email));

    if (string.IsNullOrWhiteSpace(phone))
      throw new ArgumentException("Nomor HP wajib diisi", nameof(phone));

    if (string.IsNullOrWhiteSpace(status))
      throw new ArgumentException("Status wajib diisi", nameof(status));
  }
}