import type { CartLine } from '../model/cart';

/** Per-line cap, as in the Sacola mockup's stepper. */
const MAX_LINE_QUANTITY = 9;

/** Adds the item as a new line, or bumps the quantity of its existing line. */
function addCartLine(
	lines: readonly CartLine[],
	item: Omit<CartLine, 'quantity'>,
	quantity = 1,
): CartLine[] {
	const existing = lines.find((line) => line.productId === item.productId);
	if (!existing) {
		return [
			...lines,
			{ ...item, quantity: Math.min(MAX_LINE_QUANTITY, quantity) },
		];
	}

	return setCartLineQuantity(
		lines,
		item.productId,
		existing.quantity + quantity,
	);
}

/** Sets a line's quantity (capped at 9); 0 or less removes the line. */
function setCartLineQuantity(
	lines: readonly CartLine[],
	productId: string,
	quantity: number,
): CartLine[] {
	if (quantity <= 0) {
		return removeCartLine(lines, productId);
	}
	return lines.map((line) =>
		line.productId === productId
			? { ...line, quantity: Math.min(MAX_LINE_QUANTITY, quantity) }
			: line,
	);
}

function removeCartLine(
	lines: readonly CartLine[],
	productId: string,
): CartLine[] {
	return lines.filter((line) => line.productId !== productId);
}

/** Accepts a new price for a line (after the backend reports a change). */
function repriceCartLine(
	lines: readonly CartLine[],
	productId: string,
	unitPrice: number,
): CartLine[] {
	return lines.map((line) =>
		line.productId === productId ? { ...line, unitPrice } : line,
	);
}

function countCartItems(lines: readonly CartLine[]) {
	return lines.reduce((total, line) => total + line.quantity, 0);
}

function cartSubtotal(lines: readonly CartLine[]) {
	return lines.reduce(
		(total, line) => total + line.unitPrice * line.quantity,
		0,
	);
}

/** "1 item" / "3 itens". */
function formatItemCount(count: number) {
	return `${count} ${count === 1 ? 'item' : 'itens'}`;
}

function isCartLine(value: unknown): value is CartLine {
	if (typeof value !== 'object' || value === null) {
		return false;
	}
	const line = value as Record<string, unknown>;
	return (
		typeof line.productId === 'string' &&
		typeof line.slug === 'string' &&
		typeof line.name === 'string' &&
		typeof line.unitPrice === 'number' &&
		typeof line.quantity === 'number' &&
		line.quantity > 0
	);
}

/** Reads persisted lines defensively: anything malformed is dropped. */
function parseCartLines(raw: string | null): CartLine[] {
	if (!raw) {
		return [];
	}
	try {
		const parsed: unknown = JSON.parse(raw);
		return Array.isArray(parsed) ? parsed.filter(isCartLine) : [];
	} catch {
		return [];
	}
}

export {
	addCartLine,
	cartSubtotal,
	countCartItems,
	formatItemCount,
	MAX_LINE_QUANTITY,
	parseCartLines,
	removeCartLine,
	repriceCartLine,
	setCartLineQuantity,
};
