import { apiFetch } from '@/lib/http/api-client';

import type { CustomerAddress, CustomerAddressRequest } from '../model/address';
import {
	customerAddressListSchema,
	customerAddressSchema,
} from '../schemas/address.schema';

/** The signed-in customer's saved addresses (`customers/me/addresses`). */
async function getAddresses(): Promise<CustomerAddress[]> {
	const payload = await apiFetch<unknown>('/api/customers/me/addresses');
	return customerAddressListSchema.parse(payload);
}

async function addAddress(
	request: CustomerAddressRequest,
): Promise<CustomerAddress> {
	const payload = await apiFetch<unknown>('/api/customers/me/addresses', {
		method: 'POST',
		body: request,
	});
	return customerAddressSchema.parse(payload);
}

async function setDefaultAddress(
	addressId: string,
	kind: 'shipping' | 'billing',
) {
	await apiFetch<null>(
		`/api/customers/me/addresses/${encodeURIComponent(addressId)}/default-${kind}`,
		{ method: 'POST' },
	);
}

export { addAddress, getAddresses, setDefaultAddress };
