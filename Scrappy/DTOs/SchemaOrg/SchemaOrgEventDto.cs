

using System.Text.Json.Serialization;

namespace Scrappy.DTOs.SchemaOrg;

/// <summary>
/// Represents an event in the Schema.org format (https://schema.org/Event).
/// Compliant with AMA/ARTE guidelines for Portuguese Public Administration.
/// 
/// Example JSON-LD Output:
/// {
///   "@context": "https://schema.org",
///   "@type": "Event",
///   "@id": "https://api.scrappy.pt/events/123",
///   "name": "Festival de Jazz de Loulé",
///   "alternateName": "Loulé Jazz Festival",
///   "additionalType": "https://schema.org/MusicEvent",
///   "description": "Festival anual de jazz no concelho de Loulé.",
///   "url": "https://cm-loule.pt/eventos/jazz",
///   "image": "https://cm-loule.pt/media/jazz.jpg",
///   "startDate": "2026-06-01T09:00:00Z",
///   "endDate": "2026-06-01T17:00:00Z",
///   "doorTime": "2026-06-01T08:30:00Z",
///   "duration": "PT8H",
///   "category": "Musica",
///   "isAccessibleForFree": false,
///   "typicalAgeRange": "18+",
///   "maximumAttendeeCapacity": 100,
///   "keywords": ["music", "concert", "jazz"],
///   "eventStatus": "https://schema.org/EventScheduled",
///   "maintainer": {
///     "@type": "Organization",
///     "name": "Scrappy",
///     "url": "https://scrappy.pt"
///   },
///   "funder": [
///     {
///       "@type": "Organization",
///       "name": "Câmara Municipal de Loulé",
///       "url": "https://cm-loule.pt"
///     }
///   ],
///   "performer": [
///     {
///       "@type": "Person",
///       "name": "João Silva"
///     }
///   ],
///  "actor": [
///    {
///     "@type": "Person",
///     "name": "Maria Santos"
///    }
///   ],
///     "director": {
///     "@type": "Person",
///     "name": "Carlos Oliveira"
///   },
///   "composer": {
///     "@type": "Person",
///     "name": "Ana Costa"
///   },
///   "promoter": {
///     "@type": "Organization",
///     "name": "Associação Cultural de Loulé",
///     "url": "https://acl.pt"
///   },
///   "audience": {
///     "@type": "Audience",
///     "audienceType": "General"
///   },
///   "subEvent": [
///     {
///       "@type": "Event",
///       "@id": "https://api.scrappy.pt/events/123/subevent/1",
///       "name": "Concerto de Abertura",
///       "startDate": "2026-06-01T09:00:00Z",
///       "endDate": "2026-06-01T11:00:00Z",
///       "location": {
///         "@type": "Place",
///         "name": "Auditório Municipal",
///         "address": {
///           "@type": "PostalAddress",
///           "addressLocality": "Loulé",
///           "addressRegion": "Algarve",
///           "addressCountry": "PT",
///           "identifier": "0808"
///         },
///         "geo": {
///           "@type": "GeoCoordinates",
///           "latitude": 37.1378,
///           "longitude": -8.0201
///         }
///       }
///     }
///   ],
///  "superEvent": {    
///   "location": {
///     "@type": "Place",
///     "name": "Cinto de Ouro",
///     "address": {
///       "@type": "PostalAddress",
///       "addressLocality": "Loulé",
///       "addressRegion": "Algarve",
///       "addressCountry": "PT",
///       "identifier": "0808"
///     },
///     "geo": {
///       "@type": "GeoCoordinates",
///       "latitude": 37.1378,
///       "longitude": -8.0201
///     }
///   },
///   "organizer": {
///     "@type": "Organization",
///     "name": "Câmara Municipal de Loulé",
///     "url": "https://cm-loule.pt"
///   },
///   "offers": [
///     {
///       "@type": "Offer",
///       "name": "Bilhete Admissão Geral",
///       "price": "75.00",
///       "priceCurrency": "EUR",
///       "availability": "https://schema.org/InStock",
///       "url": "https://bol.pt/123",
///       "validFrom": "2026-05-01T09:00:00Z"
///     }
///   ],
///   "eventSchedule": {
///     "@type": "Schedule",
///     "startDate": "2026-06-01",
///     "endDate": "2026-06-30",
///     "startTime": "09:00:00",
///     "endTime": "17:00:00",
///     "scheduleTimezone": "Europe/Lisbon",
///     "byDay": ["https://schema.org/Monday", "https://schema.org/Wednesday", "https://schema.org/Friday"]
///   },
///   "additionalProperty": [
///     {
///       "@type": "PropertyValue",
///       "name": "qualityScore",
///       "value": 85
///     }
///   ]
/// }
/// </summary>
public class SchemaOrgEventDto
{
    /// <summary> Gets or sets the context of the event, which is always "https://schema.org" for this DTO. </summary>
    [JsonPropertyName("@context")]
    public string Context { get; set; } = "https://schema.org";

    /// <summary> Gets or sets the type of the event, which is always "Event" for this DTO. </summary>
    [JsonPropertyName("@type")]
    public string Type { get; set; } = "Event";

    /// <summary> Gets or sets the unique identifier (URL) of the event. </summary>
    [JsonPropertyName("@id")]
    public string Id { get; set; } = string.Empty;

    /// <summary> Gets or sets the name of the event. </summary>
    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    /// <summary> Gets or sets the description of the event. </summary>
    [JsonPropertyName("description")]
    public string Description { get; set; } = string.Empty;

    /// <summary> Gets or sets the alternate name of the event. </summary>
    [JsonPropertyName("alternateName")]
    public string? AlternateName { get; set; }

