

interface ResetFiltersProps {
    onReset: () => void;
}


const ResetFiltersButton = ({ onReset }: ResetFiltersProps) => {
    return (
        <>
            <button
                type="button"
                onClick={onReset}
                className="rounded-md bg-[var(--info-soft)] px-4 py-4 text-sm font-semibold text-[var(--bl)] hover:bg-[var(--primary-hover)]"
            >
                Apagar Filtros
            </button>
        </>
    )
}

export default ResetFiltersButton
