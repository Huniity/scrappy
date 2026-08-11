// using Scalar.AspNetCore;
using Scrappy.Services;
using MongoDB.Driver;

var CORS = "_myAllowSpecificOrigins";
var builder = WebApplication.CreateBuilder(args);

var mongoConnectionString = builder.Configuration.GetConnectionString("MongoDb");

builder.Services.AddCors(options =>
{
    options.AddPolicy(name: CORS,
                      policy =>
                      {
                          policy.WithOrigins(
                            "http://localhost:5275/scalar/v1", 
                            "https://localhost:5275/scalar/v1", 
                            "127.0.0.1:5275/scalar/v1")
                                // .AllowAnyHeader()
                                // .AllowAnyMethod()
                                ;
                      });
});

builder.Services.AddSingleton<IMongoClient>(new MongoClient(mongoConnectionString));
builder.Services.AddScoped<IMongoDatabase>(sp => 
{
    var client = sp.GetRequiredService<IMongoClient>();
    return client.GetDatabase("ScrappyDb");
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddOpenApi();
builder.Services.Configure<RouteOptions>(
    options => 
    {
        options.LowercaseUrls = true;
        options.LowercaseQueryStrings = true;
    }
);

builder.Services.AddScoped<EventService>();
builder.Services.AddScoped<EventFilterService>();
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
