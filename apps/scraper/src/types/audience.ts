

/**
 * Schema for a single audience (e.g., a target audience for the event)
 * This schema defines the expected properties and their types for an audience,
 * including name and audienceType. It is used for validation and type inference in TypeScript.
 */
export type SchemaAudience = {
    '@type'?: string | string[];
    name?: string;
    audienceType?: string | string[];
}

/**
 * Schema for a single coordinate (latitude or longitude)
 * This schema defines the expected properties and their types for a coordinate,
 * including latitude and longitude. It is used for validation and type inference in TypeScript.
 */
export type NormalizedAudience = {
    name: string;
    type?: string;
    audienceType?: string;
}