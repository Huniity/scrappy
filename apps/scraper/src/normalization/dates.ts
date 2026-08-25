

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
    if (value.endsWith('Z')) {
        return 'Z';
    }
    const match = value.match(/([+-]\d{2}):?(\d{2})$/);
    return match ? `${match[1]}:${match[2]}` : undefined;
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
 * Get the timezone offset for a given date string and timezone.
 * @param value The date string for which to get the timezone offset.
 * @param timezone The timezone to use for calculating the offset.
 * @returns The timezone offset in the format of ±HH:MM, or undefined if the offset cannot be determined.
 */
function getTimezoneOffset(
    value: string,
    timezone: string | undefined,
): string | undefined {
    if (!timezone) {
        return undefined;
    }

    const match = value.match(
        /^(\d{4})-(\d{2})-(\d{2})/,
    );

    if (!match) {
        return undefined;
    }

    const probeDate = new Date(Date.UTC(
        Number(match[1]),
        Number(match[2]) - 1,
        Number(match[3]),
        12,
    ));

    try {
        const timezoneName =
            new Intl.DateTimeFormat('en-US', {
                timeZone: timezone,
                timeZoneName: 'longOffset',
                hour: '2-digit',
            })
                .formatToParts(probeDate)
                .find(
                    (part) =>
                        part.type === 'timeZoneName',
                )?.value;

        if (timezoneName === 'GMT') {
            return '+00:00';
        }

        const offset =
            timezoneName?.replace(/^GMT/, '');

        return offset &&
            /^[+-]\d{2}:\d{2}$/.test(offset)
            ? offset
            : undefined;
    } catch {
        return undefined;
    }
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
    timezone: string | undefined,
): string | undefined {

    if (!value) {
        return undefined;
    }

    if (getOffset(value)) {
        return isDateValid(value) ? value : undefined;
    }

    const sourceOffset = getOffset(value);

    if (sourceOffset) {
        return isDateValid(value) ? value : undefined;
    }

    const offset =
        getTimezoneOffset(value, timezone) ??
        fallbackOffset;

    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        if (!offset) {
            return undefined;
        }

        const time = type === 'start' ? '00:00:00' : '23:59:59';

        const result = `${value}T${time}${offset}`;

        return isDateValid(result) ? result : undefined;
    }


    const localDateTime = value.match(
        /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2})(?::(\d{2}))?$/,
    );

    if (localDateTime && offset) {
        const seconds =
            localDateTime[2] ?? '00';

        const result =
            `${localDateTime[1]}:${seconds}${offset}`;

        return isDateValid(result)
            ? result
            : undefined;
    }

    return undefined;
}

/**
 * Normalizes the dates of a viral agenda event.
 * @param event The event for which to normalize dates.
 * @param timezone The timezone to use for normalization.
 * @returns The event with normalized dates, or null if the start date is invalid.
 */
export function normalizeViralAgendaDates(
    event: NormalizedEvent,
    timezone = 'Europe/Lisbon',
): NormalizedEvent | null {
    const startOffset =
        getOffset(event.startDate);

    const startDate = normalizeDate(
        event.startDate,
        'start',
        startOffset,
        timezone,
    );

    if (!startDate) {
        return null;
    }

    const endDate = normalizeDate(
        event.endDate,
        'end',
        getOffset(startDate),
        timezone,
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