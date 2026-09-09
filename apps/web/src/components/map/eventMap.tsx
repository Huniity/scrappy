'use client';

import { divIcon, geoJSON } from 'leaflet';
import {
    Fragment,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react';
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

type EventLocationGroup = {
    latitude: number;
    longitude: number;
    events: LocatedEvent[];
};

type EventPinAnimation = {
    offsetX: number;
    offsetY: number;
    delay: number;
    closing?: boolean;
};

type MarkerZoomRequest = {
    center: [number, number];
    onComplete?: () => void;
};

const eventPinAnimationDuration = 280;
const eventPinAnimationDelayStep = 35;

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


function getEventLocationKey(latitude: number, longitude: number) {
    return `${latitude.toFixed(6)}:${longitude.toFixed(6)}`;
}

function groupEventsByLocation(records: LocatedEvent[]) {
    const groups = new Map<string, EventLocationGroup>();

    records.forEach((record) => {
        const { latitude, longitude } = record.event.location;
        const key = getEventLocationKey(latitude, longitude);
        const existingGroup = groups.get(key);

        if (existingGroup) {
            existingGroup.events.push(record);
            return;
        }

        groups.set(key, {
            latitude,
            longitude,
            events: [record],
        });
    });

    return Array.from(groups.values());
}

function getEventPinIcon(
    eventType: string,
    eventCount: number,
    animation?: EventPinAnimation,
) {
    const color = '#22448a';
    const countMarkup =
        eventCount > 1
            ? `<span class="event-map-pin-count" aria-hidden="true">${eventCount}</span>`
            : '';
    const animationClass = animation
        ? animation.closing
            ? ' event-map-pin-closing'
            : ' event-map-pin-unstacked'
        : '';
    const animationStyle = animation
        ? `; --event-pin-start-x: ${-animation.offsetX}px; --event-pin-start-y: ${-animation.offsetY}px; --event-pin-animation-delay: ${animation.delay}ms`
        : '';

    return divIcon({
        className: `event-map-pin-wrapper${animationClass}`,
        html: `
              <span
                  class="event-map-pin"
                  style="--event-pin-color: ${color}${animationStyle}"
              >
                  <span class="event-map-pin-icon">
                      ${getEventTypeIconMarkup(eventType)}
                  </span>
                  ${countMarkup}
              </span>
          `,
        // The visible pin is 34px tall and its pointed corner is the
        // bottom-left corner of the shape (`border-radius: 50% 50% 50% 0`).
        // Anchor Leaflet to that point so the GPS coordinate stays exact at
        // every zoom level.
        iconSize: [34, 34],
        iconAnchor: [0, 34],
        popupAnchor: [0, -34],
    });
}

function formatEventDate(startDate: string) {
    return new Date(startDate).toLocaleString('pt-PT', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Europe/Lisbon',
    });
}

function EventPopupDetails({
    record,
    onToggleEventSelection,
    onOpenEventDetails,
}: {
    record: LocatedEvent;
    onToggleEventSelection: (eventId: string) => void;
    onOpenEventDetails: (eventId: string) => void;
}) {
    const { district, event } = record;

    return (
        <div className="flex min-w-[220px] flex-col gap-2">
            <strong className="text-sm">{event.title}</strong>

            <span className="text-xs">Distrito: {district}</span>

            <span className="text-xs">
                {event.location.name}
                {event.location.locality
                    ? ` · ${event.location.locality}`
                    : ''}
            </span>

            <span className="text-xs">
                {formatEventDate(event.startDate)}
            </span>

            <div className="flex gap-2">
                <button
                    type="button"
                    onClick={() => onOpenEventDetails(event.id)}
                    className="flex-1 rounded border border-[var(--primary)] bg-[var(--primary)] px-2 py-1 text-xs font-semibold text-white"
                >
                    Ver detalhes
                </button>
                <button
                    type="button"
                    onClick={() => onToggleEventSelection(event.id)}
                    className="flex-1 rounded border border-[var(--primary)] bg-[var(--surface)] px-2 py-1 text-xs font-semibold text-[var(--primary)]"
                >
                    Selecionar
                </button>
            </div>
        </div>
    );
}

