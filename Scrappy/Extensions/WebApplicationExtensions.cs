

namespace Scrappy.Extensions;

/// <summary>
/// Provides extension methods for WebApplication to configure the Scrappy API pipeline.
/// </summary>
public static class WebApplicationExtensions
{
    /// <summary>
    /// Configures the Scrappy API pipeline with middleware and endpoints.
    /// </summary>
    /// <param name="app"></param>
    /// <returns></returns>
    public static WebApplication UseScrappyPipeline(this WebApplication app)
    {
        if (app.Environment.IsDevelopment())
        {
            app.MapOpenApi();
            app.UseSwaggerUI(options =>
            {
                options.SwaggerEndpoint("/openapi/v1.json", "Scrappy API V1");
            });
        }

        app.UseHttpsRedirection();
        app.UseCors(ServiceCollectionExtensions.CorsPolicyName);
        app.UseAuthorization();
        app.MapControllers();

        return app;
    }
}
