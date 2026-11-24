using Ewallet.Application.DTOs;

namespace Ewallet.Application.Services.Interfaces;

public interface IAuthService
{
  Task<RegisterResult> RegisterAsync(
     RegisterRequest request, CancellationToken ct = default
 );

  Task<LoginResults> LoginAsync(
      LoginRequest request, CancellationToken ct = default
  );
}