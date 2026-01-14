using System.Net;
using System.Text.Json;

namespace TodoTask.API.Middleware;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unhandled exception occurred");
            await HandleExceptionAsync(context, ex);
        }
    }

    private static Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var code = HttpStatusCode.InternalServerError;
        var result = JsonSerializer.Serialize(new { message = "An error occurred while processing your request" });

        if (exception is UnauthorizedAccessException)
        {
            code = HttpStatusCode.Unauthorized;
            result = JsonSerializer.Serialize(new { message = exception.Message });
        }
        else if (exception is KeyNotFoundException)
        {
            code = HttpStatusCode.NotFound;
            result = JsonSerializer.Serialize(new { message = exception.Message });
        }
        else if (exception is InvalidOperationException)
        {
            code = HttpStatusCode.BadRequest;
            result = JsonSerializer.Serialize(new { message = exception.Message });
        }

        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)code;
        return context.Response.WriteAsync(result);
    }
}

