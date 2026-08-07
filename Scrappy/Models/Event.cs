

using System;
using System.Globalization;
using System.Security.Cryptography.X509Certificates;

namespace Scrappy.Models;

public class Event
{
    public Guid Id {get; set; } = Guid.NewGuid();
    public string Title {get; set; } = string.Empty;
    public string? Description {get; set; }
    public DateTime StartDate {get; set; }
    public DateTime? EndDate {get; set; }
    public string? Location {get; set; }
    public string SourceUrl {get; set; } = string.Empty;
    public EventType? Type {get; set; }
    public decimal QualityScore {get; set; }

    public static DateTime? ParsingDate(string? input)
    {
        if (string.IsNullOrWhiteSpace(input)) return null;

        if (DateTime.TryParseExact(input.Trim(), "yyyy-MM-dd HH:mm", CultureInfo.InvariantCulture, DateTimeStyles.None, out DateTime parsedDate))
        {
            return parsedDate;
        }

        return null;
    }
}

public enum EventType
{
    Concerto,
    Feira,
    Mercado,
    FestaPopular,
    Teatro,
    Festival,
    Exposição,
    Outro, 
}
