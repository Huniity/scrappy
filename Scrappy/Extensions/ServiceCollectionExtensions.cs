

using Microsoft.AspNetCore.OpenApi;
using Microsoft.AspNetCore.Routing;
using Microsoft.OpenApi;
using MongoDB.Driver;
using Scrappy.Services;
using Scrappy.Services.Interfaces;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;

namespace Scrappy.Extensions;

/// <summary>
/// Provides extension methods for IServiceCollection to configure Scrappy services.
/// </summary>
public static class ServiceCollectionExtensions
{
    /// <summary>
    /// The name of the CORS policy used for the Scrappy API.
    /// </summary>
    public const string CorsPolicyName = "ScrappyCors";

    /// <summary>
    /// Adds and configures the necessary services for the Scrappy API, including CORS, MongoDB, controllers, OpenAPI, routing, and application services.
    /// </summary>
    /// <param name="services"></param>
    /// <param name="configuration"></param>
    /// <returns></returns>
    public static IServiceCollection AddScrappyServices(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services
            .AddScrappyCors()
            .AddScrappyMongoDb(configuration)
            .AddScrappyControllers()
            .AddScrappyOpenApi()
            .AddScrappyRouting()
            .AddApplicationServices();

        return services;
    }

    /// <summary>
    /// Adds and configures CORS policies for the Scrappy API, allowing specific origins and enabling any header and method.
    /// </summary>
    /// <param name="services"></param>
    /// <returns></returns>
    private static IServiceCollection AddScrappyCors(this IServiceCollection services)
    {
        services.AddCors(options =>
        {
            options.AddPolicy(CorsPolicyName, policy =>
            {
                policy
                    .WithOrigins(
                        "http://localhost:5275",
                        "http://127.0.0.1:5275",
                        "https://localhost:7120",
                        "https://127.0.0.1:7120",
                        "http://localhost:3000")
                    .AllowAnyHeader()
                    .AllowAnyMethod();
            });
        });

        return services;
    }

    /// <summary>
    /// Adds and configures MongoDB services for the Scrappy API, including the MongoClient and IMongoDatabase, based on the connection string provided in the configuration. Throws an exception if the connection string is not configured or does not include a database name.
    /// </summary>
    /// <param name="services"></param>
    /// <param name="configuration"></param>
    /// <returns></returns>
    /// <exception cref="InvalidOperationException"></exception> 
    private static IServiceCollection AddScrappyMongoDb(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("MongoDb")
            ?? throw new InvalidOperationException(
                "Connection string 'MongoDb' is not configured.");

        var mongoUrl = MongoUrl.Create(connectionString);
        var databaseName = mongoUrl.DatabaseName;

        if (string.IsNullOrWhiteSpace(databaseName))
        {
            throw new InvalidOperationException(
                "The MongoDb connection string must include a database name.");
        }

        services.AddSingleton<IMongoClient>(_ => new MongoClient(connectionString));
        services.AddScoped<IMongoDatabase>(provider =>
            provider.GetRequiredService<IMongoClient>().GetDatabase(databaseName));

        return services;
    }

    /// <summary>
    /// Adds and configures controllers for the Scrappy API, including JSON serialization options to handle enum values as strings. Also adds the endpoints API explorer for OpenAPI documentation.
    /// </summary>
    /// <param name="services"></param>
    /// <returns></returns>
    private static IServiceCollection AddScrappyControllers(
        this IServiceCollection services)
    {
        services
            .AddControllers()
            .AddJsonOptions(options =>
            {
                options.JsonSerializerOptions.Converters.Add(
                    new JsonStringEnumConverter());
            });

        services.AddEndpointsApiExplorer();

        return services;
    }

    /// <summary>
    /// Adds and configures OpenAPI services for the Scrappy API, including schema transformation to represent enum types as strings in the generated OpenAPI documentation.
    /// </summary>
    /// <param name="services"></param>
    /// <returns></returns>
    private static IServiceCollection AddScrappyOpenApi(
        this IServiceCollection services)
    {
        services.AddOpenApi(options =>
        {
            options.AddSchemaTransformer((schema, context, _) =>
            {
                var schemaType = Nullable.GetUnderlyingType(context.JsonTypeInfo.Type)
                    ?? context.JsonTypeInfo.Type;

                if (schemaType.IsEnum)
                {
                    schema.Type = JsonSchemaType.String;
                    schema.Format = null;
                    schema.Enum = Enum.GetNames(schemaType)
                        .Select(name => (JsonNode)JsonValue.Create(name)!)
                        .ToList();
                }

                return Task.CompletedTask;
            });
        });

        return services;
    }

    /// <summary>
    /// Adds and configures routing options for the Scrappy API, ensuring that URLs and query strings are treated in a case-insensitive manner by converting them to lowercase.
    /// </summary>
    /// <param name="services"></param>
    /// <returns></returns>
    private static IServiceCollection AddScrappyRouting(
        this IServiceCollection services)
    {
        services.Configure<RouteOptions>(options =>
        {
            options.LowercaseUrls = true;
            options.LowercaseQueryStrings = true;
        });

        return services;
    }

    /// <summary>
    /// Adds and configures application-specific services for the Scrappy API, including services related to event management, filtering, sorting, and querying.
    /// </summary>
    /// <param name="services"></param>
    /// <returns></returns>
    private static IServiceCollection AddApplicationServices(
        this IServiceCollection services)
    {
        services.AddScoped<EventService>();
        services.AddScoped<EventFilterService>();
        services.AddScoped<EventSortingService>();
        services.AddScoped<EventQueryService>();
        services.AddSingleton<IGeoDataService, GeoDataService>();

        return services;
    }
}
