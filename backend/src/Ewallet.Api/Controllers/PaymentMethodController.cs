
using Microsoft.AspNetCore.Mvc;
using Ewallet.Application.DTOs;
using Ewallet.Domain.Entities;
using Ewallet.Application.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;

namespace Ewallet.Api.Controllers;

[ApiController]
[Route("api/v1/payment-methods")]
[Authorize]
public sealed class PaymentMethodController(IPaymentMethodService service) : ControllerBase
{
  private readonly IPaymentMethodService _service = service;

  [HttpGet]
  [ProducesResponseType(typeof(IReadOnlyList<PaymentMethodResponse>), StatusCodes.Status200OK)]
  public async Task<ActionResult<IReadOnlyList<PaymentMethod>>> GetAll([FromQuery] PaymentMethodFilterRequest filter, CancellationToken cancellationToken)
  {
    var result = await _service.GetAllAsync(filter, cancellationToken);

    return Ok(result);
  }
}