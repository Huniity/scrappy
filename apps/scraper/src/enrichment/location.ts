import { type NormalizedEvent } from '../types/events';

import {
    findExactMunicipality,
    findMunicipalityByCoordinates,
    findMunicipalityInAddress,
} from '../geo/municipalities';

export type ResolvedLocation = {
    locality: string;
    latitude?: string;
    longitude?: string;
};

export function resolveLocation(
    event: NormalizedEvent
): ResolvedLocation | null {
    const municipalityFromAddress =
        findMunicipalityInAddress(
            event.streetAddress
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
            Number(event.latitude);

        const longitude =
            Number(event.longitude);

        if (
            Number.isFinite(latitude) &&
            Number.isFinite(longitude)
        ) {
            municipalityFromCoordinates =
                findMunicipalityByCoordinates(
                    latitude,
                    longitude
                );
        }
    }

    const textualMunicipality =
        municipalityFromAddress ??
        municipalityFromLocality;

    if (
        textualMunicipality &&
        municipalityFromCoordinates
    ) {
        if (
            textualMunicipality ===
            municipalityFromCoordinates
        ) {
            return {
                locality: textualMunicipality,
                latitude: event.latitude,
                longitude: event.longitude,
            };
        }

        return {
            locality: textualMunicipality,
        };
    }

    if (textualMunicipality) {
        return {
            locality: textualMunicipality,
        };
    }

    if (municipalityFromCoordinates) {
        return {
            locality:
                municipalityFromCoordinates,
            latitude: event.latitude,
            longitude: event.longitude,
        };
    }

    return null;
}