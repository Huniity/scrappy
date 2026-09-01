using Scrappy.Models;
using Scrappy.Models.Entities;
using Scrappy.Models.Entities.Enums;
using Scrappy.Services;

namespace Scrappy.Tests;

public class EventDeduplicationServiceTests
{
    [Fact]
    public void MatchesCrossSourceTitleVariantWithTimezoneLikeDifference()
    {
        var bol = CreateEvent(
            "MUITO FAÇO EU - com Ana Arrebentinha",
            new DateTime(2026, 10, 17, 20, 0, 0, DateTimeKind.Utc),
            "https://www.bol.pt/event/184026");
        var viral = CreateEvent(
            "Muito Faço Eu - Ana Arrebentinha",
            new DateTime(2026, 10, 17, 19, 0, 0, DateTimeKind.Utc),
            "https://www.viralagenda.com/pt/events/1842236/example");

        Assert.True(EventDeduplicationService.IsMatch(bol, viral));
    }

    [Fact]
    public void DoesNotMergeDifferentSessionsFromTheSameSource()
    {
        var first = CreateEvent(
            "Muito Faço Eu - Ana Arrebentinha",
            new DateTime(2026, 10, 17, 19, 0, 0, DateTimeKind.Utc),
            "https://www.bol.pt/event/first");
        var second = CreateEvent(
            "Muito Faço Eu - Ana Arrebentinha",
            new DateTime(2026, 10, 17, 20, 0, 0, DateTimeKind.Utc),
            "https://www.bol.pt/event/second");

        Assert.False(EventDeduplicationService.IsMatch(first, second));
    }

    [Fact]
    public void MergeKeepsTicketingDataAndAddsRicherEditorialData()
    {
        var bol = CreateEvent(
            "MUITO FAÇO EU - com Ana Arrebentinha",
            new DateTime(2026, 10, 17, 20, 0, 0, DateTimeKind.Utc),
            "https://www.bol.pt/event/184026");
        bol.Event.Description = "Short description";
        bol.Event.Type = EventType.Outro;
        bol.Event.Offers.Add(new OfferModel { Name = "Bilhete", Price = 10 });

        var viral = CreateEvent(
            "Muito Faço Eu - Ana Arrebentinha",
            new DateTime(2026, 10, 17, 19, 0, 0, DateTimeKind.Utc),
            "https://www.viralagenda.com/pt/events/1842236/example");
        viral.Event.Description = "A substantially richer description of the performance and its artist.";
        viral.Event.Type = EventType.Teatro;
        viral.Event.Keywords.Add("comedia");
        viral.Event.Organizer.Add(new AgentModel { Name = "ACTA TEATRO" });

        var changed = EventDeduplicationService.Merge(bol, viral);

        Assert.Contains("description", changed);
        Assert.Contains("type", changed);
        Assert.Equal(EventType.Teatro, bol.Event.Type);
        Assert.Contains("comedia", bol.Event.Keywords);
        Assert.Single(bol.Event.Offers);
        Assert.Equal(2, bol.Event.SourceUrls.Count);
    }

    [Fact]
    public void MergeUsesBolTimeRegardlessOfArrivalOrder()
    {
        var viral = CreateEvent(
            "Muito Faço Eu - Ana Arrebentinha",
            new DateTime(2026, 10, 17, 19, 0, 0, DateTimeKind.Utc),
            "https://www.viralagenda.com/pt/events/1842236/example");
        viral.Event.EndDate = new DateTime(2026, 10, 17, 20, 10, 0, DateTimeKind.Utc);

        var bol = CreateEvent(
            "MUITO FAÇO EU - com Ana Arrebentinha",
            new DateTime(2026, 10, 17, 20, 0, 0, DateTimeKind.Utc),
            "https://www.bol.pt/event/184026");
        bol.Event.Duration = "PT1H";

        var changed = EventDeduplicationService.Merge(viral, bol);

        Assert.Contains("startDate", changed);
        Assert.Equal(bol.Event.StartDate, viral.Event.StartDate);
        Assert.Equal(new DateTime(2026, 10, 17, 21, 0, 0, DateTimeKind.Utc), viral.Event.EndDate);
        Assert.Equal(bol.Event.SourceUrl, viral.Event.SourceUrl);
    }

    private static DistrictEvent CreateEvent(string title, DateTime start, string sourceUrl) => new()
    {
        District = DistrictName.Faro,
        Event = new Event
        {
            Title = title,
            Description = title,
            StartDate = start,
            SourceUrl = sourceUrl,
            SourceUrls = [sourceUrl],
            Location = new EventLocation
            {
                Name = "Teatro Lethes",
                Locality = LocalityName.Faro,
                District = DistrictName.Faro,
                Region = Nuts2Region.PT15,
                Latitude = 37.01835,
                Longitude = -7.93179
            }
        }
    };
}
