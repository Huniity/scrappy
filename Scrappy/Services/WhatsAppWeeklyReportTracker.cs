using MongoDB.Bson;
using MongoDB.Driver;
using Scrappy.Models.Entities;

namespace Scrappy.Services;

/// <summary>
/// Reserves and records idempotent weekly WhatsApp reports.
/// </summary>
public sealed class WhatsAppWeeklyReportTracker
{
    private static readonly TimeSpan LeaseDuration =
        TimeSpan.FromMinutes(10);

    private readonly IMongoCollection<WhatsAppWeeklyReport>
        _reports;

    private readonly TimeProvider _timeProvider;

    public WhatsAppWeeklyReportTracker(
        IMongoDatabase database,
        TimeProvider timeProvider)
    {
        _reports =
            database.GetCollection<WhatsAppWeeklyReport>(
                WhatsAppWeeklyReport.CollectionName);

        _timeProvider = timeProvider;
    }

    /// <summary>
    /// Attempts to reserve one weekly report.
    /// </summary>
    /// <returns>
    /// The lease identifier when acquired; otherwise, null.
    /// </returns>
    public async Task<string?> TryAcquireAsync(
        string userId,
        string localitySlug,
        DateTime weekStartUtc,
        CancellationToken cancellationToken = default)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(userId);
        ArgumentException.ThrowIfNullOrWhiteSpace(localitySlug);

        if (weekStartUtc.Kind != DateTimeKind.Utc)
        {
            throw new ArgumentException(
                "Week start must be in UTC.",
                nameof(weekStartUtc));
        }

        var normalizedUserId = userId.Trim();
        var normalizedSlug =
            localitySlug.Trim().ToLowerInvariant();

        var now = _timeProvider.GetUtcNow().UtcDateTime;
        var leaseId = Guid.NewGuid().ToString("N");

        var identityFilter = BuildIdentityFilter(
            normalizedUserId,
            normalizedSlug,
            weekStartUtc);

        var availableFilter =
            Builders<WhatsAppWeeklyReport>.Filter.Eq(
                report => report.Status,
                WhatsAppWeeklyReportStatus.Failed) |
            (
                Builders<WhatsAppWeeklyReport>.Filter.Eq(
                    report => report.Status,
                    WhatsAppWeeklyReportStatus.Processing) &
                (
                    Builders<WhatsAppWeeklyReport>.Filter.Eq(
                        report => report.LeaseUntilUtc,
                        null) |
                    Builders<WhatsAppWeeklyReport>.Filter.Lte(
                        report => report.LeaseUntilUtc,
                        now)
                )
            );

        var filter = identityFilter & availableFilter;

        var update = Builders<WhatsAppWeeklyReport>.Update
            .Set(
                report => report.Status,
                WhatsAppWeeklyReportStatus.Processing)
            .Set(
                report => report.LeaseId,
                leaseId)
            .Set(
                report => report.LeaseUntilUtc,
                now.Add(LeaseDuration))
            .Set(
                report => report.UpdatedAt,
                now)
            .Inc(
                report => report.AttemptCount,
                1)
            .SetOnInsert(
                report => report.Id,
                ObjectId.GenerateNewId().ToString())
            .SetOnInsert(
                report => report.WhatsAppUserId,
                normalizedUserId)
            .SetOnInsert(
                report => report.LocalitySlug,
                normalizedSlug)
            .SetOnInsert(
                report => report.WeekStartUtc,
                weekStartUtc)
            .SetOnInsert(
                report => report.CreatedAt,
                now);

        try
        {
            await _reports.UpdateOneAsync(
                filter,
                update,
                new UpdateOptions
                {
                    IsUpsert = true
                },
                cancellationToken);

            return leaseId;
        }
        catch (MongoWriteException exception)
            when (exception.WriteError?.Category ==
                  ServerErrorCategory.DuplicateKey)
        {
            return null;
        }
        catch (MongoCommandException exception)
            when (exception.Code == 11000)
        {
            return null;
        }
    }

    /// <summary>
    /// Marks a reserved weekly report as successfully sent.
    /// </summary>
    public async Task<bool> MarkSentAsync(
        string userId,
        string localitySlug,
        DateTime weekStartUtc,
        string leaseId,
        CancellationToken cancellationToken = default)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(userId);
        ArgumentException.ThrowIfNullOrWhiteSpace(localitySlug);
        ArgumentException.ThrowIfNullOrWhiteSpace(leaseId);

        var filter =
            BuildIdentityFilter(
                userId.Trim(),
                localitySlug.Trim().ToLowerInvariant(),
                weekStartUtc) &
            Builders<WhatsAppWeeklyReport>.Filter.Eq(
                report => report.Status,
                WhatsAppWeeklyReportStatus.Processing) &
            Builders<WhatsAppWeeklyReport>.Filter.Eq(
                report => report.LeaseId,
                leaseId);

        var now = _timeProvider.GetUtcNow().UtcDateTime;

        var update = Builders<WhatsAppWeeklyReport>.Update
            .Set(
                report => report.Status,
                WhatsAppWeeklyReportStatus.Sent)
            .Set(
                report => report.SentAtUtc,
                now)
            .Set(
                report => report.UpdatedAt,
                now)
            .Unset(report => report.LeaseId)
            .Unset(report => report.LeaseUntilUtc);

        var result = await _reports.UpdateOneAsync(
            filter,
            update,
            cancellationToken: cancellationToken);

        return result.ModifiedCount == 1;
    }

    /// <summary>
    /// Releases a failed weekly report so a later run can retry it.
    /// </summary>
    public async Task<bool> MarkFailedAsync(
        string userId,
        string localitySlug,
        DateTime weekStartUtc,
        string leaseId,
        CancellationToken cancellationToken = default)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(userId);
        ArgumentException.ThrowIfNullOrWhiteSpace(localitySlug);
        ArgumentException.ThrowIfNullOrWhiteSpace(leaseId);

        var filter =
            BuildIdentityFilter(
                userId.Trim(),
                localitySlug.Trim().ToLowerInvariant(),
                weekStartUtc) &
            Builders<WhatsAppWeeklyReport>.Filter.Eq(
                report => report.Status,
                WhatsAppWeeklyReportStatus.Processing) &
            Builders<WhatsAppWeeklyReport>.Filter.Eq(
                report => report.LeaseId,
                leaseId);

        var update = Builders<WhatsAppWeeklyReport>.Update
            .Set(
                report => report.Status,
                WhatsAppWeeklyReportStatus.Failed)
            .Set(
                report => report.UpdatedAt,
                _timeProvider.GetUtcNow().UtcDateTime)
            .Unset(report => report.LeaseId)
            .Unset(report => report.LeaseUntilUtc);

        var result = await _reports.UpdateOneAsync(
            filter,
            update,
            cancellationToken: cancellationToken);

        return result.ModifiedCount == 1;
    }

    private static FilterDefinition<WhatsAppWeeklyReport>
        BuildIdentityFilter(
            string userId,
            string localitySlug,
            DateTime weekStartUtc)
    {
        return
            Builders<WhatsAppWeeklyReport>.Filter.Eq(
                report => report.WhatsAppUserId,
                userId) &
            Builders<WhatsAppWeeklyReport>.Filter.Eq(
                report => report.LocalitySlug,
                localitySlug) &
            Builders<WhatsAppWeeklyReport>.Filter.Eq(
                report => report.WeekStartUtc,
                weekStartUtc);
    }
}
