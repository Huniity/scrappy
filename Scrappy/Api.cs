
// using Scalar.AspNetCore;
using Scrappy.Services;
using MongoDB.Driver;
using System.Text.Json.Serialization;
using System.Text.Json.Nodes;
using Microsoft.AspNetCore.OpenApi;
using Microsoft.OpenApi;

var CORS = "_myAllowSpecificOrigins";
var builder = WebApplication.CreateBuilder(args);

var mongoConnectionString = builder.Configuration.GetConnectionString("MongoDb");

builder.Services.AddCors(options =>
{
    options.AddPolicy(name: CORS,
                      policy =>
                      {
                          policy.WithOrigins(
                            "http://localhost:5275",
                            "http://127.0.0.1:5275",
                            "https://localhost:7120",
                            "https://127.0.0.1:7120")
                                .AllowAnyHeader()
                                .AllowAnyMethod();
                      });
});

builder.Services.AddSingleton<IMongoClient>(new MongoClient(mongoConnectionString));
builder.Services.AddScoped<IMongoDatabase>(sp =>
{
    var client = sp.GetRequiredService<IMongoClient>();
    return client.GetDatabase("ScrappyDb");
});

builder.Services.AddControllers()
    .AddJsonOptions(
            options =>
            {
                options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
            }
    );

builder.Services.AddEndpointsApiExplorer();

// Configure OpenAPI to output enums as strings in the generated spec
builder.Services.AddOpenApi(options =>
{
    options.AddSchemaTransformer((schema, context, cancellationToken) =>
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

builder.Services.Configure<RouteOptions>(
    options =>
    {
        options.LowercaseUrls = true;
        options.LowercaseQueryStrings = true;
    }
);

builder.Services.AddScoped<EventService>();
builder.Services.AddScoped<EventFilterService>();
builder.Services.AddScoped<EventSortingService>();
builder.Services.AddScoped<EventQueryService>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    // app.MapScalarApiReference();
    
    app.UseSwaggerUI(option =>
    {
        option.SwaggerEndpoint("/openapi/v1.json", "Scrappy API V1");
    });
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.UseCors(CORS);
app.MapControllers();

app.Run();
