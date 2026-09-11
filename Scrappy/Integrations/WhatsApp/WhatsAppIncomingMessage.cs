

namespace Scrappy.Integrations.WhatsApp;


/// <summary>
/// Represents an incoming WhatsApp text message after normalization.
/// </summary>
/// <param name="MessageId">
/// Unique message identifier assigned by Meta.
/// </param>
/// <param name="UserId">
/// WhatsApp identifier of the user who sent the message.
/// </param>
/// <param name="PhoneNumberId">
/// Meta identifier of the WhatsApp number that received the message.
/// </param>
/// <param name="Text">
/// Text sent by the user like a subscription message or a command.
/// </param>
public sealed record IncomingWhatsAppMessage(
    string MessageId,
    string UserId,
    string PhoneNumberId,
    string Text);