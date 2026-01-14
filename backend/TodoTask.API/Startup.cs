using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Pomelo.EntityFrameworkCore.MySql.Infrastructure;
using Serilog;
using TodoTask.Application.Services;
using TodoTask.Core.Interfaces;
using TodoTask.Infrastructure.Data;
using TodoTask.Infrastructure.Repositories;
using TodoTask.Infrastructure.Services;
using TodoTask.API.Middleware;

namespace TodoTask.API
{
    public class Startup
    {
        public IConfiguration Configuration { get; }

        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public void ConfigureServices(IServiceCollection services)
        {
            // Add services to the container
            services.AddControllers();
            services.AddEndpointsApiExplorer();

            // Configure Swagger/OpenAPI
            services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new OpenApiInfo
                {
                    Title = "Todo Task API",
                    Version = "v1",
                    Description = "A production-ready Todo & Reminder API"
                });

                // Add JWT authentication to Swagger
                c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
                {
                    Description = "JWT Authorization header using the Bearer scheme. Enter 'Bearer' [space] and then your token",
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

            // Configure CORS
            services.AddCors(options =>
            {
                options.AddPolicy("AllowAll", policy =>
                {
                    policy.AllowAnyOrigin()
                          .AllowAnyMethod()
                          .AllowAnyHeader();
                });
            });

            // Configure Database
            var connectionString = Configuration.GetConnectionString("DefaultConnection")
                ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");

            // Use fixed MySQL 8.0 version instead of AutoDetect to avoid connection during startup
            // AutoDetect tries to connect to DB which can timeout in Lambda
            var serverVersion = new MySqlServerVersion(new Version(8, 0, 21));
            services.AddDbContext<ApplicationDbContext>(options =>
                options.UseMySql(connectionString, serverVersion, mysqlOptions =>
                {
                    mysqlOptions.EnableRetryOnFailure(
                        maxRetryCount: 3,
                        maxRetryDelay: TimeSpan.FromSeconds(5),
                        errorNumbersToAdd: null);
                }));

            // Configure JWT Authentication
            var jwtSettings = Configuration.GetSection("JwtSettings");
            var secretKey = jwtSettings["SecretKey"] ?? throw new InvalidOperationException("JWT SecretKey not configured");

            services.AddAuthentication(options =>
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
                    ValidIssuer = jwtSettings["Issuer"] ?? "TodoTaskAPI",
                    ValidAudience = jwtSettings["Audience"] ?? "TodoTaskClient",
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey))
                };
            });

            services.AddAuthorization();

            // Register services
            services.AddScoped<IUnitOfWork, UnitOfWork>();
            services.AddScoped<IJwtService, JwtService>();
            services.AddScoped<IPasswordService, PasswordService>();
            services.AddScoped<IAuthService, AuthService>();
            services.AddScoped<ITodoService, TodoService>();
            services.AddScoped<ICategoryService, CategoryService>();
            services.AddScoped<IReminderService, ReminderService>();
            services.AddScoped<IUserPreferencesService, UserPreferencesService>();
        }

        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            // Configure the HTTP request pipeline
            if (env.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            // CORS must be before UseHttpsRedirection to handle preflight requests
            app.UseCors("AllowAll");

            // Only use HTTPS redirection in production
            if (!env.IsDevelopment())
            {
                app.UseHttpsRedirection();
            }

            app.UseAuthentication();
            app.UseAuthorization();

            // Add exception handling middleware
            app.UseMiddleware<ExceptionHandlingMiddleware>();

            app.UseRouting();
            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
            });

            // Skip database migration and seeding in Lambda to improve cold start time
            // Migrations should be run separately using: dotnet ef database update
            // Only run migrations/seeding in local development
            if (env.IsDevelopment())
            {
                try
                {
                    using (var scope = app.ApplicationServices.CreateScope())
                    {
                        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                        var passwordService = scope.ServiceProvider.GetRequiredService<IPasswordService>();

                        // Apply pending migrations
                        dbContext.Database.Migrate();

                        // Seed sample data
                        DataSeeder.SeedAsync(dbContext, passwordService).Wait();
                    }
                }
                catch (Exception ex)
                {
                    // Log but don't fail startup if migration/seeding fails
                    Console.WriteLine($"Warning: Database migration/seeding failed: {ex.Message}");
                }
            }
        }
    }
}

