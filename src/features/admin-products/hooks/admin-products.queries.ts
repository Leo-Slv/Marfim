'use client';

import {
	keepPreviousData,
	useMutation,
	useQuery,
	useQueryClient,
} from '@tanstack/react-query';

import { queryKeys } from '@/lib/constants/query-keys';

import {
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
	type CreateProductInput,
} from '../api/admin-products';
import type { SaveStep } from '../lib/product-form';

const PAGE_SIZE = 20;

/** A save step that failed, after the ones before it went through. */
class SaveStepError extends Error {
	constructor(
		readonly step: SaveStep['kind'],
		readonly failure: unknown,
	) {
		super(`Saving the product failed at "${step}".`);
	}
}

function useAdminProducts(searchTerm: string, page: number) {
	return useQuery({
		queryKey: queryKeys.admin.products(searchTerm, page),
		queryFn: () => listAdminProducts({ searchTerm, page, pageSize: PAGE_SIZE }),
		placeholderData: keepPreviousData,
	});
}

function useAdminProduct(productId: string | null) {
	return useQuery({
		queryKey: queryKeys.admin.product(productId ?? ''),
		queryFn: () => getAdminProduct(productId ?? ''),
		enabled: productId !== null,
		// The editor resets on new data: only our own saves may refresh it,
		// never a background refetch in the middle of an edit.
		staleTime: Infinity,
		refetchOnWindowFocus: false,
	});
}

/** A product change shows up in the list, the detail, menu and dashboard. */
function useRefreshProducts() {
	const queryClient = useQueryClient();
	return () =>
		Promise.all([
			queryClient.invalidateQueries({
				queryKey: queryKeys.admin.productsRoot,
			}),
			queryClient.invalidateQueries({ queryKey: queryKeys.admin.counts }),
			queryClient.invalidateQueries({ queryKey: queryKeys.admin.lowStock }),
		]);
}

function useCreateProduct() {
	const refresh = useRefreshProducts();
	return useMutation({
		mutationFn: (input: CreateProductInput) => createProduct(input),
		onSettled: refresh,
	});
}

async function runStep(productId: string, step: SaveStep) {
	switch (step.kind) {
		case 'details':
			return updateProductDetails(productId, step.details);
		case 'clearCompareAt':
			return setCompareAtPrice(productId, null);
		case 'price':
			return changeProductPrice(productId, step.price);
		case 'compareAt':
			return setCompareAtPrice(productId, step.compareAt);
		case 'variant':
			return addVariant(productId, { sku: step.sku, name: step.name });
	}
}

function useProductActions(productId: string) {
	const refresh = useRefreshProducts();
	const settle = { onSettled: refresh };
	return {
		/** Runs the save plan in order; stops at the first failure. */
		save: useMutation({
			mutationFn: async (steps: SaveStep[]) => {
				for (const step of steps) {
					try {
						await runStep(productId, step);
					} catch (error) {
						throw new SaveStepError(step.kind, error);
					}
				}
			},
			...settle,
		}),
		publish: useMutation({
			mutationFn: () => publishProduct(productId),
			...settle,
		}),
		discontinue: useMutation({
			mutationFn: () => discontinueProduct(productId),
			...settle,
		}),
		removeVariant: useMutation({
			mutationFn: (variantId: string) => removeVariant(productId, variantId),
			...settle,
		}),
	};
}

export {
	PAGE_SIZE,
	SaveStepError,
	useAdminProduct,
	useAdminProducts,
	useCreateProduct,
	useProductActions,
};
