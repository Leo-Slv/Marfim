import type { z } from 'zod';

import type {
	availabilitySchema,
	productDetailSchema,
	productSummaryPageSchema,
	productSummarySchema,
} from '../schemas/product.schema';

type ProductAvailability = z.infer<typeof availabilitySchema>;
type ProductSummary = z.infer<typeof productSummarySchema>;
type ProductSummaryPage = z.infer<typeof productSummaryPageSchema>;
type ProductDetail = z.infer<typeof productDetailSchema>;

/** `ProductSortOrder` in OrderCore's Catalog module. */
type ProductSortOrder = 'Name' | 'PriceAsc' | 'PriceDesc' | 'Newest';

export type {
	ProductAvailability,
	ProductDetail,
	ProductSortOrder,
	ProductSummary,
	ProductSummaryPage,
};
