using System.ComponentModel.DataAnnotations;

namespace Scrappy.DTOs.Requests;

public class EventOfferRequestDto
{
    [Required]
    public string Name { get; set; } = string.Empty;

    public string PriceCurrency { get; set; } = "EUR";

    public string Availability { get; set; } =
        "https://schema.org/InStock";

    [Url]
    public string? Url { get; set; }

    [Range(0, double.MaxValue)]
    public decimal Price { get; set; }

    public DateTime? ValidFrom { get; set; }
}