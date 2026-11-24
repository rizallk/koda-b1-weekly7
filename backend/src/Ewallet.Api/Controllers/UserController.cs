using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Ewallet.Application.DTOs;
using Ewallet.Application.Services.Interfaces;
using Ewallet.Application.Security;

namespace Ewallet.Api.Controllers;

[ApiController]
[Route("api/v1/users")]
[Authorize]
public sealed class UserController(IUserService service) : ControllerBase
{
  private readonly IUserService _service = service;

  [HttpGet("profile")]
  [ProducesResponseType(typeof(UserResponse), StatusCodes.Status200OK)]
  [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
  public async Task<ActionResult<UserResponse>> GetProfile(CancellationToken cancellationToken)
  {
    var userId = GetCurrentUserId();
    if (userId is null) return Unauthorized();

    var user = await _service.GetUserByIdAsync(userId.Value, cancellationToken);
    return user is null
      ? Problem(statusCode: StatusCodes.Status404NotFound, title: "User not found")
      : Ok(user);
  }

  [HttpPut("profile")]
  [ProducesResponseType(typeof(UserResponse), StatusCodes.Status200OK)]
  [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
  [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
  public async Task<ActionResult<UserResponse>> UpdateProfile(
    [FromBody] UserUpdateRequest request,
    CancellationToken cancellationToken)
  {
    var userId = GetCurrentUserId();
    if (userId is null) return Unauthorized();

    try
    {
      var (succeeded, updated, errors) = await _service.UpdateUserAsync(userId.Value, request, cancellationToken);

      if (!succeeded)
      {
        return Problem(
          statusCode: StatusCodes.Status400BadRequest,
          title: "Gagal memperbarui profil",
          detail: string.Join(" ", errors)
        );
      }

      return Ok(updated);
    }
    catch (DbUpdateException e) when (e.InnerException is SqlException { Number: 2601 or 2627 })
    {
      return Problem(
        statusCode: StatusCodes.Status409Conflict,
        title: "Data duplikat",
        detail: "Username, email, atau nomor HP sudah digunakan."
      );
    }
    catch (ArgumentException e)
    {
      return Problem(
        statusCode: StatusCodes.Status400BadRequest,
        title: "Invalid user data!",
        detail: e.Message
      );
    }
  }

  [HttpGet("me/transactions")]
  [Authorize(Policy = AppPolicies.CanViewOwnTransactions)]
  [ProducesResponseType(typeof(PagedResponse<TransactionResponse>), StatusCodes.Status200OK)]
  [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
  public async Task<ActionResult<PagedResponse<TransactionResponse>>> GetMyTransactions(
    [FromQuery] TransactionFilterRequest filter,
    CancellationToken cancellationToken)
  {
    var userId = GetCurrentUserId();
    if (userId is null) return Unauthorized();

    var result = await _service.GetMyTransactionsAsync(userId.Value, filter, cancellationToken);
    return result is null
      ? Problem(statusCode: StatusCodes.Status404NotFound, title: "Wallet not found")
      : Ok(result);
  }

  [HttpGet("me/mutations")]
  [Authorize(Policy = AppPolicies.CanViewOwnMutations)]
  [ProducesResponseType(typeof(PagedResponse<WalletMutationResponse>), StatusCodes.Status200OK)]
  [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
  public async Task<ActionResult<PagedResponse<WalletMutationResponse>>> GetMyMutations(
    [FromQuery] WalletMutationFilterRequest filter,
    CancellationToken cancellationToken)
  {
    var userId = GetCurrentUserId();
    if (userId is null) return Unauthorized();

    var result = await _service.GetMyMutationsAsync(userId.Value, filter, cancellationToken);
    return result is null
      ? Problem(statusCode: StatusCodes.Status404NotFound, title: "Wallet not found")
      : Ok(result);
  }

  [HttpGet]
  [Authorize(Policy = AppPolicies.CanManageUsers)]
  [ProducesResponseType(typeof(PagedResponse<UserResponse>), StatusCodes.Status200OK)]
  public async Task<ActionResult<PagedResponse<UserResponse>>> GetAll(
    [FromQuery] UserFilterRequest filter,
    CancellationToken cancellationToken)
  {
    var users = await _service.GetAllUsersAsync(filter, cancellationToken);
    return Ok(users);
  }

  [HttpGet("{id:long}")]
  [Authorize(Policy = AppPolicies.CanManageUsers)]
  [ProducesResponseType(typeof(UserResponse), StatusCodes.Status200OK)]
  [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
  public async Task<ActionResult<UserResponse>> GetById(
    [FromRoute] long id,
    CancellationToken cancellationToken)
  {
    var user = await _service.GetUserByIdAsync(id, cancellationToken);
    return user is null
      ? Problem(statusCode: StatusCodes.Status404NotFound, title: "User not found")
      : Ok(user);
  }

  [HttpPatch("{id:long}/status")]
  [Authorize(Policy = AppPolicies.CanManageUsers)]
  [ProducesResponseType(typeof(UserResponse), StatusCodes.Status200OK)]
  [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
  [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
  public async Task<ActionResult<UserResponse>> UpdateStatus(
    [FromRoute] long id,
    [FromBody] UpdateUserStatusRequest request,
    CancellationToken cancellationToken)
  {
    var adminId = GetCurrentUserId();
    if (adminId is null) return Unauthorized();

    var (succeeded, updated, error) = await _service.UpdateUserStatusAsync(
      adminId.Value,
      id,
      request,
      HttpContext.TraceIdentifier,
      cancellationToken);

    if (!succeeded)
    {
      if (error == "User tidak ditemukan.")
      {
        return Problem(statusCode: StatusCodes.Status404NotFound, title: error);
      }

      return Problem(
        statusCode: StatusCodes.Status400BadRequest,
        title: "Gagal mengubah status user",
        detail: error
      );
    }

    return Ok(updated);
  }

  private long? GetCurrentUserId()
  {
    var subject = User.FindFirstValue(JwtRegisteredClaimNames.Sub) ?? User.FindFirstValue(ClaimTypes.NameIdentifier);
    return long.TryParse(subject, out var userId) ? userId : null;
  }
}