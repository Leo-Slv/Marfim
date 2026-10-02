import type { z } from 'zod';

import type {
	cartLineIssueSchema,
	cartQuoteLineSchema,
	cartQuoteSchema,
} from '../schemas/cart-quote.schema';

type CartLineIssue = z.infer<typeof cartLineIssueSchema>;
type CartQuoteLine = z.infer<typeof cartQuoteLineSchema>;
type CartQuote = z.infer<typeof cartQuoteSchema>;

export type { CartLineIssue, CartQuote, CartQuoteLine };