    /// <summary> Gets or sets the additional type of the event. </summary>
    [JsonPropertyName("additionalType")]
    public string? AdditionalType { get; set; }

    /// <summary> Gets or sets the URL of the event. </summary>
    [JsonPropertyName("url")]
    public string? Url { get; set; }

    /// <summary> Gets or sets the image URL of the event. </summary>
    [JsonPropertyName("image")]
    public string? Image { get; set; }

    /// <summary> Gets or sets the start date and time of the event in ISO 8601 format. </summary>
    [JsonPropertyName("startDate")]
    public string StartDate { get; set; } = string.Empty;

    /// <summary> Gets or sets the end date and time of the event in ISO 8601 format. </summary>
    [JsonPropertyName("endDate")]
    public string? EndDate { get; set; }

    /// <summary> Gets or sets the door time of the event in ISO 8601 format. </summary>
    [JsonPropertyName("doorTime")]
    public string? DoorTime { get; set; }

    /// <summary> Gets or sets the duration of the event in ISO 8601 format. </summary>
    [JsonPropertyName("duration")]
    public string? Duration { get; set; }

    /// <summary> Gets or sets the category of the event. </summary>
    [JsonPropertyName("category")]
    public string Category { get; set; } = string.Empty;

    /// <summary> Gets or sets a value indicating whether the event is accessible for free. </summary>
    [JsonPropertyName("isAccessibleForFree")]
    public bool? IsAccessibleForFree { get; set; }

    /// <summary> Gets or sets the offers associated with the event. </summary>
    [JsonPropertyName("offers")]
    public List<SchemaOrgOfferDto>? Offers { get; set; }

    /// <summary> Gets or sets the typical age range for the event. </summary>
    [JsonPropertyName("typicalAgeRange")]
    public string? TypicalAgeRange { get; set; }

    /// <summary> Gets or sets the maximum attendee capacity for the event. </summary>
    [JsonPropertyName("maximumAttendeeCapacity")]
    public int? MaximumAttendeeCapacity { get; set; }

    /// <summary> Gets or sets the keywords associated with the event. </summary>
    [JsonPropertyName("keywords")]
    public List<string>? Keywords { get; set; }

    /// <summary> Gets or sets the status of the event, which is always "https://schema.org/EventScheduled" for this DTO. </summary>
    [JsonPropertyName("eventStatus")]
    public string EventStatus { get; set; } = "https://schema.org/EventScheduled";

    /// <summary> Gets or sets the location of the event, which is represented by a SchemaOrgPlaceDto object. </summary>
    [JsonPropertyName("location")]
    public SchemaOrgPlaceDto? Location { get; set; }

    /// <summary> Gets or sets the owner of the event, which is represented by a <SchemaOrgAgentDto> object. </summary>
    [JsonPropertyName("owner")]
    public List<SchemaOrgAgentDto>? Owner { get; set; }

    /// <summary> Gets or sets the maintainer of the event, which is represented by a <SchemaOrgAgentDto> object. </summary>
    [JsonPropertyName("organizer")]
    public List<SchemaOrgAgentDto>? Organizer { get; set; }

    /// <summary> Gets or sets the promoter of the event, which is represented by a <SchemaOrgAgentDto> object. </summary>
    [JsonPropertyName("promoter")]
    public List<SchemaOrgAgentDto>? Promoter { get; set; }

    /// <summary> Gets or sets the maintainer of the event, which is represented by a <SchemaOrgAgentDto> object. </summary>
    [JsonPropertyName("funder")]
    public List<SchemaOrgAgentDto>? Funder { get; set; }

    /// <summary> Gets or sets the maintainer of the event, which is represented by a <SchemaOrgAgentDto> object. </summary>
    [JsonPropertyName("performer")]
    public List<SchemaOrgAgentDto>? Performer { get; set; }

    /// <summary> Gets or sets the maintainer of the event, which is represented by a <SchemaOrgAgentDto> object. </summary>
    [JsonPropertyName("actor")]
    public List<SchemaOrgAgentDto>? Actor { get; set; }

    /// <summary> Gets or sets the director of the event, which is represented by a <SchemaOrgAgentDto> object. </summary>
    [JsonPropertyName("director")]
    public List<SchemaOrgAgentDto>? Director { get; set; }

    /// <summary> Gets or sets the composer of the event, which is represented by a <SchemaOrgAgentDto> object. </summary>
    [JsonPropertyName("composer")]
    public List<SchemaOrgAgentDto>? Composer { get; set; }

    /// <summary> Gets or sets the maintainer of the event, which is represented by a <SchemaOrgAgentDto> object. </summary>
    [JsonPropertyName("audience")]
    public List<SchemaOrgAudienceDto>? Audience { get; set; }

    /// <summary> Gets or sets the attendance mode of the event, which is represented by a string value. </summary>
    [JsonPropertyName("eventSchedule")]
    public SchemaOrgScheduleDto? EventSchedule { get; set; }

    /// <summary> Gets or sets the attendance mode of the event, which is represented by a string value. </summary>
    [JsonPropertyName("subEvent")]
    public List<SchemaOrgEventDto>? SubEvent { get; set; }

    /// <summary> Gets or sets the attendance mode of the event, which is represented by a string value. </summary>
    [JsonPropertyName("superEvent")]
    public SchemaOrgEventDto? SuperEvent { get; set; }

    /// <summary> Gets or sets the attendance mode of the event, which is represented by a string value. </summary>
    [JsonPropertyName("eventAttendanceMode")]
    public string? EventAttendanceMode { get; set; }

    /// <summary> Gets or sets the attendance mode of the event, which is represented by a string value. </summary>
    [JsonPropertyName("additionalProperty")]
    public List<SchemaOrgPropertyValueDto> AdditionalProperties { get; set; } = new();
}
