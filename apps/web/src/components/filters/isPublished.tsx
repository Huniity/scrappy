'use client';

export type PublishedFilterValue = 'published' | 'unpublished' | 'all';
interface PublishedFilterProps {
    value: PublishedFilterValue;
    onChange: (value: PublishedFilterValue) => void;
}

const IsPublishedFilter = ({ value, onChange }: PublishedFilterProps) => {
    return (
        <>
            <div className="flex w-full border border-[var(--border-strong)] rounded-md">
                <button
                    type="button"
                    aria-pressed={value === 'all'}
                    onClick={() => onChange('all')}
                    className={`flex-1 rounded-md px-3 py-2 text-sm ${value === 'all'
                        ? 'bg-[var(--text-primary)] !text-[var(--text-inverse)]'
                        : '!text-[var(--text-primary)]'
                        }`}
                >
                    Todos
                </button>

                <button
                    type="button"
                    aria-pressed={value === 'published'}
                    onClick={() => onChange('published')}
                    className={`flex-1 rounded-md px-3 py-2 text-sm ${value === 'published'
                        ? 'bg-[var(--text-primary)] !text-[var(--text-inverse)]'
                        : '!text-[var(--text-primary)]'
                        }`}
                >
                    Publicados
                </button>

                <button
                    type="button"
                    aria-pressed={value === 'unpublished'}
                    onClick={() => onChange('unpublished')}
                    className={`flex-1 rounded-md px-3 py-2 text-sm ${value === 'unpublished'
                        ? 'bg-[var(--text-primary)] !text-[var(--text-inverse)]'
                        : '!text-[var(--text-primary)]'
                        }`}
                >
                    A publicar
                </button>
            </div>
        </>
    );
}

export { IsPublishedFilter };