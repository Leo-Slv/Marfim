'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { Category } from '@/features/catalog/model/category';
import { queryKeys } from '@/lib/constants/query-keys';

import { countCategoryProducts, createCategory } from '../api/admin-categories';

/** `{ [categoryId]: products }` — one call per category (pendency #5). */
function useCategoryCounts(categories: readonly Category[] | undefined) {
	const ids = (categories ?? []).map((category) => category.id);
	return useQuery({
		queryKey: queryKeys.admin.categoryCounts(ids),
		queryFn: async () => {
			const counts = await Promise.all(ids.map(countCategoryProducts));
			return Object.fromEntries(ids.map((id, index) => [id, counts[index]]));
		},
		enabled: ids.length > 0,
	});
}

/** A new category is in the store menu at once: refresh it everywhere. */
function useCreateCategory() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (name: string) => createCategory(name),
		onSettled: () =>
			queryClient.invalidateQueries({ queryKey: queryKeys.catalog.categories }),
	});
}

export { useCategoryCounts, useCreateCategory };
