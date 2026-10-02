'use client';

import { useSyncExternalStore } from 'react';

import { cartSubtotal, countCartItems } from '../lib/cart-lines';
import {
	addToCart,
	clearCart,
	getCartSnapshot,
	getServerCartSnapshot,
	removeFromCart,
	repriceCartItem,
	setCartQuantity,
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
		setQuantity: setCartQuantity,
		removeItem: removeFromCart,
		repriceItem: repriceCartItem,
		clear: clearCart,
	};
}

export { useCart };
