namespace Ewallet.Api.Middlewares;

public sealed class CorrelationIdMiddleware(RequestDelegate next)
{
  public const string HeaderName = "X-Correlation-ID";
  private readonly RequestDelegate _next = next;

  public async Task InvokeAsync(HttpContext context)
  {
    var clientCorrelationId = context.Request.Headers[HeaderName].FirstOrDefault();

    var correlationId = !string.IsNullOrWhiteSpace(clientCorrelationId) && clientCorrelationId.Length <= 100
      ? clientCorrelationId.Trim()
      : Guid.NewGuid().ToString();

    context.Items[HeaderName] = correlationId;
    context.Response.Headers[HeaderName] = correlationId;

    await _next(context);
  }
}

public static class CorrelationIdMiddlewareExtensions
{
  public static IApplicationBuilder UseCorrelationId(this IApplicationBuilder app)
  {
    return app.UseMiddleware<CorrelationIdMiddleware>();
  }
}