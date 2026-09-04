import type { PublishedFilter } from '../events.types';

type EventPublishedFilterProps = {
    value: PublishedFilter;
    onChange: (value: PublishedFilter) => void;
};

const options: { value: PublishedFilter; label: string }[] = [
    { value: 'all', label: 'Todos' },
    { value: 'published', label: 'Publicados' },
    { value: 'unpublished', label: 'A publicar' },
];

export function EventPublishedFilter({
    value,
    onChange,
}: EventPublishedFilterProps) {
    return (
        <div className="flex flex-col gap-1">
            <span className="text-sm font-bold text-[var(--text-secondary)]">
                Estado
            </span>
            <div className="flex w-full rounded-md border border-[var(--border-strong)]">
                {options.map((option) => (
                    <button
                        key={option.value}
                        type="button"
                        aria-pressed={value === option.value}
                        onClick={() => onChange(option.value)}
                        className={`flex-1 rounded-md px-3 py-2 text-sm ${value === option.value
                            ? 'bg-[var(--text-primary)] !text-[var(--text-inverse)]'
                            : '!text-[var(--text-primary)]'
                            }`}
                    >
                        {option.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
