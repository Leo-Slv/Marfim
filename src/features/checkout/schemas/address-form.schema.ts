import { z } from 'zod';

import { brazilianStates } from '../lib/brazilian-states';

const required = (max: number) => z.string().trim().min(1).max(max);

/**
 * The new-address form. Required fields follow OrderCore's `Address.Create`
 * (+ recipient); the CEP must have 8 digits (checked here — the backend
 * accepts any string, pendency #5). The label is optional in the mockup and
 * filled in before sending (pendency #2).
 */
const addressFormSchema = z.object({
	label: z.string().trim().max(100),
	recipientName: required(200),
	postalCode: z
		.string()
		.refine((value) => value.replace(/\D/g, '').length === 8),
	street: required(200),
	number: required(20),
	complement: z.string().trim().max(100),
	neighborhood: required(100),
	city: required(100),
	state: z.enum(brazilianStates),
	makeDefault: z.boolean(),
});

type AddressForm = z.infer<typeof addressFormSchema>;

const emptyAddressForm: AddressForm = {
	label: '',
	recipientName: '',
	postalCode: '',
	street: '',
	number: '',
	complement: '',
	neighborhood: '',
	city: '',
	state: 'SP',
	makeDefault: true,
};

export type { AddressForm };
export { addressFormSchema, emptyAddressForm };
