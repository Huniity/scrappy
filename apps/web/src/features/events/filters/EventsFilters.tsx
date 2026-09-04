'use client';

import { useEffect, useRef, useState } from 'react';

import type {
    PriceFilter,
    PublishedFilter,
    SortOption,
} from '../events.types';
import { EventAdvancedFilters } from './EventAdvancedFilters';
import { EventPublishedFilter } from './EventPublishedFilter';
import { EventSearchFilter } from './EventSearchFilter';
import { EventSortFilter } from './EventSortFilter';

export type EventsFiltersProps = {
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
        <div className="flex min-h-[80px] w-full flex-col gap-4 rounded-md border border-[var(--border-strong)] bg-[var(--bg-secondary)] px-4 py-6 max-[1200px]:gap-3 max-[1200px]:px-3 max-[1200px]:py-4">
            <div className="grid grid-cols-[4fr_2fr_3fr_1fr] items-end gap-6 max-[1200px]:gap-3">
                <EventPublishedFilter
                    value={publishedFilter}
                    onChange={onPublishedFilterChange}
                />

                <div ref={sortRef}>
                    <EventSortFilter
                        value={sortOption}
                        isOpen={isSortOpen}
                        onToggle={() => {
                            setIsFiltersOpen(false);
                            setIsSortOpen((open) => !open);
                        }}
                        onChange={(value) => {
                            onSortOptionChange(value);
                            setIsSortOpen(false);
                        }}
                    />
                </div>

                <EventSearchFilter
                    value={searchQuery}
                    onChange={onSearchQueryChange}
                />

                <div
                    ref={filtersRef}
                    className="relative flex flex-col items-end justify-center gap-1"
                >
                    <EventAdvancedFilters
                        startDate={startDate}
                        endDate={endDate}
                        priceFilter={priceFilter}
                        isOpen={isFiltersOpen}
                        onToggle={() => {
                            setIsSortOpen(false);
                            setIsFiltersOpen((open) => !open);
                        }}
                        onStartDateChange={onStartDateChange}
                        onEndDateChange={onEndDateChange}
                        onPriceFilterChange={onPriceFilterChange}
                        onReset={onReset}
                    />
                </div>
            </div>
        </div>
    );
}
