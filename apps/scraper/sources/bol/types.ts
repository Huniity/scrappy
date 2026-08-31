

/**
 * Schema for a valid Bol.com event, which extends the BolJsonLdEvent schema.
 * This schema includes additional required fields such as name, url, and startDate,
 * as well as optional fields for location and offers.
 * It is used for validation and type inference in TypeScript.
 */
export type BolJsonLdEvent = {
    '@context'?: string;
    '@type'?: string | string[];
    productID?: string;
    name?: string;
    url?: string;
    image?: string | string[];
    startDate?: string;
    endDate?: string;
    duration?: string;
    description?: string;
    performers?: string | string[];
    location?: BolJsonLdLocation;
    offers?: BolJsonLdOffer |
    BolJsonLdOffer[];
};

/**
 * Schema for a valid Bol.com location, which extends the BolJsonLdLocation schema.
 * This schema includes additional optional fields for geo coordinates and address.
 * It is used for validation and type inference in TypeScript.
 */
export type BolJsonLdLocation = {
    '@type'?: string;
    name?: string;
    url?: string;
    geo?: {
        latitude?: string | number;
        longitude?: string | number;
    };
    address?: {
        streetAddress?: string;
        postalCode?: string;
        addressLocality?: string;
        addressCountry?: string;
    };
};

/**
 * Schema for a valid Bol.com offer, which extends the BolJsonLdOffer schema.
 * This schema includes additional optional fields for availability, price, and currency.
 * It is used for validation and type inference in TypeScript.
 */
export type BolJsonLdOffer = {
    '@type'?: string;
    availability?: string;
    url?: string;
    price?: string | number;
    priceCurrency?: string;
};

/**
 * Schema for a valid JSON object, which is a record of string keys and unknown values.
 * It is used for validation and type inference in TypeScript.
 */
export type JsonObject = Record<string, unknown>;

export type BolCoordinates = {
    latitude: string;
    longitude: string;
}