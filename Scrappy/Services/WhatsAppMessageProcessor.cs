

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
    MunicipalityCatalog municipalityCatalog,
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

                await whatsAppClient.SendTextAsync(
                    message.PhoneNumberId,
                    message.UserId,
                    confirmationMessage,
                    cancellationToken);

                var reportWindow =
                    reportWindowService.CreateImmediateWindow();

                WhatsAppEventSelection selection;

                try
                {
                    selection = await eventSelectionService.SelectAsync(
                        followCommand.Locality,
                        reportWindow.WindowStartUtc,
                        reportWindow.WindowEndUtc,
                        cancellationToken);
                }
                catch (Exception exception)
                    when (exception is not OperationCanceledException)
                {
                    logger.LogError(
                        exception,
                        "Could not select immediate WhatsApp events " +
                        "for locality {LocalitySlug}.",
                        followCommand.LocalitySlug);

                    await whatsAppClient.SendTextAsync(
                        message.PhoneNumberId,
                        message.UserId,
                        "Não foi possível carregar os eventos neste momento. " +
                        "A tua subscrição ficou ativa e receberás o próximo " +
                        "relatório semanal.",
                        cancellationToken);

                    return;
                }

                if (!selection.HasEvents)
                {
                    await whatsAppClient.SendTextAsync(
                        message.PhoneNumberId,
                        message.UserId,
                        eventMessageFormatter.FormatImmediateReport(selection),
                        cancellationToken);

                    return;
                }

                try
                {
                    var municipality =
                        municipalityCatalog.GetRequired(
                            selection.LocalitySlug);

                    var summaryParts =
                        eventMessageFormatter
                            .FormatTemplateEventSummaryParts(selection);

                    foreach (var summaryPart in summaryParts)
                    {
                        var templateParameters =
                            new WhatsAppEventsTemplateParameters(
                                localityName,
                                selection.TotalEventCount,
                                summaryPart,
                                municipality.LogoPath);

                        await whatsAppClient
                            .SendWeeklyEventsTemplateAsync(
                                message.PhoneNumberId,
                                message.UserId,
                                templateParameters,
                                cancellationToken);
                    }
                }
                catch (Exception exception)
                    when (exception is not OperationCanceledException)
                {
                    logger.LogError(
                        exception,
                        "Could not send immediate WhatsApp template " +
                        "for locality {LocalitySlug}.",
                        followCommand.LocalitySlug);

                    await whatsAppClient.SendTextAsync(
                        message.PhoneNumberId,
                        message.UserId,
                        eventMessageFormatter.FormatImmediateReport(selection),
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
