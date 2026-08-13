

using System.Xml;

namespace Scrappy.Extensions;

/// <summary>
/// Provides extension methods for DateTime and TimeSpan types.
/// </summary>
public static class DateTimeExtensions
{
    /// <summary>
    /// Converts a DateTime to an ISO 8601 formatted string.
    /// 
    /// Example: A DateTime of January 1, 2024, at 12:00 PM UTC would be represented as "2024-01-01T12:00:00Z".
    /// </summary>
    /// <param name="dateTime"></param>
    /// <returns></returns>
    public static string ToIso8601String(this DateTime dateTime)
    {
        return dateTime.ToString("o");
    }

    /// <summary>
    /// Converts a TimeSpan to an ISO 8601 formatted string.
    /// 
    /// Example: A TimeSpan of 1 day, 2 hours, 30 minutes, and 15 seconds would be represented as "P1DT2H30M15S".
    /// </summary>
    /// <param name="timeSpan"></param>
    /// <returns></returns>
    public static string ToIso8601Duration(this TimeSpan timeSpan)
    {
        return XmlConvert.ToString(timeSpan);
    }
}