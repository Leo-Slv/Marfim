import type { z } from 'zod';

import type { categorySchema } from '../schemas/category.schema';

type Category = z.infer<typeof categorySchema>;

export type { Category };
