'use client';
import styles from './events.module.css';
import { useEffect, useRef, useState } from 'react';

import { EventCounter } from '@/components/statCards/countEvent';
import { HasCoordsCounter } from '@/components/statCards/hasCoords';
import { FreeEventCounter } from '@/components/statCards/freeEvent';
import { PublishedEventCounter } from '@/components/statCards/addedEvent';

export function EventsWorkspace() {
    const [view, setView] = useState<'map' | 'list'>('map');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [priceFilter, setPriceFilter] = useState<'all' | 'free' | 'paid'>('all');
    const [publishedFilter, setPublishedFilter] = useState<'all' | 'published' | 'unpublished'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);
    const filtersRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await fetch('/events.mock.json');
                const data = await response.json();
                console.log(data);
            } catch (error) {
                console.error('Error fetching events:', error);
            }
        };

        fetchEvents();

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

    return (
        <section
            className={`${styles.workspace} px-8 py-6 mr-32 flex flex-col gap-6`}
        >

            <div className="w-full flex flex-col gap-2 lg:grid lg:grid-cols-3 lg:gap-4 justify-center">
                <div>
                    <h1 className="text-3xl font-semibold">Eventos do Município</h1>
                </div>

                <div className="items-center flex flex-col gap-2 justify-center">
                    <div className="flex border border-[var(--border-strong)] rounded-md ">
                        <button
                            type="button"
                            aria-pressed={view === 'map'}
                            onClick={() => setView('map')}
                            className={
                                `rounded-md px-8 py-2 ${view === 'map'
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
                                `rounded-md px-8 py-2 ${view === 'list'
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

            <div className="w-full flex flex-col gap-2 lg:grid lg:grid-cols-4 lg:gap-4 justify-center">
                <div>
                    <div className="w-full h-[100px] bg-[var(--bg-secondary)] rounded-md border border-[var(--border-strong)] grid grid-cols-[2fr_5fr]">
                        <div className="relative flex h-full w-full items-center justify-center">
                            <div
                                aria-hidden="true"
                                className="absolute h-20 w-20 rounded-full bg-[var(--surface-muted)]"
                            />
                            <Image
                                src="/calendar.svg"
                                alt="Evento"
                                width = "40"
                                height = "40"
                                className="relative z-10 w-10 h-auto"
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
                    <div className="w-full h-[100px] bg-[var(--bg-secondary)] rounded-md border border-[var(--border-strong)] grid grid-cols-[2fr_5fr]">
                        <div className="relative flex h-full w-full items-center justify-center">
                            <div
                                aria-hidden="true"
                                className="absolute h-20 w-20 rounded-full bg-[var(--surface-muted)]"
                            />
                            <Image
                                src="/location.svg"
                                alt="Evento"
                                width = "44"
                                height = "44"
                                className="relative z-10 w-11 h-auto"
                            />
                        </div>
                        <div className="flex flex-col justify-center gap-1 px-2">
                            <p className="text-md font-bold text-[var(--text-secondary)]">Eventos com coordenadas</p>
                            <HasCoordsCounter />
                        </div>
                    </div>
                </div>
                <div>
                    <div className="w-full h-[100px] bg-[var(--bg-secondary)] rounded-md border border-[var(--border-strong)] grid grid-cols-[2fr_5fr]">
                        <div className="relative flex h-full w-full items-center justify-center">
                            <div
                                aria-hidden="true"
                                className="absolute h-20 w-20 rounded-full bg-[var(--surface-muted)]"
                            />
                            <Image
                                src="/calendar-success.svg"
                                alt="Evento"
                                width = "40"
                                height = "40"
                                className="relative z-10 w-10 h-auto"
                            />
                        </div>
                        <div className="flex flex-col justify-center gap-1 px-2">
                            <p className="text-md font-bold text-[var(--text-secondary)]">Eventos adicionados</p>
                            <PublishedEventCounter />
                        </div>
                    </div>
                </div>
                <div>
                    <div className="w-full h-[100px] bg-[var(--bg-secondary)] rounded-md border border-[var(--border-strong)] grid grid-cols-[2fr_5fr]">
                        <div className="relative flex h-full w-full items-center justify-center">
                            <div
                                aria-hidden="true"
                                className="absolute h-20 w-20 rounded-full bg-[var(--surface-muted)]"
                            />
                            <Image
                                src="/ticket.svg"
                                alt="Evento"
                                width = "40"
                                height = "40"
                                className="relative z-10 w-10 h-auto"
                            />
                        </div>
                        <div className="flex flex-col justify-center gap-1 px-2">
                            <p className="text-md font-bold text-[var(--text-secondary)]">Eventos gratuitos</p>
                            <FreeEventCounter />
                        </div>
                    </div>
                </div>
            </div>

            <div className="w-full min-h-[80px] bg-[var(--bg-secondary)] rounded-md border border-[var(--border-strong)] flex flex-col gap-4 px-4 py-6">
                <div className="grid grid-cols-4 gap-4 items-end">
                    <div className="flex flex-col gap-1 ">
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
                    <div className="w-full lg:max-w-xl">
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

                    <div ref={filtersRef} className="relative">
                        <button
                            type="button"
                            aria-haspopup="dialog"
                            aria-expanded={isFiltersOpen}
                            aria-controls="event-filters"
                            onClick={() => setIsFiltersOpen((open) => !open)}
                            className="flex w-full items-center justify-center gap-3 rounded-md border border-[var(--border-strong)] bg-[var(--surface)] px-4 py-3 text-sm font-semibold text-[var(--text-primary)] transition-colors hover:bg-[var(--surface-muted)] lg:w-auto"
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
                                className="absolute right-0 top-[calc(100%+8px)] z-50 w-[min(90vw,420px)] rounded-md border border-[var(--border-strong)] bg-[var(--surface)] p-4 shadow-lg"
                            >
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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

                                    <div className="flex flex-col gap-1 sm:col-span-2">
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
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="w-full flex flex-col gap-2 lg:grid lg:grid-cols-[2fr_1fr] lg:gap-4 justify-center">
                <div className="w-full h-[400px] bg-[var(--bg-secondary)] rounded-md border border-[var(--border-strong)]">
                    {view === 'map' ? (
                        <div className="">

                        </div>
                    ) : (
                        <div className="">
                            <div>

                            </div>
                            <div>

                            </div>
                            <div>

                            </div>

                        </div>
                    )}
                </div>
                <div className="w-full h-[400px] bg-[var(--bg-secondary)] rounded-md border border-[var(--border-strong)]">

                </div>
            </div>






        </section>
    );
}
