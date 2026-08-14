FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY ["Scrappy/Scrappy.csproj", "Scrappy/"]
RUN dotnet restore "Scrappy/Scrappy.csproj"

COPY . .
WORKDIR /src/Scrappy
RUN dotnet publish "Scrappy.csproj" \
    --configuration Release \
    --output /app/publish \
    --no-restore \
    /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

ENV ASPNETCORE_URLS=http://+:5000
EXPOSE 5000

COPY --from=build /app/publish .
USER app

ENTRYPOINT ["dotnet", "Scrappy.dll"]
