using MongoDB.Bson;
  using MongoDB.Bson.Serialization.Attributes;

namespace Scrappy.Models.Entities;

/// <summary>
/// Represents an offer associated with an event, including price and availability information.
/// </summary>
public class OfferModel
{
    /// <summary> Gets or sets the name of the offer. </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary> Gets or sets the price of the offer. </summary>
    [BsonRepresentation(BsonType.Decimal128)]
    public decimal Price { get; set; }

    /// <summary> Gets or sets the currency used for the offer price. </summary>
    public string PriceCurrency { get; set; } = "EUR";

    /// <summary> Gets or sets the availability status of the offer. </summary>
    public string Availability { get; set; } =
        "https://schema.org/InStock";

    /// <summary> Gets or sets the URL where the offer can be accessed. </summary>
    public string? Url { get; set; }

    /// <summary> Gets or sets the date and time from which the offer is valid. </summary>
    public DateTime? ValidFrom { get; set; }
}
