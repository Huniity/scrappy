

using System.Net;
using System.Text.Json;
using Scrappy.DTOs.Common;

namespace Scrappy.Middlewares;

/// <summary>
/// Middleware to handle global exceptions in the API.
/// </summary>
/// <remarks> Initializes a new instance of the <see cref="GlobalExceptionMiddleware"/> class with the specified next middleware and logger.</remarks>
public class GlobalExceptionMiddleware(RequestDelegate next, ILogger<GlobalExceptionMiddleware> logger)
{
    /// <summary> Initializes a new instance of the <see cref="GlobalExceptionMiddleware"/> class with the specified next middleware and logger.</summary>
    private readonly RequestDelegate _next = next;
    
    /// <summary> Initializes a new instance of the <see cref="GlobalExceptionMiddleware"/> class with the specified next middleware and logger.</summary>
    private readonly ILogger<GlobalExceptionMiddleware> _logger = logger;

    /// <summary> Invokes the middleware to handle exceptions during the request processing pipeline. </summary>
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Ocorreu um erro não tratado na API.");
            await HandleExceptionAsync(context, ex);
        }
    }

    /// <summary> Handles the exception by returning a standardized error response. </summary>
    private static Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;

        var response = ApiResultDto<string>.Failure("Ocorreu um erro interno no servidor.");
        string json = JsonSerializer.Serialize(response);

        return context.Response.WriteAsync(json);
    }
}