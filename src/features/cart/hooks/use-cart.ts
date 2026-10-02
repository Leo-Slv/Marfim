'use client';

import { useSyncExternalStore } from 'react';

import { cartSubtotal, countCartItems } from '../lib/cart-lines';
import {
	addToCart,
	getCartSnapshot,
	getServerCartSnapshot,
	subscribeToCart,
} from '../lib/cart-store';

function useCart() {
	const lines = useSyncExternalStore(
		subscribeToCart,
		getCartSnapshot,
		getServerCartSnapshot,
	);

	return {
		lines,
		count: countCartItems(lines),
		subtotal: cartSubtotal(lines),
		addItem: addToCart,
	};
}

export { useCart };
