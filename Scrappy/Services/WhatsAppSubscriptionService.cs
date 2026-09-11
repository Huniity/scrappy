

using MongoDB.Bson;
using MongoDB.Driver;
using Scrappy.Models.Entities;

namespace Scrappy.Services;

/// <summary>
/// Service for managing WhatsApp subscriptions in the MongoDB database.
/// </summary>
public sealed class WhatsAppSubscriptionService
{
    /// <summary> Gets the MongoDB collection for WhatsApp subscriptions.</summary>
    private readonly IMongoCollection<WhatsAppSubscription>
        _subscriptions;

    /// <summary> Initializes a new instance of the <see cref="WhatsAppSubscriptionService"/> class with the specified MongoDB database.</summary>
    /// <param name="database">The MongoDB database instance.</param>
    public WhatsAppSubscriptionService(IMongoDatabase database)
    {
        _subscriptions =
            database.GetCollection<WhatsAppSubscription>(
                WhatsAppSubscription.CollectionName);
    }

    /// <summary> Subscribes a user to notifications for a specific locality. If the subscription already exists, it will be updated to be active. </summary>
    /// <param name="userId">The WhatsApp user ID to subscribe.</param>
    /// <param name="localitySlug">The slug representing the locality for which the user is subscribing to notifications.</param>
    /// <param name="cancellationToken">A token to monitor for cancellation requests.</param>
    /// <returns>A task that represents the asynchronous operation.</returns>
    public async Task SubscribeAsync(
        string userId,
        string localitySlug,
        CancellationToken cancellationToken = default)
    {
        var normalizedUserId = NormalizeUserId(userId);
        var normalizedSlug = NormalizeSlug(localitySlug);
        var now = DateTime.UtcNow;

        var filter = BuildIdentityFilter(
            normalizedUserId,
            normalizedSlug);

        var update = Builders<WhatsAppSubscription>.Update
            .Set(subscription => subscription.IsActive, true)
            .Set(subscription => subscription.UpdatedAt, now)
            .SetOnInsert(
                subscription => subscription.Id,
                ObjectId.GenerateNewId().ToString())
            .SetOnInsert(
                subscription => subscription.WhatsAppUserId,
                normalizedUserId)
            .SetOnInsert(
                subscription => subscription.LocalitySlug,
                normalizedSlug)
            .SetOnInsert(
                subscription => subscription.CreatedAt,
                now);

        try
        {
            await _subscriptions.UpdateOneAsync(
                filter,
                update,
                new UpdateOptions { IsUpsert = true },
                cancellationToken);
        }
        catch (MongoWriteException exception)
            when (exception.WriteError?.Category ==
                ServerErrorCategory.DuplicateKey)
        {
            // Another concurrent webhook created the same subscription.
            // Update the document that won the race.
            await _subscriptions.UpdateOneAsync(
                filter,
                update,
                cancellationToken: cancellationToken);
        }
    }

    /// <summary> Unsubscribes a user from notifications for a specific locality by marking the subscription as inactive. </summary>
    /// <param name="userId">The WhatsApp user ID to unsubscribe.</param>
    /// <param name="localitySlug">The slug representing the locality for which the user is unsubscribing from notifications.</param>
    /// <param name="cancellationToken">A token to monitor for cancellation requests.</param>
    /// <returns>A task that represents the asynchronous operation, returning true if the subscription was found and updated; otherwise, false.</returns>
    public async Task<bool> UnsubscribeAsync(
        string userId,
        string localitySlug,
        CancellationToken cancellationToken = default)
    {
        var filter = BuildIdentityFilter(
            NormalizeUserId(userId),
            NormalizeSlug(localitySlug));

        var update = Builders<WhatsAppSubscription>.Update
            .Set(subscription => subscription.IsActive, false)
            .Set(subscription => subscription.UpdatedAt, DateTime.UtcNow);

        var result = await _subscriptions.UpdateOneAsync(
            filter,
            update,
            cancellationToken: cancellationToken);

        return result.MatchedCount > 0;
    }

    /// <summary> Checks if a user is currently subscribed to notifications for a specific locality. </summary>
    /// <param name="userId">The WhatsApp user ID to check.</param>
    /// <param name="localitySlug">The slug representing the locality to check.</param>
    /// <param name="cancellationToken">A token to monitor for cancellation requests.</param>
    /// <returns>A task that represents the asynchronous operation, returning true if the user is subscribed; otherwise, false.</returns>
    public async Task<bool> IsSubscribedAsync(
        string userId,
        string localitySlug,
        CancellationToken cancellationToken = default)
    {
        var filter =
            BuildIdentityFilter(
                NormalizeUserId(userId),
                NormalizeSlug(localitySlug)) &
            Builders<WhatsAppSubscription>.Filter.Eq(
                subscription => subscription.IsActive,
                true);

        return await _subscriptions
            .Find(filter)
            .Limit(1)
            .AnyAsync(cancellationToken);
    }

    /// <summary> Retrieves all active subscriptions for a specific user. </summary>
    /// <param name="userId">The WhatsApp user ID for which to retrieve subscriptions.</param>
    /// <param name="cancellationToken">A token to monitor for cancellation requests.</param>
    /// <returns>A task that represents the asynchronous operation, returning a read-only list of active subscriptions for the specified user.</returns>
    public async Task<IReadOnlyList<WhatsAppSubscription>>
        GetUserSubscriptionsAsync(
            string userId,
            CancellationToken cancellationToken = default)
    {
        var normalizedUserId = NormalizeUserId(userId);

        var filter =
            Builders<WhatsAppSubscription>.Filter.Eq(
                subscription => subscription.WhatsAppUserId,
                normalizedUserId) &
            Builders<WhatsAppSubscription>.Filter.Eq(
                subscription => subscription.IsActive,
                true);

        return await _subscriptions
            .Find(filter)
            .SortBy(subscription => subscription.LocalitySlug)
            .ToListAsync(cancellationToken);
    }

    /// <summary> Builds a filter definition to identify a subscription based on the user ID and locality slug. </summary>
    /// <param name="userId">The WhatsApp user ID to filter by.</param>
    /// <param name="localitySlug">The slug representing the locality to filter by.</param>
    /// <returns>A filter definition that matches subscriptions with the specified user ID and locality slug.</returns>
    private static FilterDefinition<WhatsAppSubscription>
        BuildIdentityFilter(
            string userId,
            string localitySlug)
    {
        return
            Builders<WhatsAppSubscription>.Filter.Eq(
                subscription => subscription.WhatsAppUserId,
                userId) &
            Builders<WhatsAppSubscription>.Filter.Eq(
                subscription => subscription.LocalitySlug,
                localitySlug);
    }

    /// <summary> Normalizes the WhatsApp user ID by trimming whitespace and validating that it is not null or empty. </summary>
    /// <param name="userId">The WhatsApp user ID to normalize.</param>
    /// <returns>The normalized WhatsApp user ID.</returns> 
    private static string NormalizeUserId(string userId)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(userId);

        return userId.Trim();
    }

    /// <summary> Normalizes the locality slug by trimming whitespace, converting to lowercase, and validating that it is not null or empty. </summary>
    /// <param name="localitySlug">The locality slug to normalize.</param>
    /// <returns>The normalized locality slug.</returns>    
    private static string NormalizeSlug(string localitySlug)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(localitySlug);

        return localitySlug.Trim().ToLowerInvariant();
    }
}