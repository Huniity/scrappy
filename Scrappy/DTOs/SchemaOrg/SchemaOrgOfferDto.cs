

using Scrappy.Models;
using Scrappy.Models.Entities;
using System.Text.Json.Serialization;

namespace Scrappy.DTOs.SchemaOrg;


/// <summary>
/// Represents a product in the Schema.org format. This class is used to define various properties of a product, such as name, description, and other relevant information.
/// 
/// Example:
/// {
///   "@type": "Offer",
///   "name": "Bilhete Admissão Geral",
///   "price": "75.00",
///   "priceCurrency": "EUR",
///   "availability": "https://schema.org/InStock",
///   "url": "https://example.com/product/123",
///   "validFrom": "2024-06-01T09:00:00Z",
/// }
/// </summary>


public class SchemaOrgOfferDto
{
    /// <summary> Gets or sets the type of the product, which is always "Offer" for this DTO. </summary>
    [JsonPropertyName("@type")]
    public string Type { get; set; } = "Offer";

    /// <summary> Gets or sets the name of the product. </summary>
    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    /// <summary> Gets or sets the price of the product. </summary>
    [JsonPropertyName("price")]
    public string Price { get; set; }

    /// <summary> Gets or sets the currency of the price, which is always "EUR" for this DTO. </summary>
    [JsonPropertyName("priceCurrency")]
    public string PriceCurrency { get; set; } = "EUR";

    /// <summary> Gets or sets the availability of the product, which is always "https://schema.org/InStock" for this DTO. </summary>
    [JsonPropertyName("availability")]
    public string Availability { get; set; } = "https://schema.org/InStock";

    /// <summary> Gets or sets the URL of the product. </summary>
    [JsonPropertyName("url")]
    public string Url { get; set; } = string.Empty;

    /// <summary> Gets or sets the date and time from which the product is valid. </summary>
    [JsonPropertyName("validFrom")]
    public string ValidFrom { get; set; }
}