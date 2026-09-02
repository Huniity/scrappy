'use client';
import styles from './events.module.css';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

import { EventCounter } from '@/components/statCards/countEvent';
import { HasCoordsCounter } from '@/components/statCards/hasCoords';
import { FreeEventCounter } from '@/components/statCards/freeEvent';
import { PublishedEventCounter } from '@/components/statCards/addedEvent';
import eventsMock from './events.mock.json';

type SortOption =
    | 'date-asc'
    | 'date-desc'
    | 'price-asc'
    | 'price-desc'
    | 'title-asc'
    | 'title-desc';

const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'date-asc', label: 'Data ↑' },
    { value: 'date-desc', label: 'Data ↓' },
    { value: 'price-asc', label: 'Valor ↑' },
    { value: 'price-desc', label: 'Valor ↓' },
    { value: 'title-asc', label: 'Z - A' },
    { value: 'title-desc', label: 'A - Z' },
];

async function fetchEvents() {
    return eventsMock;
}

export function EventsWorkspace() {
    const [view, setView] = useState<'map' | 'list'>('map');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [priceFilter, setPriceFilter] = useState<'all' | 'free' | 'paid'>('all');
    const [publishedFilter, setPublishedFilter] = useState<'all' | 'published' | 'unpublished'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [events, setEvents] = useState(eventsMock);
    const [sortOption, setSortOption] = useState<SortOption>(
        'date-asc',
    );
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);
    const [isSortOpen, setIsSortOpen] = useState(false);
    const filtersRef = useRef<HTMLDivElement>(null);
    const sortRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchEvents()
            .then((data) => setEvents(data))
            .catch((error) => console.error('Error loading events:', error));

    }, []);

    useEffect(() => {
        if (!isFiltersOpen) {
            return;
        }

        function closeOnOutsideClick(event: PointerEvent) {
            if (
                filtersRef.current &&
                !filtersRef.current.contains(event.target as Node)
            ) {
                setIsFiltersOpen(false);
            }
        }

        function closeOnEscape(event: KeyboardEvent) {
            if (event.key === 'Escape') {
                setIsFiltersOpen(false);
            }
        }

        document.addEventListener('pointerdown', closeOnOutsideClick);
        document.addEventListener('keydown', closeOnEscape);

        return () => {
            document.removeEventListener('pointerdown', closeOnOutsideClick);
            document.removeEventListener('keydown', closeOnEscape);
        };
    }, [isFiltersOpen]);

    useEffect(() => {
        if (!isSortOpen) {
            return;
        }

        function closeOnOutsideClick(event: PointerEvent) {
            if (
                sortRef.current &&
                !sortRef.current.contains(event.target as Node)
            ) {
                setIsSortOpen(false);
            }
        }

        function closeOnEscape(event: KeyboardEvent) {
            if (event.key === 'Escape') {
                setIsSortOpen(false);
            }
        }

        document.addEventListener('pointerdown', closeOnOutsideClick);
        document.addEventListener('keydown', closeOnEscape);

        return () => {
            document.removeEventListener('pointerdown', closeOnOutsideClick);
            document.removeEventListener('keydown', closeOnEscape);
        };
    }, [isSortOpen]);

    return (
        <section
            className={`${styles.workspace} min-w-[936px] px-8 py-6 mr-32 flex flex-col gap-6 max-[1200px]:mr-8 max-[1200px]:gap-5 max-[1200px]:px-5 max-[1200px]:py-5`}
        >

            <div className="w-full grid grid-cols-3 gap-4 justify-center max-[1200px]:gap-3">
                <div>
                    <h1 className="text-3xl font-semibold max-[1200px]:text-2xl">Eventos do Município</h1>
                </div>

                <div className="items-center flex flex-col gap-2 justify-center">
                    <div className="flex border border-[var(--border-strong)] rounded-md ">
                        <button
                            type="button"
                            aria-pressed={view === 'map'}
                            onClick={() => setView('map')}
                            className={
                                `rounded-md px-8 py-2 max-[1200px]:px-6 ${view === 'map'
                                    ? 'bg-[var(--text-primary)] !text-[var(--text-inverse)]'
                                    : '!text-[var(--text-primary)]'
                                }`
                            }
                        >
                            Mapa
                        </button>

                        <button
                            type="button"
                            aria-pressed={view === 'list'}
                            onClick={() => setView('list')}
                            className={
                                `rounded-md px-8 py-2 max-[1200px]:px-6 ${view === 'list'
                                    ? 'bg-[var(--text-primary)] !text-[var(--text-inverse)]'
                                    : '!text-[var(--text-primary)]'
                                }`
                            }
                        >
                            Lista
                        </button>
                    </div>
                </div>

                <div className="flex justify-end">
                </div>
            </div>

            <div className="w-full grid grid-cols-4 gap-4 justify-center max-[1200px]:gap-3">
                <div>
                    <div className="w-full h-[100px] bg-[var(--bg-secondary)] rounded-md border border-[var(--border-strong)] grid grid-cols-[2fr_5fr] max-[1200px]:h-[92px]">
                        <div className="relative flex h-full w-full items-center justify-center">
                            <div
                                aria-hidden="true"
                                className="absolute h-20 w-20 rounded-full bg-[var(--surface-muted)] max-[1200px]:h-16 max-[1200px]:w-16 min-[1201px]:max-[1400px]:h-16 min-[1201px]:max-[1400px]:w-16"
                            />
                            <Image
                                src="/calendar.svg"
                                alt="Evento"
                                width = "40"
                                height = "40"
                                className="relative z-10 w-10 h-auto min-[1201px]:max-[1400px]:w-9"
                            />
                        </div>
                        <div className="flex flex-col justify-center gap-1 px-2">
                            <p className="text-md font-bold text-[var(--text-secondary)]">Eventos encontrados</p>
                            <EventCounter />
                            <p className="text-sm font-bold text-[var(--text-tertiary)]">neste periodo</p>
                        </div>
                    </div>
                </div>
                <div>
                    <div className="w-full h-[100px] bg-[var(--bg-secondary)] rounded-md border border-[var(--border-strong)] grid grid-cols-[2fr_5fr] max-[1200px]:h-[92px]">
                        <div className="relative flex h-full w-full items-center justify-center">
                            <div
                                aria-hidden="true"
                                className="absolute h-20 w-20 rounded-full bg-[var(--surface-muted)] max-[1200px]:h-16 max-[1200px]:w-16 min-[1201px]:max-[1400px]:h-16 min-[1201px]:max-[1400px]:w-16"
                            />
                            <Image
                                src="/location.svg"
                                alt="Evento"
                                width = "44"
                                height = "44"
                                className="relative z-10 w-11 h-auto min-[1201px]:max-[1400px]:w-10"
                            />
                        </div>
                        <div className="flex flex-col justify-center gap-1 px-2">
                            <p className="text-md font-bold text-[var(--text-secondary)]">Eventos com coordenadas</p>
                            <HasCoordsCounter />
                        </div>
                    </div>
                </div>
                <div>
                    <div className="w-full h-[100px] bg-[var(--bg-secondary)] rounded-md border border-[var(--border-strong)] grid grid-cols-[2fr_5fr] max-[1200px]:h-[92px]">
                        <div className="relative flex h-full w-full items-center justify-center">
                            <div
                                aria-hidden="true"
                                className="absolute h-20 w-20 rounded-full bg-[var(--surface-muted)] max-[1200px]:h-16 max-[1200px]:w-16 min-[1201px]:max-[1400px]:h-16 min-[1201px]:max-[1400px]:w-16"
                            />
                            <Image
                                src="/calendar-success.svg"
                                alt="Evento"
                                width = "40"
                                height = "40"
                                className="relative z-10 w-10 h-auto min-[1201px]:max-[1400px]:w-9"
                            />
                        </div>
                        <div className="flex flex-col justify-center gap-1 px-2">
                            <p className="text-md font-bold text-[var(--text-secondary)]">Eventos adicionados</p>
                            <PublishedEventCounter />
                        </div>
                    </div>
                </div>
                <div>
                    <div className="w-full h-[100px] bg-[var(--bg-secondary)] rounded-md border border-[var(--border-strong)] grid grid-cols-[2fr_5fr] max-[1200px]:h-[92px]">
                        <div className="relative flex h-full w-full items-center justify-center">
                            <div
                                aria-hidden="true"
                                className="absolute h-20 w-20 rounded-full bg-[var(--surface-muted)] max-[1200px]:h-16 max-[1200px]:w-16 min-[1201px]:max-[1400px]:h-16 min-[1201px]:max-[1400px]:w-16"
                            />
                            <Image
                                src="/ticket.svg"
                                alt="Evento"
                                width = "40"
                                height = "40"
                                className="relative z-10 w-10 h-auto min-[1201px]:max-[1400px]:w-9"
                            />
                        </div>
                        <div className="flex flex-col justify-center gap-1 px-2">
                            <p className="text-md font-bold text-[var(--text-secondary)]">Eventos gratuitos</p>
                            <FreeEventCounter />
                        </div>
                    </div>
                </div>
            </div>

            <div className="w-full min-h-[80px] bg-[var(--bg-secondary)] rounded-md border border-[var(--border-strong)] flex flex-col gap-4 px-4 py-6 max-[1200px]:gap-3 max-[1200px]:px-3 max-[1200px]:py-4">
                <div className="grid grid-cols-[4fr_2fr_3fr_1fr] gap-6 items-end max-[1200px]:gap-3">
                    <div className="flex flex-col gap-1 ">
                        <span className="text-sm font-bold text-[var(--text-secondary)]">Estado</span>
                        <div className="flex w-full rounded-md border border-[var(--border-strong)]">
                            <button
                                type="button"
                                aria-pressed={publishedFilter === 'all'}
                                onClick={() => setPublishedFilter('all')}
                                className={`flex-1 rounded-md px-3 py-2 text-sm ${publishedFilter === 'all'
                                    ? 'bg-[var(--text-primary)] !text-[var(--text-inverse)]'
                                    : '!text-[var(--text-primary)]'
                                    }`}
                            >
                                Todos
                            </button>

                            <button
                                type="button"
                                aria-pressed={publishedFilter === 'published'}
                                onClick={() => setPublishedFilter('published')}
                                className={`flex-1 rounded-md px-3 py-2 text-sm ${publishedFilter === 'published'
                                    ? 'bg-[var(--text-primary)] !text-[var(--text-inverse)]'
                                    : '!text-[var(--text-primary)]'
                                    }`}
                            >
                                Publicados
                            </button>

                            <button
                                type="button"
                                aria-pressed={publishedFilter === 'unpublished'}
                                onClick={() => setPublishedFilter('unpublished')}
                                className={`flex-1 rounded-md px-3 py-2 text-sm ${publishedFilter === 'unpublished'
                                    ? 'bg-[var(--text-primary)] !text-[var(--text-inverse)]'
                                    : '!text-[var(--text-primary)]'
                                    }`}
                            >
                                A publicar
                            </button>
                        </div>
                    </div>
                    <div ref={sortRef} className="relative flex flex-col gap-1">
                        <span className="text-sm font-bold text-[var(--text-secondary)]">
                            Ordenar por
                        </span>
                        <button
                            id="sort-events"
                            type="button"
                            aria-haspopup="listbox"
                            aria-expanded={isSortOpen}
                            aria-controls="sort-options"
                            onClick={() => {
                                setIsFiltersOpen(false);
                                setIsSortOpen((open) => !open);
                            }}
                            className="flex w-full items-center justify-between gap-3 rounded-md border border-[var(--border-strong)] bg-[var(--surface)] px-3 py-2 text-sm font-semibold text-[var(--text-primary)] shadow-sm outline-none transition-colors hover:bg-[var(--surface-muted)] focus:border-[var(--primary)]"
                        >
                            <span>
                                {sortOptions.find((option) => option.value === sortOption)?.label}
                            </span>
                            <span
                                aria-hidden="true"
                                className={`h-2 w-2 rotate-45 border-b border-r transition-transform ${isSortOpen
                                    ? '-translate-y-0.5 rotate-[225deg]'
                                    : '-translate-y-0.5'
                                    }`}
                            />
                        </button>

                        {isSortOpen && (
                            <div
                                id="sort-options"
                                role="listbox"
                                aria-label="Ordenação dos eventos"
                                className="absolute left-0 top-[calc(100%+8px)] z-50 w-[220px] rounded-md border border-[var(--border-strong)] bg-[var(--surface)] p-1 shadow-lg"
                            >
                                {sortOptions.map((option) => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        role="option"
                                        aria-selected={sortOption === option.value}
                                        onClick={() => {
                                            setSortOption(option.value);
                                            setIsSortOpen(false);
                                        }}
                                        className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${sortOption === option.value
                                            ? 'bg-[var(--surface-muted)] font-semibold text-[var(--text-primary)]'
                                            : 'text-[var(--text-primary)] hover:bg-[var(--surface-muted)]'
                                            }`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="w-full max-w-xl">
                        <label
                            htmlFor="search-query"
                            className="text-sm font-bold text-[var(--text-secondary)]"
                        >
                            Pesquisar
                        </label>
                        <input
                            id="search-query"
                            type="text"
                            value={searchQuery}
                            onChange={(event) => setSearchQuery(event.target.value)}
                            className="w-full rounded-md border border-[var(--border-strong)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--primary)]"
                        />
                    </div>

                    <div ref={filtersRef} className="relative items-end flex flex-col gap-1 justify-center">
                        <button
                            type="button"
                            aria-haspopup="dialog"
                            aria-expanded={isFiltersOpen}
                            aria-controls="event-filters"
                            onClick={() => {
                                setIsSortOpen(false);
                                setIsFiltersOpen((open) => !open);
                            }}
                            className="flex w-auto items-center justify-center gap-3 rounded-md border border-[var(--border-strong)] bg-[var(--surface)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)] transition-colors hover:bg-[var(--surface-muted)]"
                        >
                            <span>Filtros</span>
                            <span
                                aria-hidden="true"
                                className={`h-2 w-2 rotate-45 border-b border-r transition-transform ${isFiltersOpen ? '-translate-y-0.5 rotate-[225deg]' : '-translate-y-0.5'
                                    }`}
                            />
                        </button>

                        {isFiltersOpen && (
                            <div
                                id="event-filters"
                                role="dialog"
                                aria-label="Filtros de eventos"
                                className="absolute right-0 top-[calc(100%+8px)] z-50 w-[420px] rounded-md border border-[var(--border-strong)] bg-[var(--surface)] p-4 shadow-lg"
                            >
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-1">
                                        <label
                                            htmlFor="start-date"
                                            className="text-sm font-bold text-[var(--text-secondary)]"
                                        >
                                            Data Inicial
                                        </label>
                                        <input
                                            id="start-date"
                                            type="date"
                                            value={startDate}
                                            onChange={(event) => setStartDate(event.target.value)}
                                            className="w-full rounded-md border border-[var(--border-strong)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--primary)]"
                                        />
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        <label
                                            htmlFor="end-date"
                                            className="text-sm font-bold text-[var(--text-secondary)]"
                                        >
                                            Data Final
                                        </label>
                                        <input
                                            id="end-date"
                                            type="date"
                                            value={endDate}
                                            onChange={(event) => setEndDate(event.target.value)}
                                            className="w-full rounded-md border border-[var(--border-strong)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--primary)]"
                                        />
                                    </div>

                                    <div className="col-span-2 flex flex-col gap-1">
                                        <span className="text-sm font-bold text-[var(--text-secondary)]">Preço</span>
                                        <div className="flex w-full rounded-md border border-[var(--border-strong)]">
                                            <button
                                                type="button"
                                                aria-pressed={priceFilter === 'all'}
                                                onClick={() => setPriceFilter('all')}
                                                className={`flex-1 rounded-md px-3 py-2 text-sm ${priceFilter === 'all'
                                                    ? 'bg-[var(--text-primary)] !text-[var(--text-inverse)]'
                                                    : '!text-[var(--text-primary)]'
                                                    }`}
                                            >
                                                Todos
                                            </button>

                                            <button
                                                type="button"
                                                aria-pressed={priceFilter === 'free'}
                                                onClick={() => setPriceFilter('free')}
                                                className={`flex-1 rounded-md px-3 py-2 text-sm ${priceFilter === 'free'
                                                    ? 'bg-[var(--text-primary)] !text-[var(--text-inverse)]'
                                                    : '!text-[var(--text-primary)]'
                                                    }`}
                                            >
                                                Gratuitos
                                            </button>

                                            <button
                                                type="button"
                                                aria-pressed={priceFilter === 'paid'}
                                                onClick={() => setPriceFilter('paid')}
                                                className={`flex-1 rounded-md px-3 py-2 text-sm ${priceFilter === 'paid'
                                                    ? 'bg-[var(--text-primary)] !text-[var(--text-inverse)]'
                                                    : '!text-[var(--text-primary)]'
                                                    }`}
                                            >
                                                Pagos
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="w-full mt-6 flex justify-end">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setStartDate('');
                                                setEndDate('');
                                                setPriceFilter('all');
                                                setPublishedFilter('all');
                                                setSearchQuery('');
                                                setSortOption('date-asc');
                                            }}
                                            className="cursor-pointer max-w-lg rounded-md border border-[var(--border-strong)] bg-[var(--surface)] px-3 py-2 text-sm font-semibold text-[var(--text-primary)] transition-colors hover:bg-[var(--surface-muted)]"
                                        >
                                            Limpar filtros
                                        </button>
                                    </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="w-full grid grid-cols-[2fr_1fr] gap-4 justify-center max-[1200px]:gap-3">
                <div className="w-full h-[400px] bg-[var(--bg-secondary)] rounded-md border border-[var(--border-strong)]">
                    {view === 'map' ? (
                        <div className="">

                        </div>
                    ) : (
                        <div className="h-full overflow-y-auto rounded-md bg-[var(--surface)]">
                            {events.map(({ id, event }, index) => {
                                const eventDate = new Date(event.startDate);
                                const eventDateLabel = eventDate.toLocaleDateString('pt-PT', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric',
                                });
                                const eventWeekday = eventDate.toLocaleDateString('pt-PT', {
                                    weekday: 'short',
                                });
                                const eventTime = eventDate.toLocaleTimeString('pt-PT', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                });
                                const offer = event.offers[0];
                                const source = event.sourceUrl.includes('bol.pt')
                                    ? 'BOL'
                                    : 'Viral Agenda';

                                return (
                                    <div
                                        key={id}
                        className={`flex min-h-[128px] items-center gap-3 border-b border-[var(--border-strong)] px-3 py-3 transition-colors hover:bg-[var(--surface-muted)] max-[1200px]:min-h-[112px] max-[1200px]:gap-2 max-[1200px]:px-2 max-[1200px]:py-2 ${index === 0
                                            ? 'border-l-2 border-l-[var(--primary)]'
                                            : ''
                                            }`}
                                    >
                                        <div className="flex w-7 shrink-0 justify-center">
            
                                                <span className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-[var(--primary)]">
                                                    <span className="h-2.5 w-2.5 rounded-full bg-[var(--primary)]" />
                                                </span>
      
                                        </div>

                                        <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-md bg-[var(--surface-muted)] max-[1200px]:h-16 max-[1200px]:w-28">
                                            {event.imageUrl ? (
                                                <img
                                                    src={event.imageUrl}
                                                    alt=""
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : null}
                                        </div>

                                        <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
                                            <h3 className="truncate text-sm font-bold text-[var(--text-primary)]">
                                                {event.title}
                                            </h3>
                                            <p className="flex items-center gap-1 text-xs text-[var(--text-secondary)]">
                                                <Image
                                                    src="/calendar.svg"
                                                    alt=""
                                                    width={13}
                                                    height={13}
                                                />
                                                <span>
                                                    {eventDateLabel} · {eventWeekday} {eventTime}
                                                </span>
                                            </p>
                                            <p className="flex min-w-0 items-start gap-1 text-xs text-[var(--text-secondary)]">
                                                <Image
                                                    src="/location.svg"
                                                    alt=""
                                                    width={13}
                                                    height={13}
                                                />
                                                <span className="truncate">
                                                    {event.location.name}
                                                    <span className="block text-[var(--text-tertiary)]">
                                                        {event.location.locality}
                                                    </span>
                                                </span>
                                            </p>
                                        </div>

                                        <div className="flex w-24 shrink-0 flex-col items-start gap-1.5">
                                            <span
                                                className={`rounded-md border px-2 py-1 text-[11px] font-semibold ${event.isAccessibleForFree === true
                                                    ? 'border-green-200 bg-green-50 text-green-700'
                                                    : offer
                                                        ? 'border-orange-200 bg-orange-50 text-orange-700'
                                                        : 'border-[var(--border-strong)] bg-[var(--surface-muted)] text-[var(--text-secondary)]'
                                                    }`}
                                            >
                                                {event.isAccessibleForFree === true
                                                    ? 'Gratuito'
                                                    : offer
                                                        ? 'Pago'
                                                        : 'Sem preço'}
                                            </span>
                                            {offer && (
                                                <span className="text-xs font-semibold text-[var(--text-secondary)]">
                                                    {offer.price.toFixed(2).replace('.', ',')} €
                                                </span>
                                            )}
                                            <span className="rounded-md border border-violet-200 bg-violet-50 px-2 py-1 text-[11px] font-semibold text-violet-700">
                                                {event.type}
                                            </span>
                                        </div>

                                        <div className="flex w-28 shrink-0 justify-center">
                                            <span className="rounded-md border border-[var(--border-strong)] bg-[var(--surface)] px-2 py-2 text-center text-[11px] text-[var(--text-secondary)]">
                                                {source}
                                            </span>
                                        </div>

                                        <button
                                            type="button"
                                            className="flex shrink-0 items-center gap-2 rounded-md border border-[var(--primary)] px-3 py-2 text-xs font-semibold text-[var(--primary)] transition-colors hover:bg-[var(--primary)] hover:text-white"
                                        >
                                            <span>Ver detalhes</span>
                                            <span aria-hidden="true" className="text-base leading-none">›</span>
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
                <div className="w-full h-[400px] bg-[var(--bg-secondary)] rounded-md border border-[var(--border-strong)]">

                </div>
            </div>
        </section>
    );
}
