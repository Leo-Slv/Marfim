'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useSession } from '@/lib/auth/use-session';
import { queryKeys } from '@/lib/constants/query-keys';

import {
	addAddress,
	getAddresses,
	setDefaultAddress,
} from '../api/customer-addresses';
import { toAddressRequest } from '../lib/format-address';
import type { CustomerAddress } from '../model/address';
import type { AddressForm } from '../schemas/address-form.schema';

function useAddresses() {
	const session = useSession();
	return useQuery({
		// Keyed by user so another account in the same tab never sees them.
		queryKey: queryKeys.checkout.addresses(session?.userId ?? 'anonymous'),
		queryFn: getAddresses,
		enabled: session?.role === 'Customer',
	});
}

/**
 * Saves a new address. The first one — or one marked "Usar como padrão de
 * entrega" — becomes the default shipping address; the first is also the
 * default billing one (OrderCore marks neither by itself, pendency #4).
 */
function useAddAddress() {
	const queryClient = useQueryClient();
	const session = useSession();
	const key = queryKeys.checkout.addresses(session?.userId ?? 'anonymous');

	return useMutation({
		mutationFn: async ({
			form,
			existing,
		}: {
			form: AddressForm;
			existing: readonly CustomerAddress[];
		}) => {
			const created = await addAddress(toAddressRequest(form, existing.length));
			const isFirst = existing.length === 0;
			if (isFirst || form.makeDefault) {
				await setDefaultAddress(created.id, 'shipping');
			}
			if (isFirst) {
				await setDefaultAddress(created.id, 'billing');
			}
			return created;
		},
		onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
	});
}

export { useAddAddress, useAddresses };
