using AngoMenu_MVP_WebApp.Configuration;
using AngoMenu_MVP_WebApp.Services.Implementations;
using AngoMenu_MVP_WebApp.Services.Interfaces;
using AngoMenu_MVP_WebApp.Services.Cloudinary;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;
using Microsoft.AspNetCore.RateLimiting;
using System.Threading.RateLimiting;
using System.Security.Claims;

var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
}); // <-- Use API controllers
builder.Services.AddScoped<IRestaurantService, RestaurantService>();
builder.Services.AddScoped<IReservationService, ReservationService>();
builder.Services.AddScoped<IMenuService, MenuService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<ICloudinaryService, CloudinaryService>();
builder.Services.AddScoped<IRestaurantImageService, RestaurantImageService>();

builder.Services.Configure<CloudinarySettings>(builder.Configuration.GetSection("CloudinarySettings"));
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Description = "Enter 'Bearer' [space] and then your token.\nExample: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    });

    options.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var allowedOrigins = builder.Configuration
    .GetSection("Cors:AllowedOrigins")
    .Get<string[]>()?
    .Where(origin => !string.IsNullOrWhiteSpace(origin))
    .Select(origin => origin.Trim().TrimEnd('/'))
    .Distinct(StringComparer.OrdinalIgnoreCase)
    .ToArray() ?? Array.Empty<string>();

var allowCredentials = builder.Configuration.GetValue<bool>("Cors:AllowCredentials");
var allowedMethods = builder.Configuration
    .GetSection("Cors:AllowedMethods")
    .Get<string[]>()?
    .Where(method => !string.IsNullOrWhiteSpace(method))
    .ToArray() ?? Array.Empty<string>();

var allowedHeaders = builder.Configuration
    .GetSection("Cors:AllowedHeaders")
    .Get<string[]>()?
    .Where(header => !string.IsNullOrWhiteSpace(header))
    .ToArray() ?? Array.Empty<string>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendPolicy", policy =>
    {
        if (allowedOrigins.Length == 0)
        {
            return;
        }

        policy.WithOrigins(allowedOrigins);

        if (allowedMethods.Length > 0)
        {
            policy.WithMethods(allowedMethods);
        }
        else
        {
            policy.AllowAnyMethod();
        }

        if (allowedHeaders.Length > 0)
        {
            policy.WithHeaders(allowedHeaders);
        }
        else
        {
            policy.AllowAnyHeader();
        }

        if (allowCredentials)
        {
            policy.AllowCredentials();
        }

        policy.SetPreflightMaxAge(TimeSpan.FromMinutes(10));
    });
});

builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

    // 🔐 Login limiter (protection brute force)
    options.AddFixedWindowLimiter("loginLimiter", config =>
    {
        config.PermitLimit = 5; // 5 trys
        config.Window = TimeSpan.FromMinutes(1); // per minute
        config.QueueLimit = 0;
    });

    // 📦 Reservation limiter (anti spam)
    options.AddFixedWindowLimiter("reservationLimiter", config =>
    {
        config.PermitLimit = 10; // 10 reservations
        config.Window = TimeSpan.FromMinutes(1);
        config.QueueLimit = 0;
    });
});

var cs = builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(cs));

// Connection String for SQL Server
//builder.Services.AddDbContext<ApplicationDbContext>(options =>
//    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"))); // <-- Changed DefaultConn.. to Dev (User Secrets)

var jwtSettings = builder.Configuration.GetSection("JwtSettings");

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        RoleClaimType = ClaimTypes.Role,
        NameClaimType = ClaimTypes.NameIdentifier,
        ClockSkew = TimeSpan.Zero,
        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(jwtSettings["Key"]!))
    };
});

builder.Services.AddAuthorization(options =>
{
    options.FallbackPolicy = new Microsoft.AspNetCore.Authorization.AuthorizationPolicyBuilder()
        .RequireAuthenticatedUser()
        .Build();
});

var app = builder.Build();

// Swagger enabled in development
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseMiddleware<AngoMenu_MVP_WebApp.Middleware.SecurityHeadersMiddleware>();
app.Use(async (context, next) =>
{
    await next();

    if (!context.Response.Headers.TryGetValue("Content-Type", out var contentTypeValues))
    {
        return;
    }

    var contentType = contentTypeValues.ToString();
    if (string.IsNullOrWhiteSpace(contentType) || contentType.Contains("charset=", StringComparison.OrdinalIgnoreCase))
    {
        return;
    }

    if (contentType.StartsWith("application/json", StringComparison.OrdinalIgnoreCase) ||
        contentType.StartsWith("text/", StringComparison.OrdinalIgnoreCase) ||
        contentType.StartsWith("application/javascript", StringComparison.OrdinalIgnoreCase))
    {
        context.Response.Headers["Content-Type"] = $"{contentType}; charset=utf-8";
    }
});
app.UseHttpsRedirection();
app.UseCors("FrontendPolicy");
app.UseRateLimiter();
app.UseMiddleware<AngoMenu_MVP_WebApp.Middleware.ExceptionMiddleware>();
app.UseAuthentication();   // <-- VERY IMPORTANT
app.UseAuthorization();
app.MapControllers();  // <-- Use API routing
app.Run();
