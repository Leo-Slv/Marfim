import { apiFetch } from '@/lib/http/api-client';

import {
	adminProductRowsSchema,
	adminProductSchema,
} from '../schemas/admin-products.schema';

function productPath(productId: string, action = '') {
	return `/api/catalog/products/${encodeURIComponent(productId)}${action}`;
}

async function listAdminProducts(filter: {
	searchTerm: string;
	page: number;
	pageSize: number;
}) {
	const params = new URLSearchParams({
		Page: String(filter.page),
		PageSize: String(filter.pageSize),
	});
	if (filter.searchTerm) {
		params.set('SearchTerm', filter.searchTerm);
	}
	return adminProductRowsSchema.parse(
		await apiFetch(`/api/admin/catalog/products?${params.toString()}`),
	);
}

async function getAdminProduct(productId: string) {
	return adminProductSchema.parse(await apiFetch(productPath(productId)));
}

type CreateProductInput = {
	sku: string;
	name: string;
	categoryId: string;
	currentPrice: number;
};

/** Created as a draft; OrderCore makes the slug from the name. */
async function createProduct(input: CreateProductInput) {
	return adminProductSchema.parse(
		await apiFetch('/api/catalog/products', {
			method: 'POST',
			body: { ...input, currency: 'BRL' },
		}),
	);
}

async function updateProductDetails(
	productId: string,
	details: {
		name: string;
		shortDescription: string | null;
		description: string | null;
		brand: string | null;
	},
) {
	return adminProductSchema.parse(
		await apiFetch(productPath(productId), { method: 'PUT', body: details }),
	);
}

async function changeProductPrice(productId: string, newPrice: number) {
	return adminProductSchema.parse(
		await apiFetch(productPath(productId, '/price'), {
			method: 'PUT',
			body: { newPrice },
		}),
	);
}

/** Null ends the promotion; otherwise it must be above the current price. */
async function setCompareAtPrice(
	productId: string,
	compareAtPrice: number | null,
) {
	return adminProductSchema.parse(
		await apiFetch(productPath(productId, '/compare-at-price'), {
			method: 'PUT',
			body: { compareAtPrice },
		}),
	);
}

async function publishProduct(productId: string) {
	await apiFetch(productPath(productId, '/publish'), { method: 'POST' });
}

async function discontinueProduct(productId: string) {
	return adminProductSchema.parse(
		await apiFetch(productPath(productId, '/discontinue'), { method: 'POST' }),
	);
}

async function addVariant(
	productId: string,
	variant: { sku: string; name: string },
) {
	return adminProductSchema.parse(
		await apiFetch(productPath(productId, '/variants'), {
			method: 'POST',
			body: { ...variant, attributes: {}, additionalPrice: 0 },
		}),
	);
}

async function removeVariant(productId: string, variantId: string) {
	return adminProductSchema.parse(
		await apiFetch(
			productPath(productId, `/variants/${encodeURIComponent(variantId)}`),
			{ method: 'DELETE' },
		),
	);
}

export type { CreateProductInput };
export {
	addVariant,
	changeProductPrice,
	createProduct,
	discontinueProduct,
	getAdminProduct,
	listAdminProducts,
	publishProduct,
	removeVariant,
	setCompareAtPrice,
	updateProductDetails,
};
