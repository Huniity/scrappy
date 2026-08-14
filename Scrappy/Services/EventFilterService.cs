

using MongoDB.Bson;
using MongoDB.Driver;
using Scrappy.DTOs;
using Scrappy.Models;
using Scrappy.Models.Entities;
using Scrappy.Models.Entities.Enums;
using System.Text.RegularExpressions;

namespace Scrappy.Services;

public class EventFilterService
{
    public FilterDefinition<DistrictEvent> BuildFilter(
        DistrictName? district,
        EventType? type,
        DateTime? startDate,
        DateTime? endDate,
        decimal? minQualityScore,
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

        if (minQualityScore.HasValue)
            filters.Add(builder.Gte(e => e.Event.QualityScore, minQualityScore.Value));

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            var pattern = Regex.Escape(searchTerm.Trim());
            var regex = new BsonRegularExpression(pattern, "i");

            var searchFilter = builder.Or
                (
                    builder.Regex(e => e.Event.Title, regex),
                    builder.Regex(e => e.Event.Description, regex),
                    builder.Regex(e => e.Event.Location!.Name, regex)
                );

            filters.Add(searchFilter);
        }

        return filters.Count > 0 ? builder.And(filters) : builder.Empty;
    }
}
