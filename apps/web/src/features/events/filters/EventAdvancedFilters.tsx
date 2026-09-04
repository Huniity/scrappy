import type { PriceFilter } from '../events.types';

type EventAdvancedFiltersProps = {
    startDate: string;
    endDate: string;
    priceFilter: PriceFilter;
    isOpen: boolean;
    onToggle: () => void;
    onStartDateChange: (value: string) => void;
    onEndDateChange: (value: string) => void;
    onPriceFilterChange: (value: PriceFilter) => void;
    onReset: () => void;
};

const priceOptions: { value: PriceFilter; label: string }[] = [
    { value: 'all', label: 'Todos' },
    { value: 'free', label: 'Gratuitos' },
    { value: 'paid', label: 'Pagos' },
];

export function EventAdvancedFilters({
    startDate,
    endDate,
    priceFilter,
    isOpen,
    onToggle,
    onStartDateChange,
    onEndDateChange,
    onPriceFilterChange,
    onReset,
}: EventAdvancedFiltersProps) {
    return (
        <>
            <button
                type="button"
                aria-haspopup="dialog"
                aria-expanded={isOpen}
                aria-controls="event-filters"
                onClick={onToggle}
                className="flex w-auto items-center justify-center gap-3 rounded-md border border-[var(--border-strong)] bg-[var(--surface)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)] transition-colors hover:bg-[var(--surface-muted)]"
            >
                <span>Filtros</span>
                <span
                    aria-hidden="true"
                    className={`h-2 w-2 rotate-45 border-b border-r transition-transform ${isOpen
                        ? '-translate-y-0.5 rotate-[225deg]'
                        : '-translate-y-0.5'
                        }`}
                />
            </button>

            {isOpen && (
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
                                onChange={(event) => onEndDateChange(event.target.value)}
                                className="w-full rounded-md border border-[var(--border-strong)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--primary)]"
                            />
                        </div>

                        <div className="col-span-2 flex flex-col gap-1">
                            <span className="text-sm font-bold text-[var(--text-secondary)]">
                                Preço
                            </span>
                            <div className="flex w-full rounded-md border border-[var(--border-strong)]">
                                {priceOptions.map((option) => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        aria-pressed={priceFilter === option.value}
                                        onClick={() => onPriceFilterChange(option.value)}
                                        className={`flex-1 rounded-md px-3 py-2 text-sm ${priceFilter === option.value
                                            ? 'bg-[var(--text-primary)] !text-[var(--text-inverse)]'
                                            : '!text-[var(--text-primary)]'
                                            }`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 flex w-full justify-end">
                        <button
                            type="button"
                            onClick={onReset}
                            className="max-w-lg cursor-pointer rounded-md border border-[var(--border-strong)] bg-[var(--surface)] px-3 py-2 text-sm font-semibold text-[var(--text-primary)] transition-colors hover:bg-[var(--surface-muted)]"
                        >
                            Limpar filtros
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
