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

#region CORS

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

#region Database (Railway Safe)

var host = Environment.GetEnvironmentVariable("MYSQLHOST");
var port = Environment.GetEnvironmentVariable("MYSQLPORT");
var database = Environment.GetEnvironmentVariable("MYSQLDATABASE");
var user = Environment.GetEnvironmentVariable("MYSQLUSER");
var password = Environment.GetEnvironmentVariable("MYSQLPASSWORD");

// Fail fast if Railway variables are missing
if (string.IsNullOrWhiteSpace(host))
{
	throw new InvalidOperationException("MYSQLHOST environment variable is not set.");
}

var connectionString =
	$"Server={host};Port={port};Database={database};User={user};Password={password};";

builder.Services.AddDbContext<ApplicationDbContext>(options =>
	options.UseMySql(
		connectionString,
		new MySqlServerVersion(new Version(8, 0, 36)),
		mySqlOptions =>
		{
			mySqlOptions.EnableRetryOnFailure(
				maxRetryCount: 10,
				maxRetryDelay: TimeSpan.FromSeconds(10),
				errorNumbersToAdd: null
			);
		}
	)
);

#endregion

#region Authentication & Authorization (JWT)

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

if (app.Environment.IsDevelopment())
{
	app.UseSwagger();
	app.UseSwaggerUI();
}

app.UseSerilogRequestLogging();

app.UseCors("AllowAll");

if (!app.Environment.IsDevelopment())
{
	app.UseHttpsRedirection();
}

app.UseAuthentication();
app.UseAuthorization();

app.UseMiddleware<ExceptionHandlingMiddleware>();

app.MapControllers();

#endregion

#region Database Migration (DEV ONLY)

if (app.Environment.IsDevelopment())
{
	using var scope = app.Services.CreateScope();
	var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
	var passwordService = scope.ServiceProvider.GetRequiredService<IPasswordService>();

	dbContext.Database.Migrate();
	await DataSeeder.SeedAsync(dbContext, passwordService);
}

#endregion

app.Run();
