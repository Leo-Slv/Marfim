'use client';

import { keepPreviousData, useQueries, useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/lib/constants/query-keys';

import {
	getAccountOrigin,
	getCustomerName,
	listAuditLogs,
} from '../api/admin-audit';
import type { EntityTab } from '../lib/audit';

const PAGE_SIZE = 25;

/**
 * The log page. A searched id is tried as an entity first, then as a user
 * (no free-text search — pendency #3).
 */
function useAuditLogs(
	tab: EntityTab,
	id: string | null,
	userId: string | null,
	page: number,
) {
	return useQuery({
		queryKey: queryKeys.admin.audit(tab.entityName, id, userId, page),
		queryFn: async () => {
			const filter = {
				entityName: tab.entityName,
				entityId: id,
				userId,
				page,
				pageSize: PAGE_SIZE,
			};
			const byEntity = await listAuditLogs(filter);
			if (id && byEntity.totalItems === 0 && !userId) {
				const byUser = await listAuditLogs({
					...filter,
					entityId: null,
					userId: id,
				});
				return { ...byUser, matchedAs: 'user' as const };
			}
			return { ...byEntity, matchedAs: id ? ('entity' as const) : null };
		},
		placeholderData: keepPreviousData,
	});
}

/** Role and customer name of each user on the page (pendency #2). */
function useAuditActors(userIds: readonly string[]) {
	const results = useQueries({
		queries: userIds.map((userId) => ({
			queryKey: queryKeys.admin.auditActor(userId),
			queryFn: async () => {
				const origin = await getAccountOrigin(userId);
				const customerName = origin.customerId
					? await getCustomerName(origin.customerId).catch(() => null)
					: null;
				return { role: origin.role, customerName };
			},
			staleTime: Infinity,
		})),
	});
	return Object.fromEntries(
		userIds.map((userId, index) => [userId, results[index]?.data]),
	);
}

export { PAGE_SIZE, useAuditActors, useAuditLogs };
