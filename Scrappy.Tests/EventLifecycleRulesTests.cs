using Scrappy.Services;

namespace Scrappy.Tests;

public class EventLifecycleRulesTests
{
    private static readonly DateTime Today =
        new(2026, 9, 4, 12, 0, 0, DateTimeKind.Utc);

    [Fact]
    public void IsFinished_ReturnsFalseForAnEventToday()
    {
        var result = EventLifecycleRules.IsFinished(
            Today.Date,
            null,
            Today);

        Assert.False(result);
    }

    [Fact]
    public void IsFinished_ReturnsTrueForAnEventBeforeToday()
    {
        var result = EventLifecycleRules.IsFinished(
            Today.Date.AddDays(-1),
            null,
            Today);

        Assert.True(result);
    }

    [Fact]
    public void IsFinished_UsesEndDateForMultiDayEvents()
    {
        var result = EventLifecycleRules.IsFinished(
            Today.Date.AddDays(-1),
            Today.Date.AddDays(1),
            Today);

        Assert.False(result);
    }

    [Fact]
    public void GetRetentionUntil_AddsSixtyDaysToTheEffectiveEndDate()
    {
        var result = EventLifecycleRules.GetRetentionUntil(
            Today.Date,
            Today.Date.AddDays(2));

        Assert.Equal(Today.Date.AddDays(62), result);
    }
}
