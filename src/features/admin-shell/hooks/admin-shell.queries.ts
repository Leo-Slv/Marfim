'use client';

import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/lib/constants/query-keys';

import { getAdminCounts } from '../api/admin-counts';

function useAdminCounts() {
	return useQuery({
		queryKey: queryKeys.admin.counts,
		queryFn: getAdminCounts,
		refetchInterval: 30_000,
	});
}

export { useAdminCounts };
