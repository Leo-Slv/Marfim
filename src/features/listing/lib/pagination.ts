/** `?pagina=` → a page number ≥ 1 (anything invalid is page 1). */
function parsePage(param: string | null) {
	const page = Number(param);
	return Number.isInteger(page) && page >= 1 ? page : 1;
}

function pageNumbers(totalPages: number) {
	return Array.from({ length: Math.max(0, totalPages) }, (_, i) => i + 1);
}

/** "1–8 DE 14". */
function formatRange(page: number, pageSize: number, totalItems: number) {
	const start = (page - 1) * pageSize + 1;
	const end = Math.min(page * pageSize, totalItems);
	return `${start}–${end} DE ${totalItems}`;
}

/** One page of a list the front filtered itself, shaped like `PagedResponse<T>`. */
function paginate<T>(items: readonly T[], page: number, pageSize: number) {
	const start = (page - 1) * pageSize;
	return {
		items: items.slice(start, start + pageSize),
		page,
		pageSize,
		totalItems: items.length,
		totalPages: Math.ceil(items.length / pageSize),
	};
}

export { formatRange, pageNumbers, paginate, parsePage };
