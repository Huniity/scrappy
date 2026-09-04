'use client';

import { useEffect, useRef, useState } from 'react';

import { sortOptions } from './events.config';
import type {
    PriceFilter,
    PublishedFilter,
    SortOption,
} from './events.types';

type EventsFiltersProps = {
    startDate: string;
    endDate: string;
    priceFilter: PriceFilter;
    publishedFilter: PublishedFilter;
    searchQuery: string;
    sortOption: SortOption;
    onStartDateChange: (value: string) => void;
    onEndDateChange: (value: string) => void;
    onPriceFilterChange: (value: PriceFilter) => void;
    onPublishedFilterChange: (value: PublishedFilter) => void;
    onSearchQueryChange: (value: string) => void;
    onSortOptionChange: (value: SortOption) => void;
    onReset: () => void;
};

export function EventsFilters({
    startDate,
    endDate,
    priceFilter,
    publishedFilter,
    searchQuery,
    sortOption,
    onStartDateChange,
    onEndDateChange,
    onPriceFilterChange,
    onPublishedFilterChange,
    onSearchQueryChange,
    onSortOptionChange,
    onReset,
}: EventsFiltersProps) {
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);
    const [isSortOpen, setIsSortOpen] = useState(false);
    const filtersRef = useRef<HTMLDivElement>(null);
    const sortRef = useRef<HTMLDivElement>(null);

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
        <div className="flex min-h-[80px] w-full flex-col gap-4 rounded-md border border-[var(--border-strong)] bg-[var(--bg-secondary)] px-4 py-6 shadow-sm max-[1200px]:gap-3 max-[1200px]:px-3 max-[1200px]:py-4">
            <div className="grid grid-cols-[4fr_2fr_3fr_1fr] items-end gap-6 max-[1200px]:gap-3">
                <div className="flex flex-col gap-1">
                    <span className="text-sm font-bold text-[var(--text-secondary)]">Estado</span>
                    <div className="flex w-full rounded-md border border-[var(--border-strong)] shadow-sm">
                        <button
                            type="button"
                            aria-pressed={publishedFilter === 'all'}
                            onClick={() => onPublishedFilterChange('all')}
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
                            onClick={() => onPublishedFilterChange('published')}
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
                            onClick={() => onPublishedFilterChange('unpublished')}
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
                                        onSortOptionChange(option.value);
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
                        onChange={(event) => onSearchQueryChange(event.target.value)}
                        className="w-full rounded-md border border-[var(--border-strong)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text-primary)] shadow-sm outline-none focus:border-[var(--primary)]"
                    />
                </div>

                <div ref={filtersRef} className="relative flex flex-col items-end justify-center gap-1">
                    <button
                        type="button"
                        aria-haspopup="dialog"
                        aria-expanded={isFiltersOpen}
                        aria-controls="event-filters"
                        onClick={() => {
                            setIsSortOpen(false);
                            setIsFiltersOpen((open) => !open);
                        }}
                        className="flex w-auto items-center justify-center gap-3 rounded-md border border-[var(--border-strong)] bg-[var(--surface)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)] shadow-sm transition-colors hover:bg-[var(--surface-muted)]"
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
                                        onChange={(event) => onStartDateChange(event.target.value)}
                                        className="w-full rounded-md border border-[var(--border-strong)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text-primary)] shadow-sm outline-none focus:border-[var(--primary)]"
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
                                        onChange={(event) => onEndDateChange(event.target.value)}
                                        className="w-full rounded-md border border-[var(--border-strong)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text-primary)] shadow-sm outline-none focus:border-[var(--primary)]"
                                    />
                                </div>

                                <div className="col-span-2 flex flex-col gap-1">
                                    <span className="text-sm font-bold text-[var(--text-secondary)]">Preço</span>
                                    <div className="flex w-full rounded-md border border-[var(--border-strong)] shadow-sm">
                                        <button
                                            type="button"
                                            aria-pressed={priceFilter === 'all'}
                                            onClick={() => onPriceFilterChange('all')}
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
                                            onClick={() => onPriceFilterChange('free')}
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
                                            onClick={() => onPriceFilterChange('paid')}
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

                            <div className="mt-6 flex w-full justify-end">
                                <button
                                    type="button"
                                    onClick={onReset}
                                    className="max-w-lg cursor-pointer rounded-md border border-[var(--border-strong)] bg-[var(--surface)] px-3 py-2 text-sm font-semibold text-[var(--text-primary)] shadow-sm transition-colors hover:bg-[var(--surface-muted)]"
                                >
                                    Limpar filtros
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
