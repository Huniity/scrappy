'use client';

import { useEffect, useState } from 'react';

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
                        events={events}
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
