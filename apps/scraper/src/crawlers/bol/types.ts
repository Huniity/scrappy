export type BolIgnoreReason =
    | 'continuous_attraction'
    | 'multiple_dates_or_sessions'
    | 'multiple_session_candidates'
    | 'unstable_date'
    | 'missing_title'
    | 'unknown';

export type BolDateRange = {
    startDateText?: string;
    endDateText?: string;
};

export type BolCoordinates = {
    latitude?: string;
    longitude?: string;
};

export type BolAddress = {
    streetAddress?: string;
    postalLocality?: string;
    locality?: string;
};
