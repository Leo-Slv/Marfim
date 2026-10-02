import { isOnSale } from '@/features/catalog/lib/is-on-sale';
import type { Category } from '@/features/catalog/model/category';
import type {
	ProductAvailability,
	ProductSummary,
} from '@/features/catalog/model/product';

import type { CartLine } from '../model/cart';
import type { CartLineIssue, CartQuote } from '../model/cart-quote';

type CartViewLine = {
	productId: string;
	slug: string;
	name: string;
	quantity: number;
	/** The backend's current price when quoted, else the stored one. */
	unitPrice: number;
	lineTotal: number;
	/** Compare-at total when the product is on sale. */
	oldLineTotal: number | null;
	brand: string | null;
	categoryName: string | null;
	availability: ProductAvailability | null;
	issue: CartLineIssue | null;
	previousUnitPrice: number | null;
};

type UnavailableLine = {
	productId: string;
	name: string;
	issue: 'NotFound' | 'Unavailable';
};

type CartView = {
	lines: CartViewLine[];
	unavailable: UnavailableLine[];
	pieceCount: number;
	/** Sum at list (compare-at) prices. */
	listSubtotal: number;
	/** listSubtotal − total, from compare-at prices. */
	savings: number;
	total: number;
};

/**
 * Joins the client bag with the backend quote (current prices, issues) and
 * the catalog (brand, category, compare-at price, stock state — the quote
 * doesn't carry them; cart pendency #2).
 */
function buildCartView({
	lines,
	quote,
	products,
	categories,
}: {
	lines: readonly CartLine[];
	quote: CartQuote | undefined;
	products: readonly ProductSummary[];
	categories: readonly Category[];
}): CartView {
	const quoteLines = new Map(
		(quote?.lines ?? []).map((line) => [line.productId, line]),
	);
	const productsById = new Map(
		products.map((product) => [product.id, product]),
	);
	const categoryNames = new Map(
		categories.map((category) => [category.id, category.name]),
	);

	const view: CartView = {
		lines: [],
		unavailable: [],
		pieceCount: 0,
		listSubtotal: 0,
		savings: 0,
		total: 0,
	};

	for (const line of lines) {
		const quoted = quoteLines.get(line.productId);
		const issue = quoted?.issue ?? null;
		const name = quoted?.productName ?? line.name;

		if (issue === 'NotFound' || issue === 'Unavailable') {
			view.unavailable.push({ productId: line.productId, name, issue });
			continue;
		}

		const product = productsById.get(line.productId);
		const unitPrice = quoted?.unitPrice ?? line.unitPrice;
		const compareAtPrice =
			product &&
			isOnSale({
				currentPrice: unitPrice,
				compareAtPrice: product.compareAtPrice,
			})
				? product.compareAtPrice
				: null;
		const lineTotal = unitPrice * line.quantity;
		const oldLineTotal =
			compareAtPrice !== null ? compareAtPrice * line.quantity : null;

		view.lines.push({
			productId: line.productId,
			slug: quoted?.slug ?? line.slug,
			name,
			quantity: line.quantity,
			unitPrice,
			lineTotal,
			oldLineTotal,
			brand: product?.brand ?? null,
			categoryName: product
				? (categoryNames.get(product.categoryId) ?? null)
				: null,
			availability: product?.availability ?? null,
			issue,
			previousUnitPrice: quoted?.previousUnitPrice ?? null,
		});
		// Same rule as OrderCore's quote total: a line without enough stock
		// stays visible but isn't counted until it's fixed.
		if (issue === 'InsufficientStock') {
			continue;
		}
		view.pieceCount += line.quantity;
		view.total += lineTotal;
		view.listSubtotal += oldLineTotal ?? lineTotal;
	}

	view.savings = view.listSubtotal - view.total;
	return view;
}

type CheckoutGate = { canCheckout: boolean; reason: string | null };

/** Whether "Continuar para entrega" is allowed, and why not. */
function checkoutGate({
	hasLines,
	quoteStatus,
	quoteIsValid,
}: {
	hasLines: boolean;
	quoteStatus: 'checking' | 'error' | 'ready';
	quoteIsValid: boolean;
}): CheckoutGate {
	if (!hasLines) {
		return { canCheckout: false, reason: null };
	}
	if (quoteStatus === 'checking') {
		return { canCheckout: false, reason: 'Conferindo preços e estoque…' };
	}
	if (quoteStatus === 'error') {
		return {
			canCheckout: false,
			reason: 'Não foi possível conferir a sacola agora. Tente novamente.',
		};
	}
	if (!quoteIsValid) {
		return {
			canCheckout: false,
			reason: 'Resolva os avisos da sacola para continuar.',
		};
	}
	return { canCheckout: true, reason: null };
}

/**
 * Up to `limit` in-stock products not in the bag: same categories as the
 * bag first (catalog order), then the rest (cart pendency #5).
 */
function pickRecommendations(
	products: readonly ProductSummary[],
	lines: readonly CartLine[],
	limit = 4,
): ProductSummary[] {
	const inBag = new Set(lines.map((line) => line.productId));
	const bagCategories = new Set(
		products
			.filter((product) => inBag.has(product.id))
			.map((product) => product.categoryId),
	);
	const candidates = products.filter(
		(product) =>
			!inBag.has(product.id) && product.availability !== 'OutOfStock',
	);
	const sameCategory = candidates.filter((product) =>
		bagCategories.has(product.categoryId),
	);
	const others = candidates.filter(
		(product) => !bagCategories.has(product.categoryId),
	);

	return [...sameCategory, ...others].slice(0, limit);
}

export type { CartView, CartViewLine, CheckoutGate, UnavailableLine };
export { buildCartView, checkoutGate, pickRecommendations };
