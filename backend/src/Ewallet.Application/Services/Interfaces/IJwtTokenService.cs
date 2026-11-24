using Ewallet.Application.DTOs;

namespace Ewallet.Application.Services.Interfaces;

public interface IJwtTokenService
{
  IssuedAccessToken IssueAccessToken(AuthUserResponse user);
}