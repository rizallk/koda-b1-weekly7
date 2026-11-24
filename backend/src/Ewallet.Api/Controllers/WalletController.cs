using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Ewallet.Api.Middlewares;
using Ewallet.Application.DTOs;
using Ewallet.Application.Services.Interfaces;
using Ewallet.Application.Security;

namespace Ewallet.Api.Controllers;

[ApiController]
[Route("api/v1/wallets")]
[Authorize(Policy = AppPolicies.CanManageOwnWallet)]
public sealed class WalletController(IWalletService service) : ControllerBase
{
  private readonly IWalletService _service = service;

  [HttpGet("me")]
  [ProducesResponseType(typeof(WalletResponse), StatusCodes.Status200OK)]
  [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
  public async Task<ActionResult<WalletResponse>> GetMyWallet(CancellationToken cancellationToken)
  {
    var userId = GetCurrentUserId();
    if (userId is null) return Unauthorized();

    var wallet = await _service.GetByUserIdAsync(userId.Value, cancellationToken);

    return wallet is null
      ? Problem(statusCode: StatusCodes.Status404NotFound, title: "Wallet not found")
      : Ok(wallet);
  }

  // Lookup penerima sebelum transfer berdasarkan nomor wallet
  [HttpGet("lookup/{walletNumber}")]
  [ProducesResponseType(typeof(RecipientWalletResponse), StatusCodes.Status200OK)]
  [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
  public async Task<ActionResult<RecipientWalletResponse>> LookupByWalletNumber(
    [FromRoute] string walletNumber,
    CancellationToken cancellationToken)
  {
    var recipient = await _service.GetRecipientByWalletNumberAsync(walletNumber, cancellationToken);

    return recipient is null
      ? Problem(statusCode: StatusCodes.Status404NotFound, title: "Recipient wallet not found")
      : Ok(recipient);
  }

  // Top Up Request milik user yang sedang login
  [HttpPost("me/topup")]
  [ProducesResponseType(typeof(TopUpResponse), StatusCodes.Status200OK)]
  [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
  [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
  public async Task<ActionResult<TopUpResponse>> RequestTopUp(
    [FromBody] TopUpRequestDto request,
    CancellationToken cancellationToken)
  {
    var userId = GetCurrentUserId();
    if (userId is null) return Unauthorized();

    try
    {
      var correlationId = HttpContext.Items[CorrelationIdMiddleware.HeaderName]?.ToString();

      var result = await _service.RequestTopUpAsync(userId.Value, request, correlationId, cancellationToken);

      return result is null
        ? Problem(statusCode: StatusCodes.Status404NotFound, title: "Wallet not found", detail: "Wallet tidak ditemukan atau tidak aktif.")
        : Ok(result);
    }
    catch (InvalidOperationException e)
    {
      return BadRequest(new { statusCode = StatusCodes.Status400BadRequest, message = e.Message });
    }
    catch (ArgumentException e)
    {
      return Problem(
        statusCode: StatusCodes.Status400BadRequest,
        title: "Invalid wallet data!",
        detail: e.Message);
    }
  }

  // Top Up Confirm
  [HttpPost("topup/{topUpRequestId:long}/confirm")]
  [ProducesResponseType(typeof(WalletResponse), StatusCodes.Status200OK)]
  [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
  [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
  [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
  public async Task<IActionResult> ConfirmTopUp(
    [FromRoute] long topUpRequestId,
    CancellationToken cancellationToken)
  {
    var actorUserId = GetCurrentUserId();
    if (actorUserId is null) return Unauthorized();

    var correlationId = HttpContext.Items[CorrelationIdMiddleware.HeaderName]?.ToString();

    try
    {
      var updatedWallet = await _service.ConfirmTopUpAsync(
        topUpRequestId,
        actorUserId.Value,
        correlationId,
        cancellationToken);

      if (updatedWallet is null)
        return NotFound(new { message = $"Permintaan top up dengan ID {topUpRequestId} tidak ditemukan." });

      return Ok(updatedWallet);
    }
    catch (InvalidOperationException ex)
    {
      return BadRequest(new { message = ex.Message });
    }
    catch (KeyNotFoundException ex)
    {
      return NotFound(new { message = ex.Message });
    }
    catch (DbUpdateConcurrencyException)
    {
      return Conflict(new { message = "Terjadi konflik pembaruan saldo secara bersamaan. Silakan muat ulang data dan coba lagi." });
    }
  }

  private long? GetCurrentUserId()
  {
    var subject = User.FindFirstValue(JwtRegisteredClaimNames.Sub)
                  ?? User.FindFirstValue(ClaimTypes.NameIdentifier);
    return long.TryParse(subject, out var userId) ? userId : null;
  }
}