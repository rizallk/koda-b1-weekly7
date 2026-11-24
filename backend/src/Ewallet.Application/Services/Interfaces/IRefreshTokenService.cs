using Ewallet.Application.DTOs;

namespace Ewallet.Application.Services.Interfaces;

public interface IRefreshTokenService
{
  Task<RefreshTokenSessionResult> CreateSessionAsync(AuthUserResponse user, CancellationToken ct = default);
  Task<RefreshTokenSessionResult> RotateAsync(string rawRefreshToken, CancellationToken ct = default);
  Task RevokeFamilyAsync(string rawRefreshToken, CancellationToken ct = default);

}