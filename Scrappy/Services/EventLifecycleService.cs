using MongoDB.Driver;
using Scrappy.Models.Entities;

namespace Scrappy.Services;

/// <summary>
/// Contains the date rules used to determine whether an event has finished.
/// </summary>
public static class EventLifecycleRules
{
    private const int RetentionDays = 60;
    private static readonly TimeZoneInfo LisbonTimeZone =
        TimeZoneInfo.FindSystemTimeZoneById("Europe/Lisbon");

    /// <summary>
    /// An event is considered finished after its end date, or its start date
    /// when no end date exists, is before today in Portugal.
    /// </summary>
    public static bool IsFinished(
        DateTime startDate,
        DateTime? endDate,
        DateTime nowUtc)
    {
        var eventDate = ToLisbonDate(endDate ?? startDate);
        var today = ToLisbonDate(nowUtc);

        return eventDate < today;
    }

    /// <summary>
    /// Calculates when a finished event can be removed from the database.
    /// </summary>
    public static DateTime GetRetentionUntil(
        DateTime startDate,
        DateTime? endDate)
    {
        var eventDate = endDate ?? startDate;
        return ToUtc(eventDate).AddDays(RetentionDays);
    }

    private static DateOnly ToLisbonDate(DateTime value)
    {
        if (value.Kind == DateTimeKind.Unspecified)
            return DateOnly.FromDateTime(value);

        var utc = value.Kind == DateTimeKind.Utc
            ? value
            : value.ToUniversalTime();

        return DateOnly.FromDateTime(
            TimeZoneInfo.ConvertTimeFromUtc(utc, LisbonTimeZone));
    }

    private static DateTime ToUtc(DateTime value) =>
        value.Kind switch
        {
            DateTimeKind.Utc => value,
            DateTimeKind.Local => value.ToUniversalTime(),
            _ => DateTime.SpecifyKind(value, DateTimeKind.Utc),
        };
}

/// <summary>
/// Synchronizes event lifecycle flags and removes expired retained events.
/// </summary>
public sealed class EventLifecycleService(
    IMongoDatabase database,
    ILogger<EventLifecycleService> logger)
{
    private readonly IMongoCollection<DistrictEvent> _events =
        database.GetCollection<DistrictEvent>("DistrictEvents");

    public async Task RefreshAsync(CancellationToken cancellationToken)
    {
        var nowUtc = DateTime.UtcNow;
        var events = await _events
            .Find(Builders<DistrictEvent>.Filter.Empty)
            .ToListAsync(cancellationToken);

        var updates = new List<WriteModel<DistrictEvent>>();

        foreach (var districtEvent in events)
        {
            var eventModel = districtEvent.Event;
            var isFinished = EventLifecycleRules.IsFinished(
                eventModel.StartDate,
                eventModel.EndDate,
                nowUtc);
            DateTime? retentionUntil = isFinished
                ? EventLifecycleRules.GetRetentionUntil(
                    eventModel.StartDate,
                    eventModel.EndDate)
                : null;

            if (eventModel.IsFinished == isFinished &&
                eventModel.RetentionUntil == retentionUntil)
            {
                continue;
            }

            var update = Builders<DistrictEvent>.Update
                .Set(e => e.Event.IsFinished, isFinished)
                .Set(e => e.Event.RetentionUntil, retentionUntil);

            updates.Add(new UpdateOneModel<DistrictEvent>(
                Builders<DistrictEvent>.Filter.Eq(e => e.Id, districtEvent.Id),
                update));
        }

        if (updates.Count > 0)
        {
            await _events.BulkWriteAsync(
                updates,
                cancellationToken: cancellationToken);
        }

        var expiredFilter = Builders<DistrictEvent>.Filter.And(
            Builders<DistrictEvent>.Filter.Eq(e => e.Event.IsFinished, true),
            Builders<DistrictEvent>.Filter.Exists(e => e.Event.RetentionUntil, true),
            Builders<DistrictEvent>.Filter.Lte(e => e.Event.RetentionUntil, nowUtc));

        var deleted = await _events.DeleteManyAsync(
            expiredFilter,
            cancellationToken);

        if (updates.Count > 0 || deleted.DeletedCount > 0)
        {
            logger.LogInformation(
                "Event lifecycle refreshed: {UpdatedCount} updated, {DeletedCount} expired events deleted.",
                updates.Count,
                deleted.DeletedCount);
        }
    }
}
