import type { CustomerAddress } from '../model/address';

/**
 * The address to start selected: the one in the URL (coming back from the
 * payment step) if it still exists, else the default of that kind, else the
 * first. Null when there are none.
 */
function initialAddressId(
	addresses: readonly CustomerAddress[],
	fromUrl: string | null,
	kind: 'shipping' | 'billing',
): string | null {
	if (fromUrl && addresses.some((address) => address.id === fromUrl)) {
		return fromUrl;
	}
	const fallback =
		addresses.find((address) =>
			kind === 'shipping'
				? address.isDefaultShipping
				: address.isDefaultBilling,
		) ?? addresses[0];
	return fallback?.id ?? null;
}

export { initialAddressId };
