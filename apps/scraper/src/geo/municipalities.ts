/// <reference types="node" />

import fs from 'node:fs';
import path from 'node:path';

import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import { point } from '@turf/helpers';

import type {
    Feature,
    FeatureCollection,
    MultiPolygon,
    Polygon,
} from 'geojson';

type MunicipalityProperties = {
    municipio: string;
};

type MunicipalityFeature = Feature<
    Polygon | MultiPolygon,
    MunicipalityProperties
>;

type MunicipalityFeatureCollection =
    FeatureCollection<
        Polygon | MultiPolygon,
        MunicipalityProperties
    >;

const municipalitiesPath = path.resolve(
    __dirname,
    '../../data/geo/municipalities.geojson'
);

const municipalitiesData = JSON.parse(
    fs.readFileSync(
        municipalitiesPath,
        'utf8'
    )
) as MunicipalityFeatureCollection;

function normalizeText(
    value: string
): string {
    return value
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .toLowerCase()
        .trim();
}

export function findMunicipalityByCoordinates(
    latitude: number,
    longitude: number
): string | null {
    const eventPoint = point([
        longitude,
        latitude,
    ]);

    for (const municipality of municipalitiesData.features) {
        if (
            booleanPointInPolygon(
                eventPoint,
                municipality
            )
        ) {
            return municipality.properties.municipio;
        }
    }

    return null;
}

export function findExactMunicipality(
    value: string | undefined
): string | null {
    if (!value) {
        return null;
    }

    const normalizedValue =
        normalizeText(value);

    for (const municipality of municipalitiesData.features) {
        const municipalityName =
            municipality.properties.municipio;

        if (
            normalizeText(municipalityName) ===
            normalizedValue
        ) {
            return municipalityName;
        }
    }

    return null;
}

export function findMunicipalityInAddress(
    address: string | undefined
): string | null {
    if (!address) {
        return null;
    }

    const normalizedAddress =
        normalizeText(address);

    for (const municipality of municipalitiesData.features) {
        const municipalityName =
            municipality.properties.municipio;

        const normalizedMunicipality =
            normalizeText(
                municipalityName
            );

        const pattern = new RegExp(
            `(^|[^a-z0-9])${escapeRegExp(
                normalizedMunicipality
            )}([^a-z0-9]|$)`,
            'i'
        );

        if (pattern.test(normalizedAddress)) {
            return municipalityName;
        }
    }

    return null;
}

function escapeRegExp(
    value: string
): string {
    return value.replace(
        /[.*+?^${}()|[\]\\]/g,
        '\\$&'
    );
}