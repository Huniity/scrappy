'use client';
import styles from './events.module.css';
import { useState } from 'react';
import Image from 'next/image';


import { EventCounter } from '@/components/statCards/countEvent';
import { HasCoordsCounter } from '@/components/statCards/hasCoords';
import { FreeEventCounter } from '@/components/statCards/freeEvent';
import { PublishedEventCounter } from '@/components/statCards/addedEvent';

export function EventsWorkspace() {
    const [view, setView] = useState<'map' | 'list'>('map');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [priceFilter, setPriceFilter] = useState<'all' | 'free' | 'paid'>('all');
    const [searchQuery, setSearchQuery] = useState('');

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
                                    ? 'bg-[var(--primary)] !text-[var(--text-inverse)]'
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
                                    ? 'bg-[var(--primary)] !text-[var(--text-inverse)]'
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
                            <p className="text-sm font-bold text-[var(--text-tertiary)]">85,3% do total</p>
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
                            <p className="text-sm font-bold text-[var(--text-tertiary)]">45,1% do total</p>
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
                            <p className="text-sm font-bold text-[var(--text-tertiary)]">65,8% do total</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="w-full min-h-[80px] bg-[var(--bg-secondary)] rounded-md border border-[var(--border-strong)] grid grid-cols-[4fr_3fr] gap-4 items-center px-4 py-6">
                <div className="w full grid grid-cols-3 gap-4">
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

                    <div className="flex flex-col gap-1">
                        <span className="text-sm font-bold text-[var(--text-secondary)]">Preço</span>
                        <div className="flex w-full border border-[var(--border-strong)] rounded-md">
                            <button
                                type="button"
                                aria-pressed={priceFilter === 'all'}
                                onClick={() => setPriceFilter('all')}
                                className={`flex-1 rounded-md px-3 py-2 text-sm ${priceFilter === 'all'
                                    ? 'bg-[var(--primary)] !text-[var(--text-inverse)]'
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
                                    ? 'bg-[var(--primary)] !text-[var(--text-inverse)]'
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
                                    ? 'bg-[var(--primary)] !text-[var(--text-inverse)]'
                                    : '!text-[var(--text-primary)]'
                                    }`}
                            >
                                Pagos
                            </button>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-[5fr_2fr] gap-4 items-end">
                    <div >
                        <label
                            htmlFor="search-query"
                            className="text-sm font-bold text-[var(--text-secondary)]"
                        >
                            Pequisar
                        </label>
                        <input
                            id="search-query"
                            type="text"
                            value={searchQuery}
                            onChange={(event) => setSearchQuery(event.target.value)}
                            className="w-full rounded-md border border-[var(--border-strong)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--primary)]"
                        />
                    </div>
                    <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="rounded-md bg-[var(--info-soft)] px-4 py-4 text-sm font-semibold text-[var(--bl)] hover:bg-[var(--primary-hover)]"
                    >
                        Apagar Filtros
                    </button>
                </div>
            </div>

            <div className="w-full flex flex-col gap-2 lg:grid lg:grid-cols-[2fr_1fr] lg:gap-4 justify-center">
                <div className="w-full h-[400px] bg-[var(--bg-secondary)] rounded-md border border-[var(--border-strong)]">

                </div>
                <div className="w-full h-[400px] bg-[var(--bg-secondary)] rounded-md border border-[var(--border-strong)]">

                </div>
            </div>




        </section>
    );
}
