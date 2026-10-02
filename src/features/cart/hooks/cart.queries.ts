'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/lib/constants/query-keys';

import { quoteCart } from '../api/quote-cart';
import type { CartLine } from '../model/cart';
import { useDebouncedValue } from './use-debounced-value';

const QUOTE_DEBOUNCE_MS = 300;

/**
 * The backend's quote for the bag, refreshed when the bag changes
 * (debounced, so a burst of +/− clicks makes one request).
 */
function useCartQuote(lines: readonly CartLine[]) {
	const debouncedLines = useDebouncedValue(lines, QUOTE_DEBOUNCE_MS);
	const signature = debouncedLines
		.map((line) => `${line.productId}:${line.quantity}:${line.unitPrice}`)
		.join('|');

	const quote = useQuery({
		queryKey: queryKeys.cart.quote(signature),
		queryFn: () => quoteCart(debouncedLines),
		enabled: debouncedLines.length > 0,
		placeholderData: keepPreviousData,
		staleTime: 0,
	});

	return {
		...quote,
		/** True while the bag changed and the matching quote hasn't arrived. */
		isOutdated:
			lines !== debouncedLines || quote.isFetching || quote.isPlaceholderData,
	};
}

export { useCartQuote };
