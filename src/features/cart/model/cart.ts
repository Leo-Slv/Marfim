/**
 * One cart line. The cart lives on the client (OrderCore only re-prices it
 * via `POST /api/orders/cart/quote`); `name` and `unitPrice` are what the
 * shopper saw when adding, for display only — never trusted for checkout.
 */
type CartLine = {
	productId: string;
	slug: string;
	name: string;
	unitPrice: number;
	quantity: number;
};

export type { CartLine };
