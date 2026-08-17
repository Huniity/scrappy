

import { z } from 'zod';

  export const districtSchema = z.enum([
    'Aveiro',
    'Beja',
    'Braga',
    'Bragança',
    'CasteloBranco',
    'Coimbra',
    'Évora',
    'Faro',
    'Guarda',
    'Leiria',
    'Lisboa',
    'Portalegre',
    'Porto',
    'Santarém',
    'Setúbal',
    'VianaDoCastelo',
    'VilaReal',
    'Viseu',
  ]);

  export const nuts2RegionSchema = z.enum([
    'PT11',
    'PT16',
    'PT1A',
    'PT1B',
    'PT1C',
    'PT18',
    'PT15',
    'PT20',
    'PT30',
  ]);

  export type District = z.infer<typeof districtSchema>;
  export type Nuts2Region = z.infer<typeof nuts2RegionSchema>;