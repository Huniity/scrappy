'use client';

import { divIcon, geoJSON } from 'leaflet';
import { useEffect, useState } from 'react';
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

const portugalCenter: [number, number] = [39.5, -8];
const municipalityApiUrl =
    'https://ogcapi.dgterritorio.gov.pt/collections/municipios/items';

type MunicipalityProperties = {
    dtmn: string;
    municipio: string;
};

type MunicipalityResponse = FeatureCollection<
    Polygon | MultiPolygon,
    MunicipalityProperties
>;

type EventMapProps = {
    events: EventRecord[];
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

function getEventPinIcon(district: string) {
    const color = districtColors[district] ?? '#2d8a5f';

    return divIcon({
        className: 'event-map-pin-wrapper',
        html: `
              <span
                  class="event-map-pin"
                  style="--event-pin-color: ${color}"
              ></span>
          `,
        iconSize: [24, 32],
        iconAnchor: [12, 32],
        popupAnchor: [0, -32],
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

async function fetchMunicipalityBoundary(
    municipality: string,
    signal: AbortSignal,
): Promise<MunicipalityResponse | null> {
    const params = new URLSearchParams({
        f: 'json',
        limit: '1',
        municipio: municipality,
    });
    const response = await fetch(`${municipalityApiUrl}?${params}`, { signal });

    if (!response.ok) {
        throw new Error(`CAOP request failed with status ${response.status}`);
    }

    const data = (await response.json()) as MunicipalityResponse;

    const feature = data.features.find(
        ({ properties }) => properties.municipio === municipality,
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

function formatBoundaryError(error: unknown) {
    if (error instanceof DOMException && error.name === 'AbortError') {
        return null;
    }

    return 'Não foi possível carregar o limite do município.';
}

function MunicipalityMap({
    municipality,
    events,
    onOpenEventDetails,
}: {
    municipality: string;
    events: EventRecord[];
    onOpenEventDetails: (eventId: string) => void;
}) {
    const [boundary, setBoundary] = useState<MunicipalityResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<unknown>(null);
    const locatedEvents = events
        .filter(hasCoordinates)
        .filter((record) => belongsToMunicipality(record, municipality));

    useEffect(() => {
        const controller = new AbortController();

        fetchMunicipalityBoundary(municipality, controller.signal)
            .then((feature) => {
                if (!controller.signal.aborted) {
                    setBoundary(feature);
                    setError(null);
                }
            })
            .catch((requestError: unknown) => {
                if (!controller.signal.aborted) {
                    setError(requestError);
                }
            })
            .finally(() => {
                if (!controller.signal.aborted) {
                    setIsLoading(false);
                }
            });

        return () => controller.abort();
    }, [municipality]);

    const boundaryError = formatBoundaryError(error);

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
                        icon={getEventPinIcon(district)}
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

                                <button
                                    type="button"
                                    onClick={() =>
                                        onOpenEventDetails(event.id)}
                                    className="rounded bg-[var(--primary)] px-2 py-1 text-xs font-semibold text-white"
                                >
                                    Ver detalhes
                                </button>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>

            {(isLoading || !boundary) && (
                <div className="pointer-events-none absolute left-3 top-3 z-[400] rounded-md bg-[var(--surface)]/95 px-3 py-2 text-xs text-[var(--text-secondary)] shadow-sm">
                    {isLoading
                        ? `A carregar ${municipality}...`
                        : boundaryError ?? `Limite de ${municipality} não encontrado.`}
                </div>
            )}
        </div>
    );
}

const EventMap = ({
      events,
      onOpenEventDetails,
  }: EventMapProps) => {
      const selectedMunicipality = useMunicipality();

      return (
          <MunicipalityMap
              key={selectedMunicipality}
              municipality={selectedMunicipality}
              events={events}
              onOpenEventDetails={onOpenEventDetails}
          />
      );
  };

export default EventMap;
