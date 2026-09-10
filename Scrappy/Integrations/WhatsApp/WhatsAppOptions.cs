

namespace Scrappy.Integrations.WhatsApp;


/// <summary>
/// Represents the configuration options for the WhatsApp Business API integration.
/// </summary>
public sealed class WhatsAppOptions
{
    /// <summary> The name of the configuration section for WhatsApp options. </summary>
    public const string SectionName = "WhatsApp";

    /// <summary> The access token for the WhatsApp Business API. </summary>
    public string AccessToken { get; set; } = string.Empty;

    /// <summary> The app secret for the WhatsApp Business API. </summary>
    public string AppSecret { get; set; } = string.Empty;

    /// <summary> The phone number ID for the WhatsApp Business API. </summary>
    public string PhoneNumberId { get; set; } = string.Empty;

    /// <summary> The WABA ID for the WhatsApp Business API. </summary>
    public string WabaId { get; set; } = string.Empty;

    /// <summary> The verify token for the WhatsApp Business API. </summary>
    public string VerifyToken { get; set; } = string.Empty;

    /// <summary> The Graph API version for the WhatsApp Business API. </summary>
    public string GraphApiVersion { get; init; } = string.Empty;
}