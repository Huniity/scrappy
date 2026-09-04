type EventSearchFilterProps = {
    value: string;
    onChange: (value: string) => void;
};

export function EventSearchFilter({
    value,
    onChange,
}: EventSearchFilterProps) {
    return (
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
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className="w-full rounded-md border border-[var(--border-strong)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--primary)]"
            />
        </div>
    );
}
