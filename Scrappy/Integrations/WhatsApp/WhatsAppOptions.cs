

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

    /// <summary> The maximum number of events to include in a single WhatsApp message. </summary>
    public int MaxEventsPerMessage { get; init; } = 100;

    /// <summary> Maximum length of the dynamic event summary sent to a template. </summary>
    public int MaxTemplateSummaryCharacters { get; init; } = 800;

    /// <summary> Maximum number of template messages sent for one report. </summary>
    public int MaxTemplateMessagesPerReport { get; init; } = 3;

    /// <summary> The time zone to use for generating messages. </summary>
    public string MessageTimeZone { get; init; } = "Europe/Lisbon";

    /// <summary>Name of the approved template for reports containing events.</summary>
    public string WeeklyEventsTemplateName { get; init; } = "scrappy_weekly_events";

    /// <summary>Name of the approved template for reports without events.</summary>
    public string NoEventsTemplateName { get; init; } = "scrappy_no_events";

    /// <summary>Language code used by the approved WhatsApp templates.</summary>
    public string TemplateLanguageCode { get; init; } = "pt_PT";

    /// <summary> Public HTTPS base URL used for WhatsApp-accessible resources. </summary>
    public string PublicBaseUrl { get; init; } = string.Empty;
}
