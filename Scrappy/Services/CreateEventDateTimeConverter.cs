using System.Globalization;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Scrappy.Services;

public sealed class CreateEventDateTimeConverter : JsonConverter<DateTime>
{
    public override DateTime Read(
        ref Utf8JsonReader reader,
        Type typeToConvert,
        JsonSerializerOptions options)
    {
        if (reader.TokenType != JsonTokenType.String)
            throw new JsonException("Event dates must be ISO 8601 strings.");

        return CreateEventDateTimeParser.Parse(reader.GetString());
    }

    public override void Write(
        Utf8JsonWriter writer,
        DateTime value,
        JsonSerializerOptions options)
    {
        var serialized = value.Kind == DateTimeKind.Unspecified &&
                         value.TimeOfDay == TimeSpan.Zero
            ? value.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture)
            : value.ToUniversalTime().ToString("O", CultureInfo.InvariantCulture);

        writer.WriteStringValue(serialized);
    }
}

public sealed class NullableCreateEventDateTimeConverter : JsonConverter<DateTime?>
{
    public override DateTime? Read(
        ref Utf8JsonReader reader,
        Type typeToConvert,
        JsonSerializerOptions options)
    {
        if (reader.TokenType == JsonTokenType.Null)
            return null;

        if (reader.TokenType != JsonTokenType.String)
            throw new JsonException("Event dates must be ISO 8601 strings.");

        return CreateEventDateTimeParser.Parse(reader.GetString());
    }

    public override void Write(
        Utf8JsonWriter writer,
        DateTime? value,
        JsonSerializerOptions options)
    {
        if (!value.HasValue)
        {
            writer.WriteNullValue();
            return;
        }

        var date = value.Value;
        var serialized = date.Kind == DateTimeKind.Unspecified &&
                         date.TimeOfDay == TimeSpan.Zero
            ? date.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture)
            : date.ToUniversalTime().ToString("O", CultureInfo.InvariantCulture);

        writer.WriteStringValue(serialized);
    }
}

internal static class CreateEventDateTimeParser
{
    public static DateTime Parse(string? input)
    {
        if (string.IsNullOrWhiteSpace(input))
            throw new JsonException("Event dates cannot be empty.");

        var value = input.Trim();

        if (DateTime.TryParseExact(
                value,
                "yyyy-MM-dd",
                CultureInfo.InvariantCulture,
                DateTimeStyles.None,
                out var calendarDate))
        {
            return DateTime.SpecifyKind(calendarDate, DateTimeKind.Unspecified);
        }

        if (!HasExplicitTimezoneOffset(value) ||
            !DateTimeOffset.TryParse(
                value,
                CultureInfo.InvariantCulture,
                DateTimeStyles.None,
                out var dateTime))
        {
            throw new JsonException(
                "Use yyyy-MM-dd or an ISO 8601 date-time with a timezone offset.");
        }

        return dateTime.UtcDateTime;
    }

    private static bool HasExplicitTimezoneOffset(string value)
    {
        if (value.EndsWith('Z') || value.EndsWith('z'))
            return true;

        var offsetStart = Math.Max(value.LastIndexOf('+'), value.LastIndexOf('-'));

        return offsetStart >= 10 &&
               value.Length - offsetStart == 6 &&
               value[offsetStart + 3] == ':' &&
               IsDigit(value[offsetStart + 1]) &&
               IsDigit(value[offsetStart + 2]) &&
               IsDigit(value[offsetStart + 4]) &&
               IsDigit(value[offsetStart + 5]);
    }

    private static bool IsDigit(char value) => value is >= '0' and <= '9';
}
