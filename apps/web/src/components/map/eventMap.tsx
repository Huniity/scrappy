'use client';

import { divIcon, geoJSON } from 'leaflet';
import { useEffect } from 'react';
import {
    GeoJSON,
    MapContainer,
    Marker,
    Popup,
    TileLayer,
    useMap,
} from 'react-leaflet';
import type {
    FeatureCollection,
    MultiPolygon,
    Polygon,
} from 'geojson';

import type { EventRecord } from '../../features/events/events.types';
import { useMunicipality } from '../backoffice/BackofficeShell';
import { getEventTypeIconMarkup } from './eventTypeIcons';
import localMunicipalities from './municipalityBoundaries.json';

const portugalCenter: [number, number] = [39.5, -8];

type MunicipalityProperties = {
    dtmn?: string;
    municipio: string;
};

type MunicipalityResponse = FeatureCollection<
    Polygon | MultiPolygon,
    MunicipalityProperties
>;

const localMunicipalitiesData =
    localMunicipalities as unknown as MunicipalityResponse;

type EventMapProps = {
    events: EventRecord[];
    onToggleEventSelection: (eventId: string) => void;
    onOpenEventDetails: (eventId: string) => void;
};

type LocatedEvent = EventRecord & {
    event: EventRecord['event'] & {
        location: EventRecord['event']['location'] & {
            latitude: number;
            longitude: number;
        };
    };
};

function hasCoordinates(record: EventRecord): record is
    LocatedEvent {
    const { latitude, longitude } =
        record.event.location;

    return (
        typeof latitude === 'number' &&
        Number.isFinite(latitude) &&
        typeof longitude === 'number' &&
        Number.isFinite(longitude)
    );
}

const districtColors: Record<string, string> = {
    Faro: '#1f63e9',
    Leiria: '#8755b5',
};

function getEventPinIcon(district: string, eventType: string) {
    const color = districtColors[district] ?? '#2d8a5f';

    return divIcon({
        className: 'event-map-pin-wrapper',
        html: `
              <span
                  class="event-map-pin"
                  style="--event-pin-color: ${color}"
              >
                  <span class="event-map-pin-icon">
                      ${getEventTypeIconMarkup(eventType)}
                  </span>
              </span>
          `,
        iconSize: [34, 42],
        iconAnchor: [17, 42],
        popupAnchor: [0, -42],
    });
}


const selectedMunicipalityStyle = {
    color: '#003ebb',
    fillColor: '#003ebb',
    fillOpacity: 0.10,
    opacity: 1,
    weight: 1,
};

function normalizeMunicipality(value: string) {
    return value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim()
        .toLocaleLowerCase('pt-PT');
}

function belongsToMunicipality(record: EventRecord, municipality: string) {
    const locality = record.event.location.locality;

    if (!locality) {
        return false;
    }

    const normalizedLocality = normalizeMunicipality(locality);
    const normalizedMunicipality = normalizeMunicipality(municipality);

    return (
        normalizedLocality === normalizedMunicipality ||
        normalizedLocality.startsWith(`${normalizedMunicipality} (`)
    );
}

function getLocalMunicipalityBoundary(
    municipality: string,
): MunicipalityResponse | null {
    const normalizedMunicipality = normalizeMunicipality(municipality);
    const feature = localMunicipalitiesData.features.find(({ properties }) =>
        normalizeMunicipality(properties.municipio) === normalizedMunicipality,
    );

    return feature
        ? {
              type: 'FeatureCollection',
              features: [feature],
          }
        : null;
}

function FitMapToMunicipality({
    boundary,
}: {
    boundary: MunicipalityResponse | null;
}) {
    const map = useMap();

    useEffect(() => {
        if (!boundary) {
            map.setView(portugalCenter, 7);
            return;
        }

        const bounds = geoJSON(boundary).getBounds();

        if (bounds.isValid()) {
            map.fitBounds(bounds, {
                maxZoom: 12,
                padding: [32, 32],
            });
        }
    }, [boundary, map]);

    return null;
}

function MunicipalityMap({
    municipality,
    events,
    onToggleEventSelection,
    onOpenEventDetails,
}: {
    municipality: string;
    events: EventRecord[];
    onToggleEventSelection: (eventId: string) => void;
    onOpenEventDetails: (eventId: string) => void;
}) {
    const boundary = getLocalMunicipalityBoundary(municipality);
    const locatedEvents = events
        .filter(hasCoordinates)
        .filter((record) => belongsToMunicipality(record, municipality));

    return (
        <div className="z-0 relative h-full min-h-[400px] w-full overflow-hidden rounded-md bg-[var(--map-background)]">
            <MapContainer
                center={portugalCenter}
                zoom={7}
                scrollWheelZoom
                className="h-full min-h-[400px] w-full"
            >
                <TileLayer
                    minZoom={0}
                    maxZoom={20}
                    url="https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />

                <FitMapToMunicipality boundary={boundary} />

                {boundary && (
                    <GeoJSON
                        key={boundary.features[0]?.properties.dtmn ?? municipality}
                        data={boundary}
                        style={selectedMunicipalityStyle}
                    />
                )}
                {locatedEvents.map(({ id, district, event }) => (
                    <Marker
                        key={id}
                        position={[
                            event.location.latitude,
                            event.location.longitude,
                        ]}
                        icon={getEventPinIcon(district, event.type)}
                        eventHandlers={{
                            click: () => onOpenEventDetails(event.id),
                        }}
                    >
                        <Popup>
                            <div className="flex min-w-[220px] flex-col
              gap-2">
                                <strong className="text-sm">
                                    {event.title}
                                </strong>

                                <span className="text-xs">
                                    Distrito: {district}
                                </span>

                                <span className="text-xs">
                                    {event.location.name}
                                    {event.location.locality
                                        ? ` · ${event.location.locality}
                          `
                                        : ''}
                                </span>

                                <span className="text-xs">
                                    {new
                                        Date(event.startDate).toLocaleString
                                        (
                                            'pt-PT',
                                            {
                                                day: '2-digit',
                                                month: 'short',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                                timeZone: 'Europe/Lisbon',
                                            },
                                        )}
                                </span>

                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            onOpenEventDetails(event.id)}
                                        className="flex-1 rounded border border-[var(--primary)] bg-[var(--primary)] px-2 py-1 text-xs font-semibold text-white"
                                    >
                                        Ver detalhes
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            onToggleEventSelection(event.id)}
                                        className="flex-1 rounded border border-[var(--primary)] bg-[var(--surface)] px-2 py-1 text-xs font-semibold text-[var(--primary)]"
                                    >
                                        Selecionar
                                    </button>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>

            {!boundary && (
                <div className="pointer-events-none absolute left-3 top-3 z-[400] rounded-md bg-[var(--surface)]/95 px-3 py-2 text-xs text-[var(--text-secondary)] shadow-sm">
                    Limite de {municipality} não encontrado.
                </div>
            )}
        </div>
    );
}

const EventMap = ({
    events,
    onToggleEventSelection,
    onOpenEventDetails,
}: EventMapProps) => {
    const selectedMunicipality = useMunicipality();

    return (
        <MunicipalityMap
            municipality={selectedMunicipality}
            events={events}
            onToggleEventSelection={onToggleEventSelection}
            onOpenEventDetails={onOpenEventDetails}
        />
    );
};

export default EventMap;
