using System.ComponentModel.DataAnnotations;

namespace Ewallet.Application.DTOs;

public sealed record AuthUserResponse(
  long Id,
  string Email,
  string FullName,
  IReadOnlyList<string> Roles
);

public sealed record CurrentUserResponse(
  long Id,
  string Email,
  IReadOnlyList<string> Roles
);

public sealed class LoginRequest
{
  [Required, EmailAddress]
  public string Email { get; init; } = string.Empty;

  [Required]
  public string Password { get; init; } = string.Empty;
}

public sealed record LoginResponse(
  string Message,
  AuthUserResponse User,
  string AccessToken,
  string TokenType,
  DateTimeOffset ExpiresAtUtc
);

public sealed record LoginResults(
  bool Succeeded,
  AuthUserResponse? User
);

public sealed record IssuedAccessToken(
  string AccessToken,
  DateTimeOffset ExpiredAtUtc
);

public sealed record RefreshTokenSessionResult(
  AuthUserResponse User,
  IssuedAccessToken AccessToken,
  string RawRefreshToken,
  DateTimeOffset RefreshExpiredAtUtc
);

public sealed class RegisterRequest
{
  [Required]
  [StringLength(100, MinimumLength = 5)]
  public string Username { get; init; } = string.Empty;

  [Required]
  [StringLength(100, MinimumLength = 8)]
  [EmailAddress]
  public string Email { get; init; } = string.Empty;

  [Required]
  [StringLength(50, MinimumLength = 8)]
  public string Password { get; init; } = string.Empty;

  [Required]
  [StringLength(50, MinimumLength = 8)]
  public string PasswordConfirm { get; init; } = string.Empty;

  [Required]
  [StringLength(25, MinimumLength = 11)]
  public string PhoneNumber { get; init; } = string.Empty;

  [Required]
  [StringLength(120, MinimumLength = 5)]
  public string FullName { get; init; } = string.Empty;
}

public enum RegisterStatus
{
  Created, DuplicateEmail, ValidationError
}

public sealed record RegisterResult(
  RegisterStatus Status,
  AuthUserResponse? User,
  string[] Error
);