'use client';

import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/lib/constants/query-keys';

import { getProducts, type GetProductsParams } from '../api/get-products';

function useProducts({ page, pageSize }: GetProductsParams) {
	return useQuery({
		queryKey: queryKeys.catalog.products(page, pageSize),
		queryFn: () => getProducts({ page, pageSize }),
	});
}

export { useProducts };
