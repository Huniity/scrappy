import type { SortOption } from './events.types';

export const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'date-asc', label: 'Data ↑' },
    { value: 'date-desc', label: 'Data ↓' },
    { value: 'price-asc', label: 'Valor ↑' },
    { value: 'price-desc', label: 'Valor ↓' },
    { value: 'title-asc', label: 'Z - A' },
    { value: 'title-desc', label: 'A - Z' },
];

const eventListTitleLimit = 23;

export function getEventListTitle(title: string) {
    return title.length > eventListTitleLimit
        ? `${title.slice(0, eventListTitleLimit)}...`
        : title;
}
