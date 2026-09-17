

using MongoDB.Driver;
using Scrappy.Models.Entities;

namespace Scrappy.Services;


/// <summary>
/// Provides idempotency handling for WhatsApp messages by tracking processed message IDs in a MongoDB collection.
/// </summary>
public sealed class WhatsAppMessageIdempotencyService
{
    /// <summary> The MongoDB collection that stores processed WhatsApp messages. </summary>
    private readonly IMongoCollection<WhatsAppProcessedMessage> _messages;

    /// <summary> Initializes a new instance of the <see cref="WhatsAppMessageIdempotencyService"/> class with the specified MongoDB database. </summary>
    /// <param name="database">The MongoDB database instance used to access the collection of processed WhatsApp messages.</param>
    public WhatsAppMessageIdempotencyService(IMongoDatabase database)
    {
        _messages = database.GetCollection<WhatsAppProcessedMessage>(WhatsAppProcessedMessage.CollectionName);
    }

    /// <summary>
    /// Attempts to begin processing a WhatsApp message by inserting its ID into the collection of processed messages.
    /// </summary>
    /// <param name="messageId">The unique identifier of the WhatsApp message to be processed.</param>
    /// <param name="cancellationToken">A token to monitor for cancellation requests.</param>
    /// <returns>A task that represents the asynchronous operation. The task result contains a boolean indicating whether the message ID was successfully inserted (true) or if it already exists (false).</returns>
    /// <exception cref="ArgumentException">Thrown when the provided message ID is null, empty, or consists only of whitespace.</exception>
    public async Task<bool> TryBeginAsync(
        string messageId,
        CancellationToken cancellationToken = default)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(messageId);

        var processedMessage = new WhatsAppProcessedMessage
        {
            MessageId = messageId.Trim(),
            RegisteredAt = DateTime.UtcNow
        };

        try
        {
            await _messages.InsertOneAsync(processedMessage, cancellationToken: cancellationToken);

            return true;
        }
        catch (MongoWriteException exception)
            when (exception.WriteError?.Category == ServerErrorCategory.DuplicateKey)
        {
            return false;
        }
    }

    /// <summary>
    /// Releases a processed WhatsApp message by removing its ID from the collection of processed messages.
    /// </summary>
    /// <param name="messageId">The unique identifier of the WhatsApp message to be released.</param>
    /// <param name="cancellationToken">A token to monitor for cancellation requests.</param>
    /// <returns>A task that represents the asynchronous operation.</returns>
    /// <exception cref="ArgumentException">Thrown when the provided message ID is null, empty, or consists only of whitespace.</exception>
    public async Task ReleaseAsync(
        string messageId,
        CancellationToken cancellationToken = default)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(messageId);

        await _messages.DeleteOneAsync(message => message.MessageId == messageId.Trim(), cancellationToken);
    }
}
