import { DEFAULT_SORT } from './listing-sort';

/**
 * The listing href after applying `changes` to the current query string.
 * Any change other than the page itself goes back to page 1, and default
 * values are dropped so URLs stay short (`/products` instead of
 * `/products?ordem=recentes&pagina=1`).
 */
function buildListingHref(
	pathname: string,
	current: URLSearchParams,
	changes: Record<string, string | null>,
) {
	const params = new URLSearchParams(current);
	for (const [key, value] of Object.entries(changes)) {
		if (value === null || value === '') {
			params.delete(key);
		} else {
			params.set(key, value);
		}
	}
	if (!('pagina' in changes)) {
		params.delete('pagina');
	}
	if (params.get('pagina') === '1') {
		params.delete('pagina');
	}
	if (params.get('ordem') === DEFAULT_SORT.value) {
		params.delete('ordem');
	}

	const query = params.toString();
	return query ? `${pathname}?${query}` : pathname;
}

export { buildListingHref };
