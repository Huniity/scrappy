using MongoDB.Bson;
using MongoDB.Driver;
using Scrappy.DTOs;
using Scrappy.Models;

namespace Scrappy.Services;

public class EventFilterService
{
    public FilterDefinition<DistrictEvent> BuildFilter(
        DistrictName? district,
        EventType? type,
        DateTime? startDate,
        DateTime? endDate,
        string? searchTerm)
    {
        var builder = Builders<DistrictEvent>.Filter;
        var filters = new List<FilterDefinition<DistrictEvent>>();

        if (district.HasValue)
            filters.Add(builder.Eq(e => e.District, district.Value));

        if (type.HasValue)
            filters.Add(builder.Eq(e => e.Event.Type, type.Value));

        if (startDate.HasValue)
            filters.Add(builder.Gte(e => e.Event.StartDate, startDate.Value));

        if (endDate.HasValue)
            filters.Add(builder.Lte(e => e.Event.StartDate, endDate.Value));

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            var regex = new MongoDB.Bson.BsonRegularExpression(searchTerm, "i");
            filters.Add(builder.Regex(e => e.Event.Title, regex));
            filters.Add(builder.Regex(e => e.Event.Description, regex));
            filters.Add(builder.Regex(e => e.Event.Location, regex));
        }

        return filters.Count > 0 ? builder.And(filters) : builder.Empty;
    }
}