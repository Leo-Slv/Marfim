import { apiFetch } from '@/lib/http/api-client';

import type { CartLine } from '../model/cart';
import type { CartQuote } from '../model/cart-quote';
import { cartQuoteSchema } from '../schemas/cart-quote.schema';

/**
 * Re-prices the client cart against the current catalog and stock
 * (read-only, nothing is reserved). Each line sends the price the shopper
 * saw, so a stale one comes back as `PriceChanged`.
 */
async function quoteCart(lines: readonly CartLine[]): Promise<CartQuote> {
	const payload = await apiFetch<unknown>('/api/orders/cart/quote', {
		method: 'POST',
		body: {
			items: lines.map((line) => ({
				productId: line.productId,
				quantity: line.quantity,
				expectedUnitPrice: line.unitPrice,
			})),
		},
	});

	return cartQuoteSchema.parse(payload);
}

export { quoteCart };
