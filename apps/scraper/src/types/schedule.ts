

/**
 * Schema for a single coordinate (latitude or longitude)
 * This schema defines the expected properties and their types for a coordinate,
 * including latitude and longitude. It is used for validation and type inference in TypeScript.
 */
export type SchemaSchedule = {
    '@type'?: string | string[];
    startDate?: string;
    endDate?: string;
    startTime?: string;
    endTime?: string;
    scheduleTimezone?: string;
    byDay?: string | string[];
};


/**
 * Schema for a single schedule (e.g., the timing of the event)
 * This schema defines the expected properties and their types for a schedule,
 * including startDate, endDate, startTime, endTime, timeZone, and repeatDays.
 * It is used for validation and type inference in TypeScript.
 */
export type NormalizedSchedule = {
    startDate: string;
    endDate?: string;
    startTime?: string;
    endTime?: string;
    timeZone?: string;
    repeatDays?: string[];
};