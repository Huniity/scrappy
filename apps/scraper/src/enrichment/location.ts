import { type NormalizedEvent } from "../types/events";

export type ResolvedLocation = {
    locality: string;
    district: string;
    region: string;
    dicoCode: string;
    latitude?: string;
    longitude?: string;
};

function hasCoordinates(
    event: NormalizedEvent
): boolean {
    return Boolean(
        event.latitude &&
        event.longitude
    );
}

export function resolveLocation(
    event: NormalizedEvent
): ResolvedLocation | null {
    if (hasCoordinates(event)) {
        console.log(
            "Evento tem coordenadas:",
            event.latitude,
            event.longitude
        );
    }

    return null;
}