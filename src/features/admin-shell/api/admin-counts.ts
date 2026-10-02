import { z } from 'zod';

import { apiFetch } from '@/lib/http/api-client';

/** Only the total of a `PagedResponse<T>` — the counters need nothing else. */
const totalSchema = z.object({ totalItems: z.number() });

async function countOf(path: string) {
	return totalSchema.parse(await apiFetch(path)).totalItems;
}

/** The side menu's live counters (AdminNav.dc.html badges). */
async function getAdminCounts() {
	const [toPrepare, lowStock, outOfStock, failedMessages] = await Promise.all([
		countOf('/api/admin/orders?Status=Confirmed&PageSize=1'),
		countOf('/api/admin/catalog/products?Stock=LowStock&PageSize=1'),
		countOf('/api/admin/catalog/products?Stock=OutOfStock&PageSize=1'),
		countOf('/api/messaging/failed-messages?Status=Pending&PageSize=1'),
	]);
	return {
		toPrepare,
		stockAlerts: lowStock + outOfStock,
		failedMessages,
	};
}

export { getAdminCounts };
