/**
 * Central registry of React Query keys, grouped by feature.
 * Add one namespace per feature under src/features/<feature> as it's built
 * (see CLAUDE.md).
 */
const queryKeys = {
	catalog: {
		products: (page: number, pageSize: number) =>
			['catalog', 'products', page, pageSize] as const,
	},
} as const;

export { queryKeys };
