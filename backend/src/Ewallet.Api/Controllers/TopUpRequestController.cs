
using Microsoft.AspNetCore.Mvc;
using Ewallet.Application.DTOs;
using Ewallet.Domain.Entities;
using Ewallet.Application.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Ewallet.Application.Security;

namespace Ewallet.Api.Controllers;

[ApiController]
[Route("api/v1/topup-requests")]
public sealed class TopUpRequestController(ITopUpRequestService service) : ControllerBase
{
  private readonly ITopUpRequestService _service = service;

  [HttpGet]
  [Authorize(Policy = AppPolicies.CanViewAllTopUps)]
  [ProducesResponseType(typeof(IReadOnlyList<TopUpResponse>), StatusCodes.Status200OK)]
  public async Task<ActionResult<IReadOnlyList<TopUpRequest>>> GetAll(CancellationToken cancellationToken)
  {
    var result = await _service.GetAllAsync(cancellationToken);

    return Ok(result);
  }
}