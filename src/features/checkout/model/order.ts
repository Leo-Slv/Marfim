import type { z } from 'zod';

import type {
	customerProfileSchema,
	orderSchema,
	orderStatusSchema,
	paymentMethodsSchema,
} from '../schemas/order.schema';

type Order = z.infer<typeof orderSchema>;
type OrderStatus = z.infer<typeof orderStatusSchema>;
type PaymentMethods = z.infer<typeof paymentMethodsSchema>;
type CustomerProfile = z.infer<typeof customerProfileSchema>;

/** Body of `POST /api/orders/checkout` (OrderCore's `CheckoutRequest`). */
type CheckoutRequest = {
	items: { productId: string; quantity: number }[];
	shippingAddressId: string;
	billingAddressId: string;
	paymentMethod: 'Card' | 'Pix';
	/** The total the shopper saw; a mismatch answers 409 `price_changed`. */
	expectedTotal: number;
};

export type {
	CheckoutRequest,
	CustomerProfile,
	Order,
	OrderStatus,
	PaymentMethods,
};
