

using Scrappy.Extensions;
using Scrappy.Integrations.WhatsApp;


namespace Scrappy.Services;

/// <summary>
/// Processes normalized incoming WhatsApp messages.
/// </summary>
public sealed class WhatsAppMessageProcessor(
    WhatsAppCommandResolver commandResolver,
    WhatsAppSubscriptionService subscriptionService,
    WhatsAppEventSelectionService eventSelectionService,
    WhatsAppReportWindowService reportWindowService,
    WhatsAppEventMessageFormatter eventMessageFormatter,
    WhatsAppMessageIdempotencyService idempotencyService,
    WhatsAppClient whatsAppClient,
    WhatsAppHelpCommand helpCommand,
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
            if (helpCommand.TryResolveHelp(message.Text))
            {
                await whatsAppClient.SendTextAsync(
                    message.PhoneNumberId,
                    message.UserId,
                    helpCommand.GetHelpMessage(),
                    cancellationToken);

                return;
            }

            if (commandResolver.TryResolveFollow(
                    message.Text,
                    out var followCommand) &&
                followCommand is not null)
            {
                var subscribeResult =
                    await subscriptionService.SubscribeAsync(
                        message.UserId,
                        followCommand.LocalitySlug,
                        cancellationToken);

                var localityName =
                    followCommand.Locality.GetDisplayName();

                var confirmationMessage = subscribeResult switch
                {
                    WhatsAppSubscribeResult.Created =>
                        $"✅ Agora estás a seguir os eventos de {localityName}.",

                    WhatsAppSubscribeResult.Reactivated =>
                        $"✅ Voltaste a seguir os eventos de {localityName}.",

                    WhatsAppSubscribeResult.AlreadyActive =>
                        $"ℹ️ Já estás a seguir os eventos de {localityName}.",

                    _ => throw new InvalidOperationException(
                        "Unknown WhatsApp subscription result.")
                };

                if (subscribeResult ==
                    WhatsAppSubscribeResult.AlreadyActive)
                {
                    await whatsAppClient.SendTextAsync(
                        message.PhoneNumberId,
                        message.UserId,
                        confirmationMessage,
                        cancellationToken);

                    return;
                }

                var reportWindow =
                    reportWindowService.CreateImmediateWindow();

                try
                {
                    var selection =
                        await eventSelectionService.SelectAsync(
                            followCommand.Locality,
                            reportWindow.WindowStartUtc,
                            reportWindow.WindowEndUtc,
                            cancellationToken);

                    var reportMessage =
                        eventMessageFormatter.FormatImmediateReport(
                            selection);

                    await whatsAppClient.SendTextAsync(
                        message.PhoneNumberId,
                        message.UserId,
                        confirmationMessage +
                        "\n\n" +
                        reportMessage,
                        cancellationToken);
                }
                catch (Exception exception)
                    when (exception is not OperationCanceledException)
                {
                    logger.LogError(
                        exception,
                        "Could not create the immediate WhatsApp event " +
                        "report for locality {LocalitySlug}.",
                        followCommand.LocalitySlug);

                    await whatsAppClient.SendTextAsync(
                        message.PhoneNumberId,
                        message.UserId,
                        confirmationMessage +
                        "\n\nNão foi possível carregar os eventos neste momento. " +
                        "A tua subscrição ficou ativa e receberás o próximo " +
                        "relatório semanal.",
                        cancellationToken);
                }

                return;
            }

        if (commandResolver.TryResolveStop( message.Text, out var stopCommand) && stopCommand is not null)
        {
            var wasUnsubscribed =
                await subscriptionService.UnsubscribeAsync(
                    message.UserId,
                    stopCommand.LocalitySlug,
                    cancellationToken);

            var localityName =
                stopCommand.Locality.GetDisplayName();

            var confirmationMessage = wasUnsubscribed
                ? $"ℹ️ Deixaste de seguir os eventos de {localityName}."
                : $"ℹ️ Não tens uma subscrição ativa para os eventos de {localityName}.";

            await whatsAppClient.SendTextAsync(
                message.PhoneNumberId,
                message.UserId,
                confirmationMessage,
                cancellationToken);

            return;
        }

        await whatsAppClient.SendTextAsync(
            message.PhoneNumberId,
            message.UserId,
            " ❌ Comando inválido. Usa: Obter eventos de <localidade> ou Stop <localidade>.",
            cancellationToken);
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