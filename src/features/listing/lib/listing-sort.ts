import type { ProductSortOrder } from '@/features/catalog/model/product';

/** `?ordem=` values, their labels and OrderCore's `ProductSortOrder`. */
const sortOptions = [
	// No editorial order exists in OrderCore (pendency #4): newest first.
	{ value: 'recentes', label: 'Mais recentes', apiSort: 'Newest' },
	{ value: 'nome', label: 'Nome (A–Z)', apiSort: 'Name' },
	{ value: 'menor-preco', label: 'Menor preço', apiSort: 'PriceAsc' },
	{ value: 'maior-preco', label: 'Maior preço', apiSort: 'PriceDesc' },
] as const satisfies readonly {
	value: string;
	label: string;
	apiSort: ProductSortOrder;
}[];

type SortOption = (typeof sortOptions)[number];

const DEFAULT_SORT: SortOption = sortOptions[0];

/** Unknown or missing values fall back to "Mais recentes". */
function parseSort(param: string | null): SortOption {
	return sortOptions.find((option) => option.value === param) ?? DEFAULT_SORT;
}

export type { SortOption };
export { DEFAULT_SORT, parseSort, sortOptions };
