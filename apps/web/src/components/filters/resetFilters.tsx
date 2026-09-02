

interface ResetFiltersProps {
    onReset: () => void;
}


const ResetFiltersButton = ({ onReset }: ResetFiltersProps) => {
    return (
        <>
            <button
                type="button"
                onClick={onReset}
                className="cursor-pointer max-w-lg rounded-md border border-[var(--border-strong)] bg-[var(--surface)] px-3 py-2 text-sm font-semibold text-[var(--text-primary)] transition-colors hover:bg-[var(--surface-muted)]"
            >
                Apagar Filtros
            </button>
        </>
    )
}

export default ResetFiltersButton
