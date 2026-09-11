

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
    /// Sends a text message to a specified recipient using the WhatsApp Business API.
    /// </summary>
    /// <param name="phoneNumberId">The phone number ID associated with the WhatsApp Business API account.</param>
    /// <param name="recipient">The recipient's phone number in international format.</param>
    /// <param name="message">The text message to be sent.</param>
    /// <param name="cancellationToken">A token to monitor for cancellation requests.</param>
    /// <returns>A task that represents the asynchronous operation.</returns>   
    public async Task SendTextAsync(
        string phoneNumberId,
        string recipient,
        string message,
        CancellationToken cancellationToken = default)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(phoneNumberId);
        ArgumentException.ThrowIfNullOrWhiteSpace(recipient);
        ArgumentException.ThrowIfNullOrWhiteSpace(message);

        if (string.IsNullOrWhiteSpace(_options.AccessToken))
        {
            throw new InvalidOperationException(
                "WhatsApp access token is not configured.");
        }

        var graphApiVersion = GetGraphApiVersion();

        var requestUri =
            $"{graphApiVersion}/" +
            $"{Uri.EscapeDataString(phoneNumberId.Trim())}/messages";

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

        using var request = new HttpRequestMessage(
            HttpMethod.Post,
            requestUri);

        request.Headers.Authorization =
            new AuthenticationHeaderValue(
                "Bearer",
                _options.AccessToken);

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