using System.Globalization;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using Microsoft.Extensions.Options;

namespace Scrappy.Integrations.WhatsApp;

/// <summary>
/// A client for sending messages via the Meta WhatsApp Business API.
/// </summary>
public sealed class WhatsAppClient(
    HttpClient httpClient,
    IOptions<WhatsAppOptions> options,
    ILogger<WhatsAppClient> logger)
{
    /// <summary> 
    /// The configured WhatsApp options, including access token, app secret, phone number ID, WABA ID, verify token, and Graph API version.
    /// </summary>
    private readonly WhatsAppOptions _options = options.Value;

    /// <summary>
    /// Sends a text message to a specified recipient via the Meta WhatsApp API.
    /// </summary>
    /// <param name="phoneNumberId">The phone number ID associated with the WhatsApp Business API.</param>
    /// <param name="recipient">The recipient's phone number in international format (e.g., +1234567890).</param>
    /// <param name="message">The text message to send.</param>
    /// <param name="cancellationToken">A cancellation token to observe while waiting for the task to complete.</param>
    /// <exception cref="ArgumentException">Thrown when any of the required parameters are null, empty, or whitespace.</exception>
    /// <exception cref="InvalidOperationException">Thrown when the WhatsApp access token is not configured.</exception>
    /// <exception cref="HttpRequestException">Thrown when the Meta WhatsApp API returns an error.</exception>
    public async Task SendTextAsync(
        string phoneNumberId,
        string recipient,
        string message,
        CancellationToken cancellationToken = default)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(phoneNumberId);
        ArgumentException.ThrowIfNullOrWhiteSpace(recipient);
        ArgumentException.ThrowIfNullOrWhiteSpace(message);

        var payload = new
        {
            messaging_product = "whatsapp",
            recipient_type = "individual",
            to = recipient.Trim(),
            type = "text",
            text = new
            {
                preview_url = false,
                body = message
            }
        };

        await SendPayloadAsync(
            phoneNumberId,
            payload,
            cancellationToken);
    }


    /// <summary>
    /// Combines the configured public base URL with a relative resource path.
    /// </summary>
    private string BuildPublicUrl(string relativePath)
    {
        if (!Uri.TryCreate(
                _options.PublicBaseUrl?.Trim(),
                UriKind.Absolute,
                out var baseUri) ||
            baseUri.Scheme != Uri.UriSchemeHttps)
        {
            throw new InvalidOperationException("WhatsApp PublicBaseUrl must be a valid HTTPS URL.");
        }

        var normalizedBaseUrl =
            baseUri.AbsoluteUri.TrimEnd('/') + "/";

        return new Uri(
            new Uri(normalizedBaseUrl),
            relativePath.TrimStart('/'))
            .AbsoluteUri;
    }


    /// <summary>
    /// Sends a message payload through the Meta WhatsApp API.
    /// </summary>
    private async Task SendPayloadAsync(
        string phoneNumberId,
        object payload,
        CancellationToken cancellationToken)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(phoneNumberId);
        ArgumentNullException.ThrowIfNull(payload);

        if (string.IsNullOrWhiteSpace(_options.AccessToken))
        {
            throw new InvalidOperationException("WhatsApp access token is not configured.");
        }

        var graphApiVersion = GetGraphApiVersion();

        var requestUri =
            $"{graphApiVersion}/" +
            $"{Uri.EscapeDataString(phoneNumberId.Trim())}/messages";

        using var request = new HttpRequestMessage(
            HttpMethod.Post,
            requestUri);

        request.Headers.Authorization =
            new AuthenticationHeaderValue("Bearer", _options.AccessToken);

        request.Content = JsonContent.Create(payload);

        using var response = await httpClient.SendAsync(
            request,
            cancellationToken);

        if (response.IsSuccessStatusCode)
        {
            return;
        }

        var metaRequestId = response.Headers.TryGetValues(
            "x-fb-request-id",
            out var requestIds)
                ? requestIds.FirstOrDefault()
                : null;

        logger.LogError(
            "Meta WhatsApp API returned HTTP {StatusCode}. " +
            "Meta request ID: {MetaRequestId}.",
            (int)response.StatusCode,
            metaRequestId);

        throw new HttpRequestException(
            $"Meta WhatsApp API returned HTTP " +
            $"{(int)response.StatusCode}.",
            inner: null,
            response.StatusCode);
    }

    public async Task SendHelpTemplateAsync(
        string phoneNumberId,
        string recipient,
        CancellationToken cancellationToken = default)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(phoneNumberId);
        ArgumentException.ThrowIfNullOrWhiteSpace(recipient);

        if (string.IsNullOrWhiteSpace(
            _options.HelpTemplateName))
        {
            throw new InvalidOperationException("WhatsApp help template name is not configured.");
        }

        if (string.IsNullOrWhiteSpace(
            _options.TemplateLanguageCode))
        {
            throw new InvalidOperationException("WhatsApp template language is not configured.");
        }

        var payload = new
        {
            messaging_product = "whatsapp",
            recipient_type = "individual",
            to = recipient.Trim(),
            type = "template",
            template = new
            {
                name = _options.HelpTemplateName.Trim(),
                language = new
                {
                    code = _options.TemplateLanguageCode.Trim()
                }
            }
        };

        await SendPayloadAsync(
            phoneNumberId,
            payload,
            cancellationToken);
    }



    /// <summary>
    /// Sends the approved WhatsApp weekly-events summary template.
    /// </summary>
    public async Task SendWeeklyEventsTemplateAsync(
        string phoneNumberId,
        string recipient,
        WhatsAppEventsTemplateParameters parameters,
        CancellationToken cancellationToken = default)
    {

        ArgumentException.ThrowIfNullOrWhiteSpace(phoneNumberId);

        ArgumentException.ThrowIfNullOrWhiteSpace(recipient);

        ArgumentNullException.ThrowIfNull(parameters);

        ArgumentException.ThrowIfNullOrWhiteSpace(parameters.LocalityName);

        ArgumentException.ThrowIfNullOrWhiteSpace(parameters.LocalitySlug);

        ArgumentException.ThrowIfNullOrWhiteSpace(parameters.LogoPath);

        if (parameters.EventCount < 1)
        {
            throw new ArgumentOutOfRangeException(
                nameof(parameters),
                "The events template requires at least one event.");
        }

        var reportLengthInDays =
            parameters.WindowEndDate.DayNumber -
            parameters.WindowStartDate.DayNumber;

        if (reportLengthInDays is < 0 or > 6)
        {
            throw new ArgumentException(
                "The events template requires a valid report window " +
                "of no more than seven calendar days.",
                nameof(parameters));
        }

        if (string.IsNullOrWhiteSpace(
                _options.WeeklyEventsTemplateName))
        {
            throw new InvalidOperationException(
                "WhatsApp weekly events template name is not configured.");
        }

        if (string.IsNullOrWhiteSpace(
                _options.TemplateLanguageCode))
        {
            throw new InvalidOperationException(
                "WhatsApp template language is not configured.");
        }

        var localitySlug = parameters.LocalitySlug.Trim().ToLowerInvariant();

        var logoUrl = BuildPublicUrl(parameters.LogoPath);

        var quickReplyPayload = string.Join(
            ':',
            "event_report",
            localitySlug,
            parameters.WindowStartDate.ToString(
                "yyyy-MM-dd",
                CultureInfo.InvariantCulture),
            parameters.WindowEndDate.ToString(
                "yyyy-MM-dd",
                CultureInfo.InvariantCulture));

        var payload = new
        {
            messaging_product = "whatsapp",
            recipient_type = "individual",
            to = recipient.Trim(),
            type = "template",
            template = new
            {
                name = _options.WeeklyEventsTemplateName.Trim(),
                language = new
                {
                    code = _options.TemplateLanguageCode.Trim()
                },
                components = new object[]
                {
                    new
                    {
                        type = "header",
                        parameters = new object[]
                        {
                            new
                            {
                                type = "image",
                                image = new
                                {
                                    link = logoUrl
                                }
                            }
                        }
                    },
                    new
                    {
                        type = "body",
                        parameters = new object[]
                        {
                            new
                            {
                                type = "text",
                                text =
                                parameters.LocalityName.Trim()
                            },
                            new
                            {
                                type = "text",
                                text =
                                parameters.EventCount
                                .ToString(
                                    CultureInfo.InvariantCulture)
                            }
                        }
                    },
                    new
                    {
                        type = "button",
                        sub_type = "quick_reply",
                        index = "0",
                        parameters = new object[]
                        {
                            new
                            {
                                type = "payload",
                                payload =
                                quickReplyPayload
                            }
                        }
                    },
                    new
                    {
                        type = "button",
                        sub_type = "url",
                        index = "1",
                        parameters = new object[]
                        {
                            new
                            {
                                type = "text",
                                text = localitySlug
                            }
                        }
                    }
                }
            }
        };

        await SendPayloadAsync(
            phoneNumberId,
            payload,
            cancellationToken);
    }


    /// <summary> Retrieves the configured Graph API version for the WhatsApp Business API, ensuring it is valid and properly formatted. </summary>
    /// <returns>The Graph API version string, prefixed with 'v' if not already present.</returns>
    /// <exception cref="InvalidOperationException">Thrown if the Graph API version is not configured or is invalid.</exception>
    private string GetGraphApiVersion()
    {
        var version = _options.GraphApiVersion
            .Trim()
            .Trim('/');

        if (string.IsNullOrWhiteSpace(version))
        {
            throw new InvalidOperationException(
                "WhatsApp Graph API version is not configured.");
        }

        return version.StartsWith(
            "v",
            StringComparison.OrdinalIgnoreCase)
                ? version
                : $"v{version}";
    }
}
