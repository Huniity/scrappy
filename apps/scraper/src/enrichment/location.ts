import {
    type NormalizedEvent,
} from '../types/events';

import {
    findExactMunicipality,
    findMunicipalityByCoordinates,
} from '../geo/municipalities';

export type ResolvedLocation = {
    locality: string;
    latitude?: string;
    longitude?: string;
};

export function resolveLocation(
    event: NormalizedEvent
): ResolvedLocation | null {
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
        municipalityFromLocality &&
        municipalityFromCoordinates
    ) {
        if (
            municipalityFromLocality ===
            municipalityFromCoordinates
        ) {
            return {
                locality:
                    municipalityFromLocality,
                latitude:
                    event.latitude,
                longitude:
                    event.longitude,
            };
        }

        return {
            locality:
                municipalityFromLocality,
        };
    }

    if (
        municipalityFromLocality
    ) {
        return {
            locality:
                municipalityFromLocality,
        };
    }

    if (
        municipalityFromCoordinates
    ) {
        return {
            locality:
                municipalityFromCoordinates,
            latitude:
                event.latitude,
            longitude:
                event.longitude,
        };
    }

    return null;
}