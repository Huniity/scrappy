

import {
    type NormalizedEvent,
} from '../types/normalizedEvent';

import {
    findExactMunicipality,
    findMunicipalityByCoordinates,
} from '../geo/municipalities';

export type ResolvedLocation = {
    municipality: string;
    latitude?: string;
    longitude?: string;
};

export function resolveLocation(
    event: NormalizedEvent
): ResolvedLocation | null {
    const municipalityFromPage =
        findExactMunicipality(
            event.municipality
        );

    const municipalityFromLocality =
        findExactMunicipality(
            event.locality
        );

    let municipalityFromCoordinates:
        string | null = null;

    if (
        event.latitude &&
        event.longitude
    ) {
        const latitude =
            Number(
                event.latitude
            );

        const longitude =
            Number(
                event.longitude
            );

        if (
            Number.isFinite(
                latitude
            ) &&
            Number.isFinite(
                longitude
            )
        ) {
            municipalityFromCoordinates =
                findMunicipalityByCoordinates(
                    latitude,
                    longitude
            );
        }
    }

    if (
        municipalityFromCoordinates
    ) {
        return {
            municipality:
                municipalityFromCoordinates,
            latitude:
                event.latitude,
            longitude:
                event.longitude,
        };
    }

    const municipalityFromText =
        municipalityFromPage ??
        municipalityFromLocality;

    if (
        municipalityFromText
    ) {
        return {
            municipality:
                municipalityFromText,
        };
    }

    return null;
}
