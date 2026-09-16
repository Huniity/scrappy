

using Microsoft.Extensions.Options;
using Scrappy.Integrations.WhatsApp;


namespace Scrappy.Services;

/// <summary>
/// Represents a report window for WhatsApp event selection.
/// </summary>
public sealed record WhatsAppReportWindow(
    DateTime WindowStartUtc,
    DateTime WindowEndUtc,
    DateOnly WindowStartLocal,
    DateOnly WindowEndLocal
);

/// <summary>
/// Calculates immediate and weekly WhatsApp report windows.
/// </summary>
public sealed class WhatsAppReportWindowService
{
    private readonly TimeProvider _timeProvider;
    private readonly TimeZoneInfo _timeZone;

    public WhatsAppReportWindowService(
        TimeProvider timeProvider,
        IOptions<WhatsAppOptions> options)
    {
        _timeProvider = timeProvider;

        if (string.IsNullOrWhiteSpace(
                options.Value.MessageTimeZone))
        {
            throw new InvalidOperationException(
                "WhatsApp MessageTimeZone is not configured.");
        }

        _timeZone = TimeZoneInfo.FindSystemTimeZoneById(options.Value.MessageTimeZone);
    }

    /// <summary>
    /// Creates a window from now until the end of the current Sunday.
    /// </summary>
    public WhatsAppReportWindow CreateImmediateWindow()
    {
        var nowUtc = _timeProvider.GetUtcNow();

        var localNow = TimeZoneInfo.ConvertTime(nowUtc, _timeZone);

        var daysUntilSunday = ((int)DayOfWeek.Sunday - (int)localNow.DayOfWeek + 7) % 7;

        var nextMondayLocal = localNow.Date.AddDays(daysUntilSunday + 1);

        var endOfSundayLocal =
            DateTime.SpecifyKind(
                nextMondayLocal,
                DateTimeKind.Unspecified)
            .AddTicks(-1);

        var endUtc = TimeZoneInfo.ConvertTimeToUtc(endOfSundayLocal, _timeZone);

        var startOfTodayLocal = DateTime.SpecifyKind(
            localNow.Date,
            DateTimeKind.Unspecified);

        var startUtc = TimeZoneInfo.ConvertTimeToUtc(
            startOfTodayLocal,
            _timeZone);

        return new WhatsAppReportWindow(
            startUtc,
            endUtc,
            DateOnly.FromDateTime(startOfTodayLocal),
            DateOnly.FromDateTime(endOfSundayLocal));
    }

    /// <summary>
    /// Creates a window for the following Monday-through-Sunday week.
    /// </summary>
    public WhatsAppReportWindow CreateNextWeekWindow()
    {
        var nowUtc = _timeProvider.GetUtcNow();

        var localNow = TimeZoneInfo.ConvertTime(nowUtc, _timeZone);

        var daysSinceMonday =
            ((int)localNow.DayOfWeek -
            (int)DayOfWeek.Monday +
            7) % 7;

        var currentMondayLocal = localNow.Date.AddDays(-daysSinceMonday);

        var nextMondayLocal = currentMondayLocal.AddDays(7);

        var endOfNextSundayLocal =
            nextMondayLocal
                .AddDays(7)
                .AddTicks(-1);

        var startUtc = TimeZoneInfo.ConvertTimeToUtc(
            DateTime.SpecifyKind(
                nextMondayLocal,
                DateTimeKind.Unspecified),
            _timeZone);

        var endUtc = TimeZoneInfo.ConvertTimeToUtc(
            DateTime.SpecifyKind(
                endOfNextSundayLocal,
                DateTimeKind.Unspecified),
            _timeZone);

        return new WhatsAppReportWindow(startUtc, endUtc, DateOnly.FromDateTime(nextMondayLocal), DateOnly.FromDateTime(endOfNextSundayLocal));
    }


    /// <summary>
    /// Creates a UTC report window covering the supplied local calendar
    /// dates, including both the start and end dates.
    /// </summary>
    public WhatsAppReportWindow CreateWindow(
        DateOnly windowStartLocal,
        DateOnly windowEndLocal)
    {
        if (windowStartLocal > windowEndLocal)
        {
            throw new ArgumentException("Window start cannot be later than window end.");
        }

        var startLocal = DateTime.SpecifyKind(

            windowStartLocal.ToDateTime(TimeOnly.MinValue),
            DateTimeKind.Unspecified);

        var endLocal = DateTime.SpecifyKind(
            windowEndLocal
                .AddDays(1)
                .ToDateTime(TimeOnly.MinValue)
                .AddTicks(-1),
            DateTimeKind.Unspecified);

        var startUtc = TimeZoneInfo.ConvertTimeToUtc(
            startLocal,
            _timeZone);

        var endUtc = TimeZoneInfo.ConvertTimeToUtc(
            endLocal,
            _timeZone);

        return new WhatsAppReportWindow(
            startUtc,
            endUtc,
            windowStartLocal,
            windowEndLocal);
    }
}
