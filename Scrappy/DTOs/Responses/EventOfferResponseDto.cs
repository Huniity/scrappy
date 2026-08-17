namespace Scrappy.DTOs.Responses;

  public class EventOfferResponseDto
  {
      public string Name { get; set; } = string.Empty;
      public decimal Price { get; set; }
      public string PriceCurrency { get; set; } = "EUR";
      public string Availability { get; set; } = string.Empty;
      public string? Url { get; set; }
      public DateTime? ValidFrom { get; set; }
  }