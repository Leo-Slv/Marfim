/**
 * Central registry of React Query keys, grouped by feature.
 * Add one namespace per feature under src/features/<feature> as it's built
 * (see CLAUDE.md).
 */
const queryKeys = {
	catalog: {
		products: (params: {
			page: number;
			pageSize: number;
			categoryId?: string;
			sort?: string;
			searchTerm?: string;
			onSale?: boolean;
		}) =>
			[
				'catalog',
				'products',
				params.page,
				params.pageSize,
				params.categoryId ?? 'all',
				params.sort ?? 'default',
				params.searchTerm ?? '',
				params.onSale ?? false,
			] as const,
		product: (slug: string) => ['catalog', 'product', slug] as const,
		categories: ['catalog', 'categories'] as const,
	},
} as const;

export { queryKeys };
