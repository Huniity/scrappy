using System.Net;
using System.Text.Json;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;
using Scrappy.Integrations.WhatsApp;

namespace Scrappy.Tests;

public sealed class WhatsAppClientTests
{
    [Fact]
    public async Task SendWeeklyEventsTemplateAsync_UsesApprovedTemplateParameterOrder()
    {
        var handler = new RecordingHttpMessageHandler();
        var httpClient = new HttpClient(handler)
        {
            BaseAddress = new Uri("https://graph.facebook.com/")
        };

        var options = Options.Create(new WhatsAppOptions
        {
            AccessToken = "test-token",
            GraphApiVersion = "v23.0",
            TemplateLanguageCode = "pt_PT",
            WeeklyEventsTemplateName = "scrappy_weekly_events",
            PublicBaseUrl = "https://www.scrappy.pt"
        });

        var client = new WhatsAppClient(
            httpClient,
            options,
            NullLogger<WhatsAppClient>.Instance);

        await client.SendWeeklyEventsTemplateAsync(
            "phone-number-id",
            "351900000000",
            new WhatsAppEventsTemplateParameters(
                "Faro",
                "faro",
                3,
                new DateOnly(2026, 9, 17),
                new DateOnly(2026, 9, 20),
                "/municipality-logo/faro.png"));

        using var payload = JsonDocument.Parse(
            Assert.IsType<string>(handler.RequestBody));

        var components = payload.RootElement
            .GetProperty("template")
            .GetProperty("components");

        var bodyParameters = components[1].GetProperty("parameters");

        Assert.Equal("Faro", bodyParameters[0].GetProperty("text").GetString());
        Assert.Equal("3", bodyParameters[1].GetProperty("text").GetString());

        var buttonParameter = components[2]
            .GetProperty("parameters")[0]
            .GetProperty("text")
            .GetString();

        Assert.Equal("faro", buttonParameter);
    }

    private sealed class RecordingHttpMessageHandler : HttpMessageHandler
    {
        public string? RequestBody { get; private set; }

        protected override async Task<HttpResponseMessage> SendAsync(
            HttpRequestMessage request,
            CancellationToken cancellationToken)
        {
            RequestBody = request.Content is null
                ? null
                : await request.Content.ReadAsStringAsync(cancellationToken);

            return new HttpResponseMessage(HttpStatusCode.OK);
        }
    }
}
