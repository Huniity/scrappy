using System.Text.Json;

namespace Scrappy.Integrations.WhatsApp;

/// <summary>
/// Parses incoming WhatsApp webhook payloads into normalized message objects.
/// </summary>
public sealed class WhatsAppMessageParser
{
    private const string WhatsAppObject = "whatsapp_business_account";

    /// <summary>
    /// Parses the given WhatsApp webhook payload into a list of normalized messages.
    /// </summary>
    /// <param name="payload">The raw webhook payload.</param>
    /// <returns>A list of normalized WhatsApp messages.</returns>
    public IReadOnlyList<IncomingWhatsAppMessage> Parse(ReadOnlyMemory<byte> payload)
    {
        if (payload.IsEmpty)
        {
            return [];
        }

        try
        {
            using var document = JsonDocument.Parse(payload);

            return ParseRoot(document.RootElement);
        }
        catch (JsonException)
        {
            return [];
        }
    }

    /// <summary>
    /// Parses the root JSON element of the WhatsApp webhook payload to extract normalized messages.
    /// </summary>
    /// <param name="root">The root JSON element.</param>
    /// <returns>A list of normalized WhatsApp messages.</returns>
    private static IReadOnlyList<IncomingWhatsAppMessage> ParseRoot(JsonElement root)
    {
        var messages = new List<IncomingWhatsAppMessage>();

        if (
            !TryGetString(root, "object", out var objectName)
            || !string.Equals(objectName, WhatsAppObject, StringComparison.Ordinal)
            || !TryGetArray(root, "entry", out var entries)
        )
        {
            return messages;
        }

        foreach (var entry in entries.EnumerateArray())
        {
            if (!TryGetArray(entry, "changes", out var changes))
            {
                continue;
            }

            foreach (var change in changes.EnumerateArray())
            {
                if (
                    !TryGetString(change, "field", out var field)
                    || !string.Equals(field, "messages", StringComparison.Ordinal)
                    || !TryGetObject(change, "value", out var value)
                )
                {
                    continue;
                }

                if (
                    !TryGetObject(value, "metadata", out var metadata)
                    || !TryGetString(metadata, "phone_number_id", out var phoneNumberId)
                    || !TryGetArray(value, "messages", out var incomingMessages)
                )
                {
                    continue;
                }

                foreach (var message in incomingMessages.EnumerateArray())
                {
                    if (
                        !TryGetString(message, "type", out var messageType)
                        || !TryGetString(message, "id", out var messageId)
                        || !TryGetString(message, "from", out var userId)
                        || !TryParseMessageContent(
                            message,
                            messageType,
                            out var text,
                            out var buttonPayload
                        )
                    )
                    {
                        continue;
                    }

                    messages.Add(
                        new IncomingWhatsAppMessage(
                            messageId,
                            userId,
                            phoneNumberId,
                            text,
                            buttonPayload
                        )
                    );
                }
            }
        }

        return messages;
    }

    /// <summary>
    /// Extracts supported text and quick-reply message content.
    /// </summary>
    private static bool TryParseMessageContent(
        JsonElement message,
        string messageType,
        out string text,
        out string? buttonPayload
    )
    {
        text = string.Empty;
        buttonPayload = null;

        if (string.Equals(messageType, "text", StringComparison.Ordinal))
        {
            return TryGetObject(message, "text", out var textObject)
                && TryGetString(textObject, "body", out text);
        }

        if (string.Equals(messageType, "button", StringComparison.Ordinal))
        {
            if (
                !TryGetObject(message, "button", out var button)
                || !TryGetString(button, "text", out text)
                || !TryGetString(button, "payload", out var payload)
            )
            {
                return false;
            }

            buttonPayload = payload;
            return true;
        }

        if (string.Equals(messageType, "interactive", StringComparison.Ordinal))
        {
            if (
                !TryGetObject(message, "interactive", out var interactive)
                || !TryGetString(interactive, "type", out var interactiveType)
                || !string.Equals(interactiveType, "button_reply", StringComparison.Ordinal)
                || !TryGetObject(interactive, "button_reply", out var buttonReply)
                || !TryGetString(buttonReply, "title", out text)
                || !TryGetString(buttonReply, "id", out var payload)
            )
            {
                return false;
            }

            buttonPayload = payload;
            return true;
        }

        return false;
    }

    /// <summary>
    /// Tries to get a JSON array property from the given parent element.
    /// </summary>
    /// <param name="parent">The parent JSON element.</param>
    /// <param name="propertyName">The name of the property to retrieve.</param>
    /// <param name="value">The output JSON array element.</param>
    /// <returns>True if the property exists and is an array; otherwise, false.</returns>
    private static bool TryGetArray(JsonElement parent, string propertyName, out JsonElement value)
    {
        value = default;

        return parent.ValueKind == JsonValueKind.Object
            && parent.TryGetProperty(propertyName, out value)
            && value.ValueKind == JsonValueKind.Array;
    }

    /// <summary>
    /// Tries to get a JSON object property from the given parent element.
    /// </summary>
    /// <param name="parent">The parent JSON element.</param>
    /// <param name="propertyName">The name of the property to retrieve.</param>
    /// <param name="value">The output JSON object element.</param>
    /// <returns>True if the property exists and is an object; otherwise, false.</returns>
    private static bool TryGetObject(JsonElement parent, string propertyName, out JsonElement value)
    {
        value = default;

        return parent.ValueKind == JsonValueKind.Object
            && parent.TryGetProperty(propertyName, out value)
            && value.ValueKind == JsonValueKind.Object;
    }

    /// <summary>
    /// Tries to get a string property from the given parent element.
    /// </summary>
    /// <param name="parent">The parent JSON element.</param>
    /// <param name="propertyName">The name of the property to retrieve.</param>
    /// <param name="value">The output string value.</param>
    /// <returns>True if the property exists and is a non-empty string; otherwise, false.</returns>
    private static bool TryGetString(JsonElement parent, string propertyName, out string value)
    {
        value = string.Empty;

        if (
            parent.ValueKind != JsonValueKind.Object
            || !parent.TryGetProperty(propertyName, out var property)
            || property.ValueKind != JsonValueKind.String
        )
        {
            return false;
        }

        var candidate = property.GetString();

        if (string.IsNullOrWhiteSpace(candidate))
        {
            return false;
        }

        value = candidate;
        return true;
    }
}
