

import { z } from 'zod';
import { eventTypeSchema } from './eventTypes';
import { districtSchema, nuts2RegionSchema } from './territory';

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

export const rawEventSchema = z
.object({
    title: z.string().trim().min(3).max(250),

    description: z.string().trim().min(10).max(2000),

    sourceUrl: z.string().url(),

    startDate: z.string().datetime({ offset: true }),

    endDate: z.string().datetime({ offset: true }).optional(),

    type: eventTypeSchema.default('Outro'),

    locationName: z.string().trim().min(1),

    locality: z.string().trim().min(1),

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
