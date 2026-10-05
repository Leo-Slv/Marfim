import { z } from 'zod';

import { apiFetch } from '@/lib/http/api-client';

import { auditLogPageSchema } from '../schemas/admin-audit.schema';

type AuditFilter = {
	entityName: string | null;
	entityId: string | null;
	userId: string | null;
	action?: string;
	page: number;
	pageSize: number;
};

async function listAuditLogs(filter: AuditFilter) {
	const params = new URLSearchParams({
		Page: String(filter.page),
		PageSize: String(filter.pageSize),
	});
	if (filter.entityName) {
		params.set('EntityName', filter.entityName);
	}
	if (filter.entityId) {
		params.set('EntityId', filter.entityId);
	}
	if (filter.userId) {
		params.set('UserId', filter.userId);
	}
	if (filter.action) {
		params.set('Action', filter.action);
	}
	return auditLogPageSchema.parse(
		await apiFetch(`/api/audit-logs?${params.toString()}`),
	);
}

/**
 * Who a user is: their `UserAccountCreated` record has the role and, for
 * shoppers, the customer id (admin audit pendency #2).
 */
async function getAccountOrigin(userId: string) {
	const page = await listAuditLogs({
		entityName: null,
		entityId: null,
		userId,
		action: 'UserAccountCreated',
		page: 1,
		pageSize: 1,
	});
	const metadata = page.items[0]?.metadata ?? {};
	return {
		role: metadata.role ?? null,
		customerId: metadata.customerId ?? null,
	};
}

const customerNameSchema = z.object({ name: z.string() });

async function getCustomerName(customerId: string) {
	return customerNameSchema.parse(
		await apiFetch(`/api/customers/${encodeURIComponent(customerId)}`),
	).name;
}

export type { AuditFilter };
export { getAccountOrigin, getCustomerName, listAuditLogs };
