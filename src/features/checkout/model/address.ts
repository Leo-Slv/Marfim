import type { z } from 'zod';

import type { customerAddressSchema } from '../schemas/address.schema';

type CustomerAddress = z.infer<typeof customerAddressSchema>;

/** Body of `POST customers/me/addresses` (OrderCore's `CustomerAddressRequest`). */
type CustomerAddressRequest = Omit<
	CustomerAddress,
	'id' | 'isDefaultShipping' | 'isDefaultBilling'
>;

export type { CustomerAddress, CustomerAddressRequest };