function getSpiderfyOffset(index: number, eventCount: number) {
    const radius = 68;

    if (eventCount === 2) {
        return {
            x: index === 0 ? -radius : radius,
            y: -radius,
        };
    }

    if (eventCount === 3) {
        const topOffset = 62;

        return [
            { x: -topOffset, y: -topOffset },
            { x: topOffset, y: -topOffset },
            { x: 0, y: topOffset },
        ][index];
    }

    const angle = -Math.PI / 2 + (2 * Math.PI * index) / eventCount;

    return {
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
    };
}

function SpiderfiedEventMarkers({
    group,
    locationKey,
    isClosing,
    onCloseComplete,
    onRequestMarkerZoom,
    onToggleEventSelection,
    onOpenEventDetails,
}: {
    group: EventLocationGroup;
    locationKey: string;
    isClosing: boolean;
    onCloseComplete: (locationKey: string) => void;
    onRequestMarkerZoom: (center: [number, number]) => void;
    onToggleEventSelection: (eventId: string) => void;
    onOpenEventDetails: (eventId: string) => void;
}) {
    const map = useMap();
    const [, setViewRevision] = useState(0);
    const centerPosition: [number, number] = [
        group.latitude,
        group.longitude,
    ];

    useEffect(() => {
        const refreshPositions = () => {
            setViewRevision((revision) => revision + 1);
        };

        map.on('zoom move resize', refreshPositions);

        return () => {
            map.off('zoom move resize', refreshPositions);
        };
    }, [map]);

    useEffect(() => {
        if (!isClosing) {
            return;
        }

        const closeTimer = window.setTimeout(
            () => onCloseComplete(locationKey),
            eventPinAnimationDuration +
                Math.max(0, group.events.length - 1) *
                    eventPinAnimationDelayStep,
        );

        return () => window.clearTimeout(closeTimer);
    }, [group.events.length, isClosing, locationKey, onCloseComplete]);

    const centerPoint = map.latLngToLayerPoint(centerPosition);
    const eventOffsets = useMemo(
        () =>
            group.events.map((_, index) =>
                getSpiderfyOffset(index, group.events.length),
            ),
        [group.events],
    );
    const eventIcons = useMemo(
        () =>
            group.events.map((record, index) => {
                const offset = eventOffsets[index];

                return getEventPinIcon(record.event.type, 1, {
                    offsetX: offset.x,
                    offsetY: offset.y,
                    delay: index * eventPinAnimationDelayStep,
                    closing: isClosing,
                });
            }),
        [eventOffsets, group.events, isClosing],
    );
    const eventPositions = group.events.map((record, index) => {
        const offset = eventOffsets[index];
        const point = isClosing
            ? centerPoint
            : centerPoint.add([offset.x, offset.y]);
        const latLng = map.layerPointToLatLng(point);

        return {
            record,
            position: [latLng.lat, latLng.lng] as [number, number],
        };
    });

    return (
        <>
            {eventPositions.map(({ record, position }, index) => (
                <Fragment key={record.id}>
                    <Marker
                        position={position}
                        icon={eventIcons[index]}
                        zIndexOffset={1000 + index}
                        eventHandlers={{
                            click: (event) => {
                                event.originalEvent.stopPropagation();
                                onRequestMarkerZoom([
                                    group.latitude,
                                    group.longitude,
                                ]);
                                onOpenEventDetails(record.event.id);
                            },
                        }}
                    >
                        <Popup>
                            <EventPopupDetails
                                record={record}
                                onToggleEventSelection={
                                    onToggleEventSelection
                                }
                                onOpenEventDetails={onOpenEventDetails}
                            />
                        </Popup>
                    </Marker>
                </Fragment>
            ))}
        </>
    );
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
        // Remove the previous municipality's drag boundary before changing
        // the view; otherwise it could constrain the next fitBounds call.
        map.setMaxBounds();

        if (!boundary) {
            map.setMinZoom(0);
            map.setView(portugalCenter, 7, { animate: false });
            return;
        }

        const bounds = geoJSON(boundary).getBounds();

        if (!bounds.isValid()) {
            map.setMinZoom(0);
            return;
        }

        // Release the previous municipality's limit before fitting the
        // next one; otherwise a smaller municipality could inherit a
        // larger minimum zoom and never fit correctly.
        map.setMinZoom(0);
        map.fitBounds(bounds, {
            maxZoom: 12,
            padding: [32, 32],
            animate: false,
        });

        // Lock panning to the exact area that was visible on first load.
        // This keeps the municipality view as the outer navigation boundary
        // even after the user zooms in.
        const initialViewBounds = map.getBounds();
        map.setMaxBounds(initialViewBounds);

        // Keep the initial municipality view as the furthest zoom-out level.
        // Re-apply it during zoom events as a guard against layer updates
        // changing Leaflet's effective zoom limits.
        const municipalityZoom = map.getZoom();
        if (municipalityZoom === undefined) {
            return;
        }

        const enforceMinimumZoom = () => {
            if (map.getMinZoom() !== municipalityZoom) {
                map.setMinZoom(municipalityZoom);
            }

            if (map.getZoom() < municipalityZoom) {
                map.setZoom(municipalityZoom, { animate: false });
            }
        };

        map.setMinZoom(municipalityZoom);
        map.on('zoomstart zoom zoomend zoomlevelschange', enforceMinimumZoom);

        return () => {
            map.off(
                'zoomstart zoom zoomend zoomlevelschange',
                enforceMinimumZoom,
            );
        };
    }, [boundary, map]);

    return null;
}

