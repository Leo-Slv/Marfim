'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/lib/constants/query-keys';

import { getCategories } from '../api/get-categories';
import { getProductBySlug } from '../api/get-product-by-slug';
import { getProducts, type GetProductsParams } from '../api/get-products';

function useProducts(
	params: GetProductsParams,
	options: { enabled?: boolean } = {},
) {
	return useQuery({
		queryKey: queryKeys.catalog.products(params),
		queryFn: () => getProducts(params),
		enabled: options.enabled ?? true,
		// Switching a filter keeps the previous page on screen instead of
		// flashing the loading state.
		placeholderData: keepPreviousData,
	});
}

function useProductBySlug(slug: string) {
	return useQuery({
		queryKey: queryKeys.catalog.product(slug),
		queryFn: () => getProductBySlug(slug),
	});
}

function useCategories() {
	return useQuery({
		queryKey: queryKeys.catalog.categories,
		queryFn: getCategories,
		staleTime: 5 * 60_000,
	});
}

export { useCategories, useProductBySlug, useProducts };
