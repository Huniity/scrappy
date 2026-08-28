

/**
 * Represents the internal attendance mode of an event.
 * It can be one of the following values:
 * - 'InPerson': The event is held in a physical location.
 * - 'Online': The event is held online, such as a webinar or virtual conference.
 * - 'Hybrid': The event has both in-person and online components.
 *
 * This type is used for validation and type inference in TypeScript.
 */
export type NormalizedAttendanceMode =
    | 'InPerson'
    | 'Online'
    | 'Hybrid';


/**
 * A mapping of schema.org attendance mode URLs to internal attendance mode values.
 * This mapping is used to convert the attendance mode specified in schema.org format
 * to the internal representation used within the application.
 *
 * The keys are schema.org attendance mode URLs, and the values are the corresponding
 * internal attendance mode values. If a URL does not have a corresponding internal
 * value, it will be mapped to undefined.
 *
 * @example
 * const mode = attendanceModeMap['https://schema.org/OnlineEventAttendanceMode'];
 * // mode will be 'Online'
 *
 * @type {Record<string, NormalizedAttendanceMode | undefined>}
 */
export const attendanceModeMap: Record<string, NormalizedAttendanceMode | undefined> = 
      {
      'https://schema.org/OfflineEventAttendanceMode':
      'InPerson',
      'https://schema.org/OnlineEventAttendanceMode':
      'Online',
      'https://schema.org/MixedEventAttendanceMode':
      'Hybrid',
};