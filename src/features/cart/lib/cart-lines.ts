import type { CartLine } from '../model/cart';

/** Adds the item as a new line, or bumps the quantity of its existing line. */
function addCartLine(
	lines: readonly CartLine[],
	item: Omit<CartLine, 'quantity'>,
	quantity = 1,
): CartLine[] {
	const existing = lines.find((line) => line.productId === item.productId);
	if (!existing) {
		return [...lines, { ...item, quantity }];
	}

	return lines.map((line) =>
		line.productId === item.productId
			? { ...line, quantity: line.quantity + quantity }
			: line,
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
	parseCartLines,
};
