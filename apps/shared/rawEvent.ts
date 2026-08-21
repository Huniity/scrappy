

import { z } from 'zod';
import { eventTypeSchema } from './eventTypes';
import { districtSchema, nuts2RegionSchema } from './territory';

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
})
.superRefine((event, context) => {
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