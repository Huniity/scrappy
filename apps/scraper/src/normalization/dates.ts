

import type { NormalizedEvent } from '../types/events';

/**
 * Date type can be either 'start' or 'end', indicating whether the date is a start date or an end date.
 */
type DateType = 'start' | 'end';


/**
 * Extracts the timezone offset from a date string in the format of ±HH:MM or ±HHMM.
 * @param value The date string from which to extract the timezone offset.
 * @returns The extracted timezone offset in the format of ±HH:MM, or undefined if no offset is found.
 */
function getOffset(value: string): string | undefined {
    const match = value.match(/([+-]\d{2}):?(\d{2})$/);
    return match?.[1];
}

/**
 * Check if a date is valid.
 * @param value The date string to validate.
 * @returns True if the date is valid, false otherwise.
 */
function isDateValid(value: string): boolean {
    return !Number.isNaN(
        new Date(value).getTime(),
    );
}

/**
 * Normalizes a date string based on its type and fallback offset.
 * @param value The date string to normalize.
 * @param type The type of the date (start or end).
 * @param fallbackOffset The fallback timezone offset.
 * @returns The normalized date string, or undefined if invalid.
 */
function normalizeDate(
    value: string | undefined,
    type: DateType,
    fallbackOffset: string | undefined,
): string | undefined {

    if (!value) {
        return undefined;
    }

    if (getOffset(value)) {
        return isDateValid(value) ? value : undefined;
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        if (!fallbackOffset) {
            return undefined;
        }

        const time = type === 'start' ? 'T00:00:00' : 'T23:59:59';

        const result = `${value}T${time}${fallbackOffset ?? ''}`;

        return isDateValid(result) ? result : undefined;
    }

    // 
    const localDateTime = value.match(
        /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2})(?::(\d{2}))?$/,
    );

    if (localDateTime && fallbackOffset) {
        const seconds =
            localDateTime[2] ?? '00';

        const result =
            `${localDateTime[1]}:${seconds}${fallbackOffset}`;

        return isDateValid(result)
            ? result
            : undefined;
    }

    return undefined;
}

/**
 * Normalizes the dates of a viral agenda event.
 * @param event The event for which to normalize dates.
 * @returns The event with normalized dates, or null if the start date is invalid.
 */
export function normalizeViralAgendaDates(
    event: NormalizedEvent,
): NormalizedEvent | null {
    const startOffset =
        getOffset(event.startDate);

    const startDate = normalizeDate(
        event.startDate,
        'start',
        startOffset,
    );

    if (!startDate) {
        return null;
    }

    const endDate = normalizeDate(
        event.endDate,
        'end',
        getOffset(startDate),
    );

    const validEndDate =
        endDate &&
            new Date(endDate) >= new Date(startDate)
            ? endDate
            : undefined;

    return {
        ...event,
        startDate,
        endDate: validEndDate,
    };
}