import { type NormalizedEvent, type ValidViralAgendaEvent} from "../types/events";



export function normalizeViralAgendaEvent(
    data: ValidViralAgendaEvent
): NormalizedEvent {
    return {
        title: data.name,
        sourceUrl: data.url,
        startDate: data.startDate,
        endDate: data.endDate,
        description: data.description,
        imageUrl: data.image,
        type: data['@type'],

        venueName: data.location?.name,

        locality:
            data.location?.address?.addressLocality,

        streetAddress:
            data.location?.address?.streetAddress,

        country:
            data.location?.address?.addressCountry,
    };
}