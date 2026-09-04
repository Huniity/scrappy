'use client';

import { useEffect, useMemo, useState } from 'react';

import styles from './events.module.css';
import eventsMock from './events.mock.json';
import { EventsActionsPanel } from './EventsActionsPanel';
import { EventsFilters } from './EventsFilters';
import { EventsList } from './EventsList';
import { EventsStats } from './EventsStats';
import type {
    ActivePanel,
    EventRecord,
    EventView,
    PriceFilter,
    PublishedFilter,
    SortOption,
} from './events.types';

async function fetchEvents(): Promise<EventRecord[]> {
    return eventsMock;
}

function normalizeSearchValue(value: string) {
    return value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLocaleLowerCase('pt-PT');
}

function getEventDateKey(value: string) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return null;
    }

    const parts = new Intl.DateTimeFormat('en', {
        day: '2-digit',
        month: '2-digit',
        timeZone: 'Europe/Lisbon',
        year: 'numeric',
    }).formatToParts(date);
    const year = parts.find((part) => part.type === 'year')?.value;
    const month = parts.find((part) => part.type === 'month')?.value;
    const day = parts.find((part) => part.type === 'day')?.value;

    return year && month && day ? `${year}-${month}-${day}` : null;
}

function isFreeEvent(event: EventRecord['event']) {
    if (event.isAccessibleForFree !== null && event.isAccessibleForFree !== undefined) {
        return event.isAccessibleForFree;
    }

    return event.offers.length === 0 || event.offers.every(({ price }) => price <= 0);
}

function getEventPrice(event: EventRecord['event']) {
    return event.offers.length > 0
        ? Math.min(...event.offers.map(({ price }) => price))
        : 0;
}

function compareEvents(
    first: EventRecord,
    second: EventRecord,
    sortOption: SortOption,
) {
    if (sortOption === 'title-asc' || sortOption === 'title-desc') {
        const result = first.event.title.localeCompare(
            second.event.title,
            'pt-PT',
        );

        return sortOption === 'title-asc' ? result : -result;
    }

    if (sortOption === 'price-asc' || sortOption === 'price-desc') {
        const result = getEventPrice(first.event) - getEventPrice(second.event);

        return sortOption === 'price-asc' ? result : -result;
    }

    const firstDate = new Date(first.event.startDate).getTime();
    const secondDate = new Date(second.event.startDate).getTime();
    const result = firstDate - secondDate;

    return sortOption === 'date-asc' ? result : -result;
}

