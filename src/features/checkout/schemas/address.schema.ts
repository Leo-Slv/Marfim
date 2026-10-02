import { z } from 'zod';

/** Mirrors OrderCore's `CustomerAddressResponse`. */
const customerAddressSchema = z.object({
	id: z.string(),
	label: z.string(),
	recipientName: z.string(),
	phone: z.string().nullable(),
	street: z.string(),
	number: z.string(),
	complement: z.string().nullable(),
	neighborhood: z.string(),
	city: z.string(),
	state: z.string(),
	postalCode: z.string(),
	country: z.string(),
	isDefaultShipping: z.boolean(),
	isDefaultBilling: z.boolean(),
});

const customerAddressListSchema = z.array(customerAddressSchema);

export { customerAddressListSchema, customerAddressSchema };
