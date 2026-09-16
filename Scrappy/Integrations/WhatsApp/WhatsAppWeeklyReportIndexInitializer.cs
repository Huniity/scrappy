

using MongoDB.Driver;
using Scrappy.Models.Entities;

namespace Scrappy.Integrations.WhatsApp;

/// <summary>
/// Creates the unique MongoDB index used by weekly WhatsApp reports.
/// </summary>
public sealed class WhatsAppWeeklyReportIndexInitializer(
    IServiceScopeFactory scopeFactory) :
    IHostedService
{
    public async Task StartAsync(
        CancellationToken cancellationToken)
    {
        using var scope =
        scopeFactory.CreateScope();

        var database =

            scope.ServiceProvider.GetRequiredService
            <IMongoDatabase>();

        var reports =

            database.GetCollection<WhatsAppWeeklyReport>(

                WhatsAppWeeklyReport.CollectionName);

        var keys = Builders<WhatsAppWeeklyReport>
            .IndexKeys
            .Ascending(report =>
            report.WhatsAppUserId)
            .Ascending(report =>
            report.LocalitySlug)
            .Ascending(report =>
            report.WeekStartUtc);

        var index = new CreateIndexModel<WhatsAppWeeklyReport>(
            keys,
            new CreateIndexOptions
            {
                Name =
                "ux_whatsapp_user_locality_week",
                Unique = true
            });

        await reports.Indexes.CreateOneAsync(
            index,
            cancellationToken: cancellationToken);
    }

    public Task StopAsync(
        CancellationToken cancellationToken)
    {
        return Task.CompletedTask;
    }
}