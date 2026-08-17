using Scrappy.Models;
using Scrappy.Models.Entities;
using Scrappy.Models.Entities.Enums;
using Scrappy.Validators;

namespace Scrappy.Tests;

public class EventDuplicateValidatorTests
{
    private static readonly DateTime StartDate = new(2026, 8, 14, 20, 0, 0);

    [Fact]
    public void HasDuplicate_ReturnsTrueForSameTitleDistrictAndStartDate()
    {
        var events = new[]
        {
            CreateEvent("other-event", "Festival de Verão", DistrictName.Faro, StartDate)
        };

        var result = Validator.HasDuplicate(
            events,
            "current-event",
            "Festival de Verão",
            DistrictName.Faro,
            StartDate);

        Assert.True(result);
    }

    [Fact]
    public void HasDuplicate_IgnoresTheEventBeingUpdated()
    {
        var events = new[]
        {
            CreateEvent("current-event", "Festival de Verão", DistrictName.Faro, StartDate)
        };

        var result = Validator.HasDuplicate(
            events,
            "current-event",
            "Festival de Verão",
            DistrictName.Faro,
            StartDate);

        Assert.False(result);
    }

    [Fact]
    public void HasDuplicate_TreatsTitleCaseAndOuterSpacesAsEqual()
    {
        var events = new[]
        {
            CreateEvent("other-event", "Festival de Verão", DistrictName.Faro, StartDate)
        };

        var result = Validator.HasDuplicate(
            events,
            "current-event",
            " festival DE verão ",
            DistrictName.Faro,
            StartDate);

        Assert.True(result);
    }

    [Fact]
    public void HasDuplicate_ReturnsFalseWhenDistrictIsDifferent()
    {
        var events = new[]
        {
            CreateEvent("other-event", "Festival de Verão", DistrictName.Faro, StartDate)
        };

        var result = Validator.HasDuplicate(
            events,
            "current-event",
            "Festival de Verão",
            DistrictName.Lisboa,
            StartDate);

        Assert.False(result);
    }

    [Fact]
    public void HasDuplicate_ReturnsFalseWhenStartDateIsDifferent()
    {
        var events = new[]
        {
            CreateEvent("other-event", "Festival de Verão", DistrictName.Faro, StartDate)
        };

        var result = Validator.HasDuplicate(
            events,
            "current-event",
            "Festival de Verão",
            DistrictName.Faro,
            StartDate.AddDays(1));

        Assert.False(result);
    }

    private static DistrictEvent CreateEvent(
        string id,
        string title,
        DistrictName district,
        DateTime startDate) => new()
        {
            Id = id,
            District = district,
            Event = new Event
            {
                Title = title,
                StartDate = startDate
            }
        };
}
