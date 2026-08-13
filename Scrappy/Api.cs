using Scrappy.Extensions;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddScrappyServices(builder.Configuration);

var app = builder.Build();

app.UseScrappyPipeline();

app.Run();
