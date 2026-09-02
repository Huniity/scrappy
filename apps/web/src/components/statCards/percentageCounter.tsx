

export function calculatePercentage(count: number, total: number): string {
    if (total <= 0) {
        return '0,0%';
    }

    const percentage = (count / total) * 100;
    return `${percentage.toFixed(1).replace('.', ',')}%`;
}
