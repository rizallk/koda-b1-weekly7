using Ewallet.Api.Middlewares;
using Ewallet.Application.Services;
using Ewallet.Application.Services.Interfaces;
using Ewallet.Infrastructure.Identity;
using System.Threading.RateLimiting;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using System.IdentityModel.Tokens.Jwt;
using EWallet.Infrastructure;
using Ewallet.Application.Security;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();

// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
builder.Services.AddProblemDetails(
    option =>
    {
      option.CustomizeProblemDetails = context =>
      {
        context.ProblemDetails.Instance ??= context.HttpContext.Request.Path.Value;

        context.ProblemDetails.Extensions["traceId"] = context.HttpContext.TraceIdentifier;
      };
    }
);

builder.Services.AddExceptionHandler<GlobalExceptionHandler>();

builder.Services.AddInfrastructure(builder.Configuration);


var jwtOption = builder.Configuration
    .GetSection(JwtOptions
    .SectionName).Get<JwtOptions>() ?? throw new InvalidOperationException("Konfigurasi JWT belum tersedia");

if (string.IsNullOrWhiteSpace(jwtOption.Issuer))
{
  throw new InvalidOperationException("Jwt: Issuer wajib diisi");
}

if (string.IsNullOrWhiteSpace(jwtOption.Audience))
{
  throw new InvalidOperationException("Jwt: Audience wajib diisi");
}

if (jwtOption.AccessTokenMinutes is < 1 or > 60)
{
  throw new InvalidOperationException("Jwt: ACCESS Token Minutes antara 1 - 60");
}
byte[] signingKeyBytes;
try
{
  signingKeyBytes = Convert.FromBase64String(jwtOption.SigningKeyBase64);
}
catch (FormatException e)
{
  throw new InvalidOperationException("Jwt: SigingKeyBase64 tidak menggunakan Base64 yg valid", e);
}

// HS256
if (signingKeyBytes.Length < 32)
{
  throw new InvalidOperationException("JWT signing key minimal harus 32 byte");
}

// ===== Business / Application Service
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IWalletService, WalletService>();
builder.Services.AddScoped<ITransferService, TransferService>();
builder.Services.AddScoped<ITransactionService, TransactionService>();
builder.Services.AddScoped<IPaymentMethodService, PaymentMethodService>();
builder.Services.AddScoped<ITopUpRequestService, TopUpRequestService>();

var allowedOrigins = builder.Configuration
    .GetSection("Cors:AllowedOrigins")
    .Get<string[]>() ?? [];

builder.Services.AddCors(option =>
{
  option.AddPolicy("ReactClient", policy =>
  {
    policy.WithOrigins(allowedOrigins)
      .AllowAnyHeader()
      .AllowAnyMethod()
      .AllowCredentials();
  });
});

builder.Services.AddRateLimiter(option =>
{
  option.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

  // Default endpoint
  option.AddPolicy("default", context =>
  {
    var ip = context.Connection.RemoteIpAddress?.ToString() ?? "Nihil";

    return RateLimitPartition.GetFixedWindowLimiter(
          partitionKey: $"default:{ip}",
          factory: _ => new FixedWindowRateLimiterOptions
          {
            PermitLimit = 5,
            Window = TimeSpan.FromMinutes(3),
            QueueLimit = 0,
            AutoReplenishment = true
          }
      );
  });

  // Spesific endpoints
  option.AddPolicy("auth-login", context =>
  {
    var ip = context.Connection.RemoteIpAddress?.ToString() ?? "Nihil";

    return RateLimitPartition.GetFixedWindowLimiter(
          partitionKey: $"login:{ip}",
          factory: _ => new FixedWindowRateLimiterOptions
          {
            PermitLimit = 5,
            Window = TimeSpan.FromMinutes(3),
            QueueLimit = 0,
            AutoReplenishment = true
          }
      );
  });

  option.AddPolicy("auth-register", context =>
  {
    var ip = context.Connection.RemoteIpAddress?.ToString() ?? "Nihil";

    return RateLimitPartition.GetFixedWindowLimiter(
          partitionKey: $"register:{ip}",
          factory: _ => new FixedWindowRateLimiterOptions
          {
            PermitLimit = 5,
            Window = TimeSpan.FromMinutes(10),
            QueueLimit = 0,
            AutoReplenishment = true
          }
      );
  });

  option.AddPolicy("auth-refresh", context =>
  {
    var ip = context.Connection.RemoteIpAddress?.ToString() ?? "Nihil";

    return RateLimitPartition.GetFixedWindowLimiter(
          partitionKey: $"refresh:{ip}",
          factory: _ => new FixedWindowRateLimiterOptions
          {
            PermitLimit = 10,
            Window = TimeSpan.FromMinutes(2),
            QueueLimit = 0,
            AutoReplenishment = true
          }
      );
  });

});

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(option =>
    {
      option.MapInboundClaims = false;
      option.IncludeErrorDetails = false;
      option.TokenValidationParameters = new TokenValidationParameters
      {
        ValidateIssuer = true,
        ValidIssuer = jwtOption.Issuer,
        ValidateAudience = true,
        ValidAudience = jwtOption.Audience,
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(signingKeyBytes),
        RequireSignedTokens = true,
        ValidAlgorithms = [
              SecurityAlgorithms.HmacSha256
          ],
        ValidateLifetime = true,
        RequireExpirationTime = true,
        ClockSkew = TimeSpan.Zero,
        NameClaimType = JwtRegisteredClaimNames.Sub,
        RoleClaimType = "role"
      };
    });

builder.Services.AddAuthorizationBuilder()
  .AddPolicy(AppPolicies.CanManageUsers, policy =>
    policy.RequireRole(AppRoles.Admin))
  .AddPolicy(AppPolicies.CanViewAllTopUps, policy =>
    policy.RequireRole(AppRoles.Admin))

  .AddPolicy(AppPolicies.CanTopUp, policy =>
    policy.RequireRole(AppRoles.Customer))
  .AddPolicy(AppPolicies.CanTransfer, policy =>
    policy.RequireRole(AppRoles.Customer))
  .AddPolicy(AppPolicies.CanViewOwnMutations, policy =>
    policy.RequireRole(AppRoles.Customer))
  .AddPolicy(AppPolicies.CanViewOwnTransactions, policy =>
    policy.RequireRole(AppRoles.Customer))
  .AddPolicy(AppPolicies.CanManageOwnWallet, policy =>
    policy.RequireRole(AppRoles.Customer))

  .AddPolicy(AppPolicies.CanAccessProfile, policy =>
    policy.RequireRole(AppRoles.Admin, AppRoles.Customer));

var app = builder.Build();

await app.Services.InitializeDatabaseAsync();

app.UseExceptionHandler();

app.UseCorrelationId();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
  app.MapOpenApi();
  app.UseSwaggerUI(options =>
   {
     options.SwaggerEndpoint("/openapi/v1.json", "E-Wallet API v1");
     options.RoutePrefix = "swagger";

     options.DocumentTitle = "E-Wallet | API Documentation";

     options.EnableFilter();
   });
}

app.UseHttpsRedirection();

app.UseRouting();

app.UseMiddleware<RequestTimingMiddleware>();

app.UseCors("ReactClient");

app.UseRateLimiter();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
