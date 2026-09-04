using Microsoft.Extensions.DependencyInjection;

namespace Scrappy.Services;

/// <summary>
/// Runs lifecycle synchronization periodically so the database stays current
/// without requiring a request to trigger the transition.
/// </summary>
public sealed class EventLifecycleHostedService(
    IServiceScopeFactory scopeFactory,
    ILogger<EventLifecycleHostedService> logger) : BackgroundService
{
    private static readonly TimeSpan RefreshInterval = TimeSpan.FromHours(1);
    private static readonly TimeSpan RetryInterval = TimeSpan.FromMinutes(1);

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var retry = false;

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = scopeFactory.CreateScope();
                var lifecycleService = scope.ServiceProvider
                    .GetRequiredService<EventLifecycleService>();

                await lifecycleService.RefreshAsync(stoppingToken);
                retry = false;
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
            catch (Exception exception)
            {
                retry = true;
                logger.LogError(
                    exception,
                    "Failed to refresh event lifecycle data.");
            }

            try
            {
                await Task.Delay(
                    retry ? RetryInterval : RefreshInterval,
                    stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
        }
    }
}