export function EventsWorkspace() {
    const [view, setView] = useState<EventView>('map');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [priceFilter, setPriceFilter] = useState<PriceFilter>('all');
    const [publishedFilter, setPublishedFilter] = useState<PublishedFilter>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [events, setEvents] = useState<EventRecord[]>(eventsMock);
    const [selectedEventIds, setSelectedEventIds] = useState<string[]>([]);
    const [detailsEventId, setDetailsEventId] = useState<string | null>(null);
    const [activePanel, setActivePanel] = useState<ActivePanel>('details');
    const [isActionsPanelOpen, setIsActionsPanelOpen] = useState(false);
    const [sortOption, setSortOption] = useState<SortOption>('date-asc');

    function toggleEventSelection(eventId: string) {
        const isSelected = selectedEventIds.includes(eventId);

        setSelectedEventIds((currentIds) =>
            isSelected
                ? currentIds.filter((id) => id !== eventId)
                : [...currentIds, eventId],
        );

        if (!isSelected) {
            setDetailsEventId(eventId);
            setActivePanel('actions');
            setIsActionsPanelOpen(true);
        } else if (selectedEventIds.length === 1) {
            setIsActionsPanelOpen(false);
        }
    }

    function openEventDetails(eventId: string) {
        setDetailsEventId(eventId);
        setActivePanel('details');
        setIsActionsPanelOpen(true);
    }

    function resetFilters() {
        setStartDate('');
        setEndDate('');
        setPriceFilter('all');
        setPublishedFilter('all');
        setSearchQuery('');
        setSortOption('date-asc');
    }

    useEffect(() => {
        fetchEvents()
            .then((data) => setEvents(data))
            .catch((error) => console.error('Error loading events:', error));
    }, []);

    const selectedEvents = events.filter(({ event }) =>
        selectedEventIds.includes(event.id),
    );

    const visibleEvents = useMemo(() => {
        const normalizedQuery = normalizeSearchValue(searchQuery.trim());

        return events
            .filter(({ district, event }) => {
                const eventDate = getEventDateKey(event.startDate);

                if (startDate && (!eventDate || eventDate < startDate)) {
                    return false;
                }

                if (endDate && (!eventDate || eventDate > endDate)) {
                    return false;
                }

                if (
                    priceFilter === 'free' &&
                    !isFreeEvent(event)
                ) {
                    return false;
                }

                if (
                    priceFilter === 'paid' &&
                    isFreeEvent(event)
                ) {
                    return false;
                }

                if (
                    publishedFilter === 'published' &&
                    event.isPublished !== true
                ) {
                    return false;
                }

                if (
                    publishedFilter === 'unpublished' &&
                    event.isPublished === true
                ) {
                    return false;
                }

                if (normalizedQuery) {
                    const searchableValues = [
                        event.title,
                        event.type,
                        district,
                        event.location.name,
                        event.location.locality ?? '',
                    ];
                    const matchesQuery = searchableValues.some((value) =>
                        normalizeSearchValue(value).includes(normalizedQuery),
                    );

                    if (!matchesQuery) {
                        return false;
                    }
                }

                return true;
            })
            .sort((first, second) => compareEvents(first, second, sortOption));
    }, [
        endDate,
        events,
        priceFilter,
        publishedFilter,
        searchQuery,
        sortOption,
        startDate,
    ]);


    return (
        <section
            className={`${styles.workspace} flex min-w-[936px] flex-col gap-6 px-8 py-6 mr-32 max-[1200px]:mr-8 max-[1200px]:gap-5 max-[1200px]:px-5 max-[1200px]:py-5`}
        >
            <div className="grid w-full grid-cols-3 justify-center gap-4 max-[1200px]:gap-3">
                <div>
                    <h1 className="text-3xl font-semibold max-[1200px]:text-2xl">
                        Eventos do Município
                    </h1>
                </div>

                <div className="flex flex-col items-center justify-center gap-2">
                    <div className="flex rounded-md border border-[var(--border-strong)]">
                        <button
                            type="button"
                            aria-pressed={view === 'map'}
                            onClick={() => setView('map')}
                            className={`rounded-md px-8 py-2 max-[1200px]:px-6 ${view === 'map'
                                ? 'bg-[var(--text-primary)] !text-[var(--text-inverse)]'
                                : '!text-[var(--text-primary)]'
                                }`}
                        >
                            Mapa
                        </button>

                        <button
                            type="button"
                            aria-pressed={view === 'list'}
                            onClick={() => setView('list')}
                            className={`rounded-md px-8 py-2 max-[1200px]:px-6 ${view === 'list'
                                ? 'bg-[var(--text-primary)] !text-[var(--text-inverse)]'
                                : '!text-[var(--text-primary)]'
                                }`}
                        >
                            Lista
                        </button>
                    </div>
                </div>

                <div className="flex justify-end" />
            </div>

            <EventsStats />

            <EventsFilters
                startDate={startDate}
                endDate={endDate}
                priceFilter={priceFilter}
                publishedFilter={publishedFilter}
                searchQuery={searchQuery}
                sortOption={sortOption}
                onStartDateChange={setStartDate}
                onEndDateChange={setEndDate}
                onPriceFilterChange={setPriceFilter}
                onPublishedFilterChange={setPublishedFilter}
                onSearchQueryChange={setSearchQuery}
                onSortOptionChange={setSortOption}
                onReset={resetFilters}
            />

            <div
                className={`${styles.eventsLayout} grid w-full min-w-0 justify-center transition-[grid-template-columns,gap] duration-300 ease-in-out ${isActionsPanelOpen
                    ? 'grid-cols-[2fr_1fr] gap-4 max-[1200px]:gap-3'
                    : 'grid-cols-[1fr_0fr] gap-0'
                    }`}
            >
                <div className="min-w-0">
                    <EventsList
                        view={view}
                        events={visibleEvents}
                        selectedEventIds={selectedEventIds}
                        onToggleEventSelection={toggleEventSelection}
                        onOpenEventDetails={openEventDetails}
                        isActionsPanelOpen={isActionsPanelOpen}
                    />
                </div>
                <div
                    aria-hidden={!isActionsPanelOpen}
                    className={`min-w-0 overflow-hidden transition-opacity duration-200 ${isActionsPanelOpen
                        ? 'pointer-events-auto opacity-100'
                        : 'pointer-events-none opacity-0'
                        }`}
                >
                    <EventsActionsPanel
                        activePanel={activePanel}
                        selectedEvents={selectedEvents}
                        detailsEventId={detailsEventId}
                        onPanelChange={setActivePanel}
                        onRemoveEvent={toggleEventSelection}
                        onClose={() => setIsActionsPanelOpen(false)}
                    />
                </div>
            </div>
        </section>
    );
}
