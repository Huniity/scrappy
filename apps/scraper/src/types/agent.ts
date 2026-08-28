

/**
 * Schema for a single audience (e.g., a target audience for the event)
 * This schema defines the expected properties and their types for an audience,
 * including name and audienceType. It is used for validation and type inference in TypeScript.
 */
export type NormalizedAgent = {
    name: string;
    type?: string;
    url?: string;
    image?: string;
    sameAs?: string;
};

/**
 * Schema for a single agent (e.g., an organizer, promoter, etc.)
 * This schema defines the expected properties and their types for an agent,
 * including name, type, URL, image, and sameAs. It is used for validation and type inference in TypeScript.
 */
export type SchemaAgent = {
    '@type'?: string | string[];
    name?: string;
    url?: string;
    image?: string;
    sameAs?: string | string[];
};