

/**
 * NormalizedEventStatus represents the status of an event in a normalized form. It can be one of the following values:
 * - 'Scheduled': The event is scheduled to occur at a specific date and time.
 * - 'Cancelled': The event has been cancelled and will not take place.
 * - 'Postponed': The event has been postponed to a later date or time.
 * - 'Rescheduled': The event has been rescheduled to a different date or time.
 * - 'MovedOnline': The event has been moved to an online format.
 * - 'Completed': The event has already taken place and is now completed.
 *
 * This type is used for validation and type inference in TypeScript.
 */
export type NormalizedEventStatus =
    | 'Scheduled'
    | 'Cancelled'
    | 'Postponed'
    | 'Rescheduled'
    | 'MovedOnline'
    | 'Completed';


/**
 * A mapping of schema.org event status URLs to internal normalized event status values.
 * This mapping is used to convert the event status specified in schema.org format
 * to the internal representation used within the application.
 *
 * The keys are schema.org event status URLs, and the values are the corresponding
 * internal normalized event status values. If a URL does not have a corresponding internal
 * value, it will be mapped to undefined.
 *
 * @example
 * const status = eventStatusMap['https://schema.org/EventCancelled'];
 * // status will be 'Cancelled'
 *
 * @type {Record<string, NormalizedEventStatus | undefined>}
 */
export const eventStatusMap: Record<string, NormalizedEventStatus | undefined> = 
    {
    'https://schema.org/EventScheduled': 'Scheduled',
    'https://schema.org/EventCancelled': 'Cancelled',
    'https://schema.org/EventPostponed': 'Postponed',
    'https://schema.org/EventRescheduled': 'Rescheduled',
    'https://schema.org/EventMovedOnline': 'MovedOnline',
    'https://schema.org/EventCompleted': 'Completed',
};