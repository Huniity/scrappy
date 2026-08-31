

export type ViralAgendaMapResponse = {
    events_pages?: Array<{
        latitude?: unknown;
        longitude?: unknown;
    }>;
}

export type MapCoordinates = {
    latitude: string;
    longitude: string;
};


export type JsonObject = Record<string, unknown>;