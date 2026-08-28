

import { z } from 'zod';
import { eventTypeSchema } from './eventTypes';
import { districtSchema, nuts2RegionSchema } from './territory';


/**
 * Creates a Zod schema for a coordinate (latitude or longitude).
 * @param minimum The minimum valid value for the coordinate.
 * @param maximum The maximum valid value for the coordinate.
 * @param label A label for the coordinate (used in error messages).
 * @returns  A Zod schema for validating a coordinate string.
 */
function coordinateSchema(
    minimum: number,
    maximum: number,
    label: string,
) {
    return z
        .string()
        .trim()
        .min(1)
        .refine((value) => {
            const coordinate = Number(value);

            return Number.isFinite(coordinate) &&
                coordinate >= minimum &&
                coordinate <= maximum;
        }, `${label} must be a valid coordinate`)
        .optional();
}

/**
 * Schema for a single agent (e.g., an organizer, promoter, etc.)
 */
const agentSchema = z.object({
    name: z.string().trim().min(1).max(250),
    type: z.string().trim().min(1).optional(),
    url: z.string().url().optional(),
    image: z.string().url().optional(),
    sameAs: z.union([
        z.string().url(),
        z.array(z.string().url()).max(10),
    ]).optional(),
});

/**
 * Schema for a single audience (e.g., a target audience for the event)
 */
const agentsSchema = z
    .array(agentSchema)
    .max(100)
    .default([]);

/**
 * Schema for a single audience (e.g., a target audience for the event)
 */
const audienceSchema = z.object({
    name: z.string().trim().min(1).max(250).optional(),
    audienceType:
        z.string().trim().min(1).max(250).optional(),
});

/**
 * Schema for a single offer (e.g., a ticket or admission)
 */
const offerSchema = z.object({
    name: z.string().trim().min(1).max(250),
    price: z.number().nonnegative(),
    priceCurrency:
        z.string().trim().min(3).max(3).default('EUR'),
    availability: z.string().url().optional(),
    validFrom: z.string().datetime({
        offset:
            true
    }).optional(),
    url: z.string().url().optional(),
});

/**
 * Schema for a single schedule (e.g., the timing of the event)
 */
const scheduleSchema = z.object({
    startDate: z.string().min(1),
    endDate: z.string().min(1).optional(),
    startTime: z.string().min(1).optional(),
    endTime: z.string().min(1).optional(),
    timeZone: z.string().min(1).optional(),
    repeatDays:
        z.array(z.string().min(1)).max(7).optional(),
});

/**
 * Schema for a raw event object, which includes all the necessary fields to represent an event.
 * This schema is used for validation and type inference in TypeScript.
 * It ensures that the event data adheres to the expected structure and constraints.
 * The schema includes fields for title, description, source URL, start and end dates, event type,
 * location information, image URL, keywords, price, age rating, maximum attendee capacity,
 * latitude and longitude. It also includes nested schemas for agents, audiences, offers, and schedules.
 * The schema uses Zod for validation and provides custom error messages for specific validation rules.
 * It also includes a superRefine method to enforce additional constraints, such as ensuring that
 * latitude and longitude are provided together and that the end date is not earlier than the start date.
 */
export const rawEventSchema = z
    .object({
        title: z.string().trim().min(3).max(250),

        description: z.string().trim().min(10).max(2000),

        sourceUrl: z.string().url(),

        startDate: z.string().datetime({ offset: true }),

        endDate: z.string().datetime({ offset: true }).optional(),

        type: eventTypeSchema.default('Outro'),

        locationName: z.string().trim().min(1),

        sourceLocality: z.string().trim().min(1).optional(),

        municipality: z.string().trim().min(1),

        district: districtSchema.optional(),

        region: nuts2RegionSchema.optional(),

        dicoCode: z.string().regex(
            /^\d{4}$/,
            'DICO code must contain exactly four digits',
        ).optional(),

        imageUrl: z.string().url().optional(),

        keywords: z
            .array(z.string().trim().min(1).max(100))
            .max(50)
            .default([]),

        price: z.number().nonnegative().optional(),

        ageRating: z.number().int().nonnegative().optional(),

        maximumAttendeeCapacity: z.number().int().nonnegative().optional(),

        latitude: coordinateSchema(-90, 90, 'Latitude'),

        longitude: coordinateSchema(-180, 180, 'Longitude'),

        alternateName: z.string().trim().max(250).optional(),

        isAccessibleForFree: z.boolean().optional(),

        eventAttendanceMode: z.enum([
            'InPerson',
            'Online',
            'Hybrid',
        ]).optional(),

        doorTime: z.string().datetime({ offset: true }).optional(),

        duration: z.string().trim().min(1).max(50).optional(),

        eventStatus: z.enum([
            'Scheduled',
            'Cancelled',
            'Postponed',
            'Rescheduled',
            'MovedOnline',
            'Completed',
        ]).optional(),

        organizer: agentsSchema,
        promoter: agentsSchema,
        maintainer: agentsSchema,
        performers: agentsSchema,
        funder: agentsSchema,
        actor: agentsSchema,
        director: agentsSchema,
        composer: agentsSchema,

        audience: z
            .array(audienceSchema)
            .max(50)
            .default([]),

        offers: z
            .array(offerSchema)
            .max(100)
            .default([]),

        schedule: scheduleSchema.optional(),
    })
    .superRefine((event, context) => {
        if (
            (event.latitude === undefined) !==
            (event.longitude === undefined)
        ) {
            context.addIssue({
                code: 'custom',
                path: ['latitude'],
                message: 'Latitude and longitude must be provided together',
            });
        }

        if (
            event.endDate &&
            new Date(event.endDate) < new Date(event.startDate)
        ) {
            context.addIssue({
                code: 'custom',
                path: ['endDate'],
                message: 'End date cannot be earlier than start date',
            });
        }
    });

export type RawEvent = z.infer<typeof rawEventSchema>;
