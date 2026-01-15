using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Serilog;
using TodoTask.Application.Services;
using TodoTask.Core.Interfaces;
using TodoTask.Infrastructure.Data;
using TodoTask.Infrastructure.Repositories;
using TodoTask.Infrastructure.Services;
using TodoTask.API.Middleware;
using Pomelo.EntityFrameworkCore.MySql.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

#region RAILWAY PORT BINDING (VERY IMPORTANT)

var portEnv = Environment.GetEnvironmentVariable("PORT");
var port = string.IsNullOrEmpty(portEnv) ? "8080" : portEnv;

// MUST listen on 0.0.0.0
builder.WebHost.UseUrls($"http://0.0.0.0:{port}");

#endregion

#region Logging (Serilog)

Log.Logger = new LoggerConfiguration()
	.ReadFrom.Configuration(builder.Configuration)
	.Enrich.FromLogContext()
	.WriteTo.Console()
	.CreateLogger();

builder.Host.UseSerilog();

#endregion

#region Controllers & Swagger

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(c =>
{
	c.SwaggerDoc("v1", new OpenApiInfo
	{
		Title = "Todo Task API",
		Version = "v1"
	});

	c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
	{
		Description = "JWT Authorization header using the Bearer scheme",
		Name = "Authorization",
		In = ParameterLocation.Header,
		Type = SecuritySchemeType.ApiKey,
		Scheme = "Bearer"
	});

	c.AddSecurityRequirement(new OpenApiSecurityRequirement
	{
		{
			new OpenApiSecurityScheme
			{
				Reference = new OpenApiReference
				{
					Type = ReferenceType.SecurityScheme,
					Id = "Bearer"
				}
			},
			Array.Empty<string>()
		}
	});
});

#endregion

#region CORS (TEMP: Allow All)

builder.Services.AddCors(options =>
{
	options.AddPolicy("AllowAll", policy =>
	{
		policy.AllowAnyOrigin()
			  .AllowAnyMethod()
			  .AllowAnyHeader();
	});
});

#endregion

#region Database (Railway MySQL)

var host = Environment.GetEnvironmentVariable("MYSQLHOST");
var portDb = Environment.GetEnvironmentVariable("MYSQLPORT");
var database = Environment.GetEnvironmentVariable("MYSQLDATABASE");
var user = Environment.GetEnvironmentVariable("MYSQLUSER");
var password = Environment.GetEnvironmentVariable("MYSQLPASSWORD");

if (string.IsNullOrWhiteSpace(host))
{
	throw new InvalidOperationException("MYSQLHOST environment variable is not set.");
}

var connectionString =
	$"Server={host};Port={portDb};Database={database};User={user};Password={password};";

builder.Services.AddDbContext<ApplicationDbContext>(options =>
	options.UseMySql(
		connectionString,
		new MySqlServerVersion(new Version(8, 0, 36)),
		mySqlOptions =>
		{
			mySqlOptions.EnableRetryOnFailure(10, TimeSpan.FromSeconds(10), null);
		}
	)
);

#endregion

#region JWT Authentication

var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["SecretKey"]
	?? throw new InvalidOperationException("JWT SecretKey not configured");

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
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
			IssuerSigningKey = new SymmetricSecurityKey(
				Encoding.UTF8.GetBytes(secretKey))
		};
	});

builder.Services.AddAuthorization();

#endregion

#region Dependency Injection

builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
builder.Services.AddScoped<IJwtService, JwtService>();
builder.Services.AddScoped<IPasswordService, PasswordService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<ITodoService, TodoService>();
builder.Services.AddScoped<ICategoryService, CategoryService>();
builder.Services.AddScoped<IReminderService, ReminderService>();
builder.Services.AddScoped<IUserPreferencesService, UserPreferencesService>();

#endregion

var app = builder.Build();

#region Middleware Pipeline

app.UseSwagger();
app.UseSwaggerUI();

app.UseSerilogRequestLogging();

app.UseCors("AllowAll");

app.UseAuthentication();
app.UseAuthorization();

app.UseMiddleware<ExceptionHandlingMiddleware>();

app.MapGet("/", () => "Todo API is running on Railway");

app.MapControllers();

#endregion

app.Run();
