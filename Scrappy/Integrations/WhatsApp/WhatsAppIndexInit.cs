

using MongoDB.Driver;
using Scrappy.Models.Entities;


namespace Scrappy.Integrations.WhatsApp;

/// <summary>
/// Initializes the MongoDB index for the WhatsApp subscriptions collection to ensure uniqueness of user-locality pairs.
/// </summary>
/// <param name="scopeFactory">The factory to create service scopes for dependency injection.</param>
public sealed class WhatsAppSubscriptionIndexInitializer(
    IServiceScopeFactory scopeFactory) : IHostedService
{
    /// <summary>
    /// Starts the service and initializes the MongoDB index for the WhatsApp subscriptions collection.
    /// </summary>
    /// <param name="cancellationToken">A token to monitor for cancellation requests.</param>
    /// <returns>A task that represents the asynchronous operation.</returns>
    public async Task StartAsync(
        CancellationToken cancellationToken)
    {
        using var scope = scopeFactory.CreateScope();

        var database =
            scope.ServiceProvider.GetRequiredService<IMongoDatabase>();

        var subscriptions =
            database.GetCollection<WhatsAppSubscription>(
                WhatsAppSubscription.CollectionName);

        var keys = Builders<WhatsAppSubscription>
            .IndexKeys
            .Ascending(subscription => subscription.WhatsAppUserId)
            .Ascending(subscription => subscription.LocalitySlug);

        var index = new CreateIndexModel<WhatsAppSubscription>(
            keys,
            new CreateIndexOptions
            {
                Name = "ux_whatsapp_user_locality",
                Unique = true
            });

        await subscriptions.Indexes.CreateOneAsync(
            index,
            cancellationToken: cancellationToken);
    }

    /// <summary>
    /// Stops the service. This implementation does not perform any specific actions on stop.
    /// </summary>
    /// <param name="cancellationToken">A token to monitor for cancellation requests.</param>
    /// <returns>A completed task.</returns>
    public Task StopAsync(CancellationToken cancellationToken)
    {
        return Task.CompletedTask;
    }
}