using Scrappy.Extensions;

var builder = WebApplication.CreateBuilder(args);

builder.Configuration.AddJsonFile(
      "Configuration/municipalities.json",
      optional: false,
      reloadOnChange: true);
      
builder.Services.AddScrappyServices(builder.Configuration);

var app = builder.Build();

app.UseScrappyPipeline();

app.Run();
