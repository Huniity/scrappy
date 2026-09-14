

using Scrappy.Extensions;
using Scrappy.Integrations.WhatsApp;


namespace Scrappy.Services;

/// <summary>
/// Processes normalized incoming WhatsApp messages.
/// </summary>
public sealed class WhatsAppMessageProcessor(
    WhatsAppCommandResolver commandResolver,
    WhatsAppSubscriptionService subscriptionService,
    WhatsAppMessageIdempotencyService idempotencyService,
    WhatsAppClient whatsAppClient,
    ILogger<WhatsAppMessageProcessor> logger)
{
    public async Task ProcessAsync(
        IncomingWhatsAppMessage message,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(message);

        var canProcess = await idempotencyService.TryBeginAsync(
            message.MessageId,
            cancellationToken);

        if (!canProcess)
        {
            logger.LogInformation("Ignoring duplicate WhatsApp message {MessageId}.", message.MessageId);
            return;
        }

        try
        {
            if (!commandResolver.TryResolveFollow(message.Text, out var command) || command is null)
            {
                await whatsAppClient.SendTextAsync(
                    message.PhoneNumberId,
                    message.UserId,
                    "Comando inválido. Usa: Obter eventos de <localidade>.", cancellationToken);
                return;
            }

            await subscriptionService.SubscribeAsync(
                message.UserId,
                command.LocalitySlug,
                cancellationToken);

            var localityName =
                command.Locality.GetDisplayName();

            await whatsAppClient.SendTextAsync(
                message.PhoneNumberId,
                message.UserId,
                $"✅ Agora estás a seguir os eventos de {localityName}.", cancellationToken);
        }
        catch
        {
            try
            {
                await idempotencyService.ReleaseAsync(
                    message.MessageId,
                    CancellationToken.None);
            }
            catch (Exception releaseException)
            {
                logger.LogError(
                    releaseException,
                    "Could not release WhatsApp message {MessageId} " + "for retry.", message.MessageId);
            }

            throw;
        }
    }
}