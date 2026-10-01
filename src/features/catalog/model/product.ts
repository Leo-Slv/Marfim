import type { z } from 'zod';

import type {
	productSummaryPageSchema,
	productSummarySchema,
} from '../schemas/product.schema';

type ProductSummary = z.infer<typeof productSummarySchema>;
type ProductSummaryPage = z.infer<typeof productSummaryPageSchema>;

export type { ProductSummary, ProductSummaryPage };
