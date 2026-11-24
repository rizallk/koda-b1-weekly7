using Microsoft.AspNetCore.Mvc;
using Ewallet.Application.DTOs;
using Ewallet.Api.Middlewares;
using Ewallet.Application.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Ewallet.Application.Security;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;

namespace Ewallet.Api.Controllers;

[ApiController]
[Route("api/v1/transfers")]
[Authorize(Policy = AppPolicies.CanTransfer)]
public sealed class TransferController(ITransferService service) : Controller
{
  private readonly ITransferService _service = service;

  [HttpPost]
  [ProducesResponseType(StatusCodes.Status200OK)]
  [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
  [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
  public async Task<ActionResult> Transfer(
      [FromBody] TransferRequest request, CancellationToken cancellationToken)
  {
    var actorUserId = GetCurrentUserId();
    if (actorUserId is null) return Unauthorized();

    try
    {
      var correlationId = HttpContext.Items[CorrelationIdMiddleware.HeaderName]?.ToString();

      var updated = await _service.TransferAsync(actorUserId.Value, request, correlationId, cancellationToken);

      if (updated is null)
      {
        return Problem(
            statusCode: StatusCodes.Status404NotFound,
            title: "Wallet not found",
            detail: $"Sender wallet ({request.SenderWalletId}) or Receiver wallet ({request.ReceiverWalletId}) was not found.");
      }

      return Ok(updated);
    }
    catch (UnauthorizedAccessException e)
    {
      return Problem(
          statusCode: StatusCodes.Status403Forbidden,
          title: "Forbidden",
          detail: e.Message);
    }
    catch (ArgumentException e)
    {
      return Problem(
          statusCode: StatusCodes.Status400BadRequest,
          title: "Invalid transfer data",
          detail: e.Message);
    }
    catch (InvalidOperationException e)
    {
      return Problem(
          statusCode: StatusCodes.Status400BadRequest,
          title: "Transfer failed",
          detail: e.Message);
    }
  }

  private long? GetCurrentUserId()
  {
    var subject = User.FindFirstValue(JwtRegisteredClaimNames.Sub)
                  ?? User.FindFirstValue(ClaimTypes.NameIdentifier);
    return long.TryParse(subject, out var userId) ? userId : null;
  }
}