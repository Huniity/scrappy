

import { z } from "zod";

export const eventTypeSchema = z.enum([
    'Concerto',
    'Feira',
    'Mercado',
    'FestaPopular',
    'Teatro',
    'Festival',
    'Exposição',
    'Cinema',
    'Desporto',
    'Gastronomia',
    'Workshop',
    'Conferência',
    'Infantil',
    'Business',
    'Moda',
    'Educativo',
    'Património',
    'Social',
    'Cultural',
    'Hackaton',
    'Outro',
])

export type EventType = z.infer<typeof eventTypeSchema>