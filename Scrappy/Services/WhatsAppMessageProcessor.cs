

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
    /// <summary>
    /// Processes an incoming WhatsApp message.
    /// </summary>
    /// <param name="message">The incoming WhatsApp message to process.</param>
    /// <param name="cancellationToken">A cancellation token to observe while waiting for the task to complete.</param>
    /// <returns>A task that represents the asynchronous operation.</returns>
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

        var releaseMessageOnFailure = true;

        try
        {
            if (commandResolver.TryResolveEventReport(
                    message.ButtonPayload,
                    out var reportRequest) &&
                reportRequest is not null)
            {
                var localityName = reportRequest.Locality.GetDisplayName();

                var isSubscribed =
                    await subscriptionService.IsSubscribedAsync(
                        message.UserId,
                        reportRequest.LocalitySlug,
                        cancellationToken);

                if (!isSubscribed)
                {
                    await whatsAppClient.SendTextAsync(
                        message.PhoneNumberId,
                        message.UserId,
                        $"ℹ️ Já não tens uma subscrição ativa para os " +
                        $"eventos de {localityName}. Envia \"Subscrever " +
                        $"{reportRequest.LocalitySlug}\" para voltares a subscrever.",
                        cancellationToken);

                    return;
                }

                var reportWindow =
                reportWindowService.CreateWindow(
                    reportRequest.WindowStartDate,
                    reportRequest.WindowEndDate);

                WhatsAppEventSelection selection;

                try
                {
                    selection = await
                    eventSelectionService.SelectAsync(
                        reportRequest.Locality,
                        reportWindow.WindowStartUtc,
                        reportWindow.WindowEndUtc,
                        cancellationToken);
                }
                catch (Exception exception)
                    when (exception is not
                    OperationCanceledException)
                {
                    logger.LogError(
                        exception,
                        "Could not select WhatsApp events for quick reply " +
                        "in locality {LocalitySlug}.",
                        reportRequest.LocalitySlug);

                    await whatsAppClient.SendTextAsync(
                        message.PhoneNumberId,
                        message.UserId,
                        "Não foi possível carregar os eventos neste momento. " +
                        "Tenta novamente mais tarde.",
                        cancellationToken);

                    return;
                }

                if (!selection.HasEvents)
                {
                    await whatsAppClient.SendTextAsync(
                        message.PhoneNumberId,
                        message.UserId,
                        $"Não existem eventos publicados em {localityName} " + "para este período.",
                        cancellationToken);

                    return;
                }

                var eventDetailParts = eventMessageFormatter.FormatEventDetailParts(selection);

                foreach (var eventDetailPart in
                eventDetailParts)
                {
                    await whatsAppClient.SendTextAsync(
                        message.PhoneNumberId,
                        message.UserId,
                        eventDetailPart,
                        cancellationToken);
                }

                return;
            }

            if (helpCommand.TryResolveHelp(message.Text))
            {
                await whatsAppClient.SendHelpTemplateAsync(
                    message.PhoneNumberId,
                    message.UserId,
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

                // The command has now changed persistent state. Releasing the
                // message ID after a later delivery failure would allow Meta's
                // retry to process the command again and return AlreadyActive
                // after the user had just received Created or Reactivated.
                releaseMessageOnFailure = false;

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

                try
                {
                    await whatsAppClient.SendHelpTemplateAsync(
                        message.PhoneNumberId,
                        message.UserId,
                        cancellationToken);
                }
                catch (Exception exception)
                    when (exception is not OperationCanceledException)
                {
                    logger.LogError(
                        exception,
                        "Could not send the WhatsApp help template after " +
                        "subscribing {UserId} to {LocalitySlug}.",
                        message.UserId,
                        followCommand.LocalitySlug);
                }

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
                    var municipality = municipalityCatalog.GetRequired(selection.LocalitySlug);

                    var templateParameters =
                        new WhatsAppEventsTemplateParameters(
                            localityName,
                            selection.LocalitySlug,
                            selection.TotalEventCount,
                            reportWindow.WindowStartLocal,
                            reportWindow.WindowEndLocal,
                            municipality.LogoPath);

                    await
                    whatsAppClient.SendWeeklyEventsTemplateAsync(
                        message.PhoneNumberId,
                        message.UserId,
                        templateParameters,
                        cancellationToken);
                }
                catch (Exception exception)
                    when (exception is not
                    OperationCanceledException)
                {
                    logger.LogError(
                        exception,
                        "Could not send immediate WhatsApp template " +
                        "for locality {LocalitySlug}.",
                        followCommand.LocalitySlug);

                    var eventLabel =
                        selection.TotalEventCount == 1
                            ? "evento"
                            : "eventos";

                    await whatsAppClient.SendTextAsync(
                        message.PhoneNumberId,
                        message.UserId,
                        $"📅 Encontrámos {selection.TotalEventCount} " +
                        $"{eventLabel} em {localityName}.",
                        cancellationToken);

                    var eventDetailParts = eventMessageFormatter.FormatEventDetailParts(selection);

                    foreach (var eventDetailPart in eventDetailParts)
                    {
                        await whatsAppClient.SendTextAsync(
                            message.PhoneNumberId,
                            message.UserId,
                            eventDetailPart,
                            cancellationToken);
                    }
                }

                return;
            }

            if (commandResolver.TryResolveStop(message.Text, out var stopCommand) && stopCommand is not null)
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
                " ❌ Comando inválido. Usa: Subscrever <localidade> ou Stop <localidade>.",
                cancellationToken);
        }
        catch
        {
            if (releaseMessageOnFailure)
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
                        "Could not release WhatsApp message {MessageId} " +
                        "for retry.",
                        message.MessageId);
                }
            }

            throw;
        }
    }
}
