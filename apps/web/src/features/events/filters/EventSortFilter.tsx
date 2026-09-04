import { sortOptions } from '../events.config';
import type { SortOption } from '../events.types';

type EventSortFilterProps = {
    value: SortOption;
    isOpen: boolean;
    onToggle: () => void;
    onChange: (value: SortOption) => void;
};

export function EventSortFilter({
    value,
    isOpen,
    onToggle,
    onChange,
}: EventSortFilterProps) {
    return (
        <div className="relative flex flex-col gap-1">
            <span className="text-sm font-bold text-[var(--text-secondary)]">
                Ordenar por
            </span>
            <button
                id="sort-events"
                type="button"
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                aria-controls="sort-options"
                onClick={onToggle}
                className="flex w-full items-center justify-between gap-3 rounded-md border border-[var(--border-strong)] bg-[var(--surface)] px-3 py-2 text-sm font-semibold text-[var(--text-primary)] shadow-sm outline-none transition-colors hover:bg-[var(--surface-muted)] focus:border-[var(--primary)]"
            >
                <span>
                    {sortOptions.find((option) => option.value === value)?.label}
                </span>
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
                            aria-selected={value === option.value}
                            onClick={() => {
                                onChange(option.value);
                            }}
                            className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${value === option.value
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
    );
}
