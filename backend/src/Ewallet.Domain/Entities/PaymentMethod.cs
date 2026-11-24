namespace Ewallet.Domain.Entities;

public sealed class PaymentMethod
{
  public int Id { get; private set; }
  public string Code { get; private set; } = null!;
  public string Name { get; private set; } = null!;
  public string? ProviderName { get; private set; }
  public bool IsActive { get; private set; }
  public DateTime CreatedAtUtc { get; private set; }

  public ICollection<TopUpRequest>? TopUpRequests { get; private set; } = [];

  private PaymentMethod() { }

  public PaymentMethod(string code, string name, string? providerName, bool isActive)
  {
    if (string.IsNullOrWhiteSpace(code))
    {
      throw new ArgumentException("Code wajib diisi", nameof(code));
    }
    if (string.IsNullOrWhiteSpace(name))
    {
      throw new ArgumentException("Nama wajib diisi", nameof(name));
    }

    Code = code;
    Name = name;
    ProviderName = providerName;
    IsActive = isActive;
  }
}