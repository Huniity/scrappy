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
    const [activePanel, setActivePanel] = useState<ActivePanel>('details');
    const [sortOption, setSortOption] = useState<SortOption>('date-asc');

    function toggleEventSelection(eventId: string) {
        const isSelected = selectedEventIds.includes(eventId);

        setSelectedEventIds((currentIds) =>
            isSelected
                ? currentIds.filter((id) => id !== eventId)
                : [...currentIds, eventId],
        );

        if (!isSelected) {
            setActivePanel('actions');
        }
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

            <div className="grid w-full grid-cols-[2fr_1fr] justify-center gap-4 max-[1200px]:gap-3">
                <EventsList
                    view={view}
                    events={events}
                    selectedEventIds={selectedEventIds}
                    onToggleEventSelection={toggleEventSelection}
                />
                <EventsActionsPanel
                    activePanel={activePanel}
                    selectedEvents={selectedEvents}
                    onPanelChange={setActivePanel}
                    onRemoveEvent={toggleEventSelection}
                />
            </div>
        </section>
    );
}
