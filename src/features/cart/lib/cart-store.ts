import type { CartLine } from '../model/cart';
import { addCartLine, parseCartLines } from './cart-lines';

/**
 * Minimal client-side cart store, persisted in localStorage and read through
 * `useSyncExternalStore` (see `hooks/use-cart.ts`). It's the app's first
 * cross-tree client state (header count ↔ product cards) and deliberately
 * not a state library — see CLAUDE.md.
 */
const CART_STORAGE_KEY = 'marfim.cart';
const EMPTY_CART: readonly CartLine[] = [];

let cachedLines: readonly CartLine[] | null = null;
const listeners = new Set<() => void>();

function canUseWebStorage() {
	return (
		typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
	);
}

function readLines(): readonly CartLine[] {
	if (!canUseWebStorage()) {
		return EMPTY_CART;
	}
	return parseCartLines(window.localStorage.getItem(CART_STORAGE_KEY));
}

function emit() {
	listeners.forEach((listener) => listener());
}

function handleStorage(event: StorageEvent) {
	if (event.key === CART_STORAGE_KEY) {
		cachedLines = readLines();
		emit();
	}
}

function subscribeToCart(listener: () => void) {
	listeners.add(listener);
	if (listeners.size === 1 && typeof window !== 'undefined') {
		// Keeps other tabs' bags in sync.
		window.addEventListener('storage', handleStorage);
	}
	return () => {
		listeners.delete(listener);
		if (listeners.size === 0 && typeof window !== 'undefined') {
			window.removeEventListener('storage', handleStorage);
		}
	};
}

/** Cached so `useSyncExternalStore` sees a stable reference between changes. */
function getCartSnapshot() {
	cachedLines ??= readLines();
	return cachedLines;
}

function getServerCartSnapshot() {
	return EMPTY_CART;
}

function addToCart(item: Omit<CartLine, 'quantity'>, quantity = 1) {
	const next = addCartLine(getCartSnapshot(), item, quantity);
	cachedLines = next;
	if (canUseWebStorage()) {
		window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(next));
	}
	emit();
}

export { addToCart, getCartSnapshot, getServerCartSnapshot, subscribeToCart };
