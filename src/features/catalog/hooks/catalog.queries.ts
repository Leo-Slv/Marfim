'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/lib/constants/query-keys';

import { getCategories } from '../api/get-categories';
import { getProductBySlug } from '../api/get-product-by-slug';
import { getProducts, type GetProductsParams } from '../api/get-products';
import type { ProductSortOrder } from '../model/product';

/** OrderCore's largest page (`ListProductsFilter.MaximumPageSize`). */
const CATALOG_PAGE_SIZE = 100;

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

/**
 * The whole catalog in one call (the demo has 8 products), for what OrderCore
 * can't filter itself: search by atelier/category and pieces by brand.
 */
function useCatalog(
	sort?: ProductSortOrder,
	options: { enabled?: boolean } = {},
) {
	return useProducts({ page: 1, pageSize: CATALOG_PAGE_SIZE, sort }, options);
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

export { useCatalog, useCategories, useProductBySlug, useProducts };