function MapUnstackController({
    onMapClick,
}: {
    onMapClick: () => void;
}) {
    const map = useMap();

    useEffect(() => {
        const handleMapClick = () => onMapClick();

        map.on('click', handleMapClick);

        return () => {
            map.off('click', handleMapClick);
        };
    }, [map, onMapClick]);

    return null;
}

function MapMarkerZoomController({
    request,
}: {
    request: MarkerZoomRequest | null;
}) {
    const map = useMap();

    useEffect(() => {
        if (!request) {
            return;
        }

        if (map.getZoom() === 18) {
            map.setView(request.center, 18, { animate: true });
            request.onComplete?.();
            return;
        }

        const handleZoomEnd = () => request.onComplete?.();

        map.once('zoomend', handleZoomEnd);
        map.setView(request.center, 18, { animate: true });

        return () => {
            map.off('zoomend', handleZoomEnd);
        };
    }, [map, request]);

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
    const boundary = useMemo(
        () => getLocalMunicipalityBoundary(municipality),
        [municipality],
    );
    const locatedEvents = useMemo(
        () =>
            events
                .filter(hasCoordinates)
                .filter((record) => belongsToMunicipality(record, municipality)),
        [events, municipality],
    );
    const eventLocationGroups = useMemo(
        () => groupEventsByLocation(locatedEvents),
        [locatedEvents],
    );
    const [expandedLocationKey, setExpandedLocationKey] = useState<
        string | null
    >(null);
    const [closingLocationKey, setClosingLocationKey] = useState<
        string | null
    >(null);
    const [markerZoomRequest, setMarkerZoomRequest] =
        useState<MarkerZoomRequest | null>(null);
    const requestMarkerZoom = useCallback(
        (center: [number, number], onComplete?: () => void) => {
            setMarkerZoomRequest({ center, onComplete });
        },
        [],
    );
    const activeExpandedLocationKey = eventLocationGroups.some(
        (group) =>
            group.events.length > 1 &&
            getEventLocationKey(group.latitude, group.longitude) ===
                expandedLocationKey,
    )
        ? expandedLocationKey
        : null;
    const activeClosingLocationKey = eventLocationGroups.some(
        (group) =>
            getEventLocationKey(group.latitude, group.longitude) ===
            closingLocationKey,
    )
        ? closingLocationKey
        : null;
    const closeExpandedLocation = useCallback(() => {
        if (!activeExpandedLocationKey) {
            return;
        }

        setClosingLocationKey(activeExpandedLocationKey);
        setExpandedLocationKey(null);
    }, [activeExpandedLocationKey]);
    const handleCloseComplete = useCallback((locationKey: string) => {
        setClosingLocationKey((currentKey) =>
            currentKey === locationKey ? null : currentKey,
        );
    }, []);

    return (
        <div className="z-0 relative h-full min-h-[400px] w-full overflow-hidden rounded-md bg-[var(--map-background)]">
            <MapContainer
                center={portugalCenter}
                zoom={7}
                scrollWheelZoom
                maxBoundsViscosity={1}
                className="h-full min-h-[400px] w-full"
            >
                <TileLayer
                    minZoom={0}
                    maxZoom={20}
                    url="https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />

                <FitMapToMunicipality boundary={boundary} />
                <MapUnstackController
                    onMapClick={closeExpandedLocation}
                />
                <MapMarkerZoomController request={markerZoomRequest} />

                {boundary && (
                    <GeoJSON
                        key={boundary.features[0]?.properties.dtmn ?? municipality}
                        data={boundary}
                        style={selectedMunicipalityStyle}
                    />
                )}
                {eventLocationGroups.map((group) => {
                    const firstEvent = group.events[0];
                    const isSingleEvent = group.events.length === 1;
                    const locationKey = getEventLocationKey(
                        group.latitude,
                        group.longitude,
                    );
                    const isExpanded =
                        !isSingleEvent &&
                        activeExpandedLocationKey === locationKey;
                    const isClosing =
                        !isExpanded &&
                        activeClosingLocationKey === locationKey;

                    return (
                        <Fragment key={locationKey}>
                            <Marker
                                position={[
                                    group.latitude,
                                    group.longitude,
                                ]}
                                icon={getEventPinIcon(
                                    firstEvent.event.type,
                                    group.events.length,
                                )}
                                eventHandlers={{
                                    click: (event) => {
                                        event.originalEvent.stopPropagation();
                                        const center: [number, number] = [
                                            group.latitude,
                                            group.longitude,
                                        ];

                                        if (isSingleEvent) {
                                            requestMarkerZoom(center);
                                            onOpenEventDetails(
                                                firstEvent.event.id,
                                            );
                                            return;
                                        }

                                        if (isExpanded) {
                                            requestMarkerZoom(center);
                                            closeExpandedLocation();
                                            return;
                                        }

                                        requestMarkerZoom(center, () => {
                                            setClosingLocationKey(
                                                activeExpandedLocationKey &&
                                                    activeExpandedLocationKey !==
                                                        locationKey
                                                    ? activeExpandedLocationKey
                                                    : null,
                                            );
                                            setExpandedLocationKey(
                                                locationKey,
                                            );
                                        });
                                    },
                                }}
                            >
                                {isSingleEvent && (
                                    <Popup>
                                        <EventPopupDetails
                                            record={firstEvent}
                                            onToggleEventSelection={
                                                onToggleEventSelection
                                            }
                                            onOpenEventDetails={
                                                onOpenEventDetails
                                            }
                                        />
                                    </Popup>
                                )}
                            </Marker>

                            {(isExpanded || isClosing) && (
                                <SpiderfiedEventMarkers
                                    group={group}
                                    locationKey={locationKey}
                                    isClosing={isClosing}
                                    onCloseComplete={handleCloseComplete}
                                    onRequestMarkerZoom={requestMarkerZoom}
                                    onToggleEventSelection={
                                        onToggleEventSelection
                                    }
                                    onOpenEventDetails={onOpenEventDetails}
                                />
                            )}
                        </Fragment>
                    );
                })}
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
