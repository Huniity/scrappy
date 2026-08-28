

/**
 * Schema for a single offer (e.g., a ticket or admission)
 * This schema defines the expected properties and their types for an offer,
 * including name, price, priceCurrency, availability, validFrom, and URL.
 * It is used for validation and type inference in TypeScript.
 */
export type NormalizedOffer = {
    name: string;
    price: number;
    priceCurrency?: string;
    availability?: string;
    validFrom?: string;
    url?: string;
};

/**
 * Schema for a single coordinate (latitude or longitude)
 * This schema defines the expected properties and their types for a coordinate,
 * including latitude and longitude. It is used for validation and type inference in TypeScript.
 */
export type SchemaOffer = {
    '@type'?: string | string[];
    name?: string;
    price?: string | number;
    priceCurrency?: string;
    availability?: string;
    validFrom?: string;
    url?: string;
};