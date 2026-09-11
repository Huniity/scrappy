

using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Scrappy.Integrations.WhatsApp;

namespace Scrappy.Controllers.Webhooks;

/// <summary>
/// Controller for handling WhatsApp webhook verification requests.
/// </summary>
[ApiController]
[Route("webhooks/whatsapp")]
public sealed class WhatsAppWebhookController(
    IOptions<WhatsAppOptions> options ) : ControllerBase
{
    private readonly WhatsAppOptions _options = options.Value;

    [HttpGet]
    [Produces("text/plain")]
    public IActionResult Verify(
        [FromQuery(Name = "hub.mode")] string? mode,
        [FromQuery(Name = "hub.verify_token")] string? verifyToken,
        [FromQuery(Name = "hub.challenge")] string? challenge)
    {
        var validRequest = string.Equals(mode, "subscribe", StringComparison.OrdinalIgnoreCase) &&
                            !string.IsNullOrEmpty(_options.VerifyToken) &&
                           string.Equals(verifyToken, _options.VerifyToken, StringComparison.Ordinal);
    
        if (!validRequest)
        {
            return StatusCode(StatusCodes.Status403Forbidden, "Invalid verification token");
        }

        if (string.IsNullOrEmpty(challenge))
        {
            return BadRequest("Missing challenge parameter");
        }

        return Content(challenge, "text/plain", Encoding.UTF8);
    }
}
    