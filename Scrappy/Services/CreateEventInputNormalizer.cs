using System.Text;

namespace Scrappy.Services;

public static class CreateEventInputNormalizer
{
    private const int MaximumDescriptionLength = 2000;

    public static string NormalizeDescription(string? description, string title)
    {
        var normalized = description?.Trim();

        if (string.IsNullOrWhiteSpace(normalized) || normalized.Length < 10)
            normalized = $"Evento: {title.Trim()}";

        return TruncateDescription(normalized!, MaximumDescriptionLength);
    }

    public static bool TryNormalizeDates(
        DateTime startDateInput,
        DateTime? endDateInput,
        out DateTime startDate,
        out DateTime? endDate,
        out string error)
    {
        startDate = default;
        endDate = null;
        error = string.Empty;

        if (startDateInput == default)
        {
            error = "Invalid startDate.";
            return false;
        }

        try
        {
            startDate = NormalizeStartDate(startDateInput);
            endDate = NormalizeEndDate(endDateInput);
        }
        catch (ArgumentOutOfRangeException)
        {
            error = "Invalid start or end date.";
            return false;
        }

        return true;
    }

    public static DateTime NormalizeStartDate(DateTime value) =>
        value.Kind == DateTimeKind.Unspecified &&
        value.TimeOfDay == TimeSpan.Zero
            ? DateTime.SpecifyKind(value.Date, DateTimeKind.Utc)
            : value.Kind == DateTimeKind.Utc
                ? value
                : value.Kind == DateTimeKind.Local
                    ? value.ToUniversalTime()
                    : DateTime.SpecifyKind(value, DateTimeKind.Utc);

    public static DateTime? NormalizeEndDate(DateTime? value)
    {
        if (!value.HasValue)
            return null;

        var date = value.Value;

        if (date.Kind == DateTimeKind.Unspecified &&
            date.TimeOfDay == TimeSpan.Zero)
        {
            return DateTime.SpecifyKind(
                date.Date.AddDays(1).AddTicks(-1),
                DateTimeKind.Utc);
        }

        return date.Kind == DateTimeKind.Utc
            ? date
            : date.Kind == DateTimeKind.Local
                ? date.ToUniversalTime()
                : DateTime.SpecifyKind(date, DateTimeKind.Utc);
    }

    private static string TruncateDescription(string value, int maximumLength)
    {
        if (value.Length <= maximumLength)
            return value;

        var builder = new StringBuilder(maximumLength);

        foreach (var rune in value.EnumerateRunes())
        {
            if (builder.Length + rune.Utf16SequenceLength > maximumLength)
                break;

            builder.Append(rune.ToString());
        }

        return builder.ToString();
    }
}
