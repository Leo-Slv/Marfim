'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/lib/constants/query-keys';

import {
	discardFailedMessage,
	getFailedMessage,
	listFailedMessages,
	replayFailedMessage,
} from '../api/failed-messages';
import { failureTabs, type FailureTab } from '../lib/failed-messages';

const LIVE_MS = 30_000;
const PAGE_SIZE = 50;

function useFailedMessages(tab: FailureTab) {
	return useQuery({
		queryKey: queryKeys.admin.failedMessages(tab.status),
		queryFn: () => listFailedMessages(tab.status, 1, PAGE_SIZE),
		refetchInterval: LIVE_MS,
	});
}

function useFailedMessageCounts() {
	return useQuery({
		queryKey: queryKeys.admin.failedMessageCounts,
		queryFn: async () => {
			const pages = await Promise.all(
				failureTabs.map((tab) => listFailedMessages(tab.status, 1, 1)),
			);
			return Object.fromEntries(
				failureTabs.map((tab, index) => [tab.id, pages[index].totalItems]),
			) as Record<string, number>;
		},
		refetchInterval: LIVE_MS,
	});
}

/** The envelope, loaded when the card is opened. */
function useFailedMessageDetails(id: string, enabled: boolean) {
	return useQuery({
		queryKey: queryKeys.admin.failedMessage(id),
		queryFn: () => getFailedMessage(id),
		enabled,
		staleTime: Infinity,
	});
}

/** Lists, counts and the menu badge follow every action. */
function useRefreshFailures() {
	const queryClient = useQueryClient();
	return () =>
		Promise.all([
			queryClient.invalidateQueries({
				queryKey: queryKeys.admin.failedMessagesRoot,
			}),
			queryClient.invalidateQueries({ queryKey: queryKeys.admin.counts }),
		]);
}

function useFailureActions() {
	const refresh = useRefreshFailures();
	return {
		replay: useMutation({
			mutationFn: (id: string) => replayFailedMessage(id),
			onSettled: refresh,
		}),
		discard: useMutation({
			mutationFn: (id: string) => discardFailedMessage(id),
			onSettled: refresh,
		}),
		/** No bulk endpoint (pendency #1): one by one, counting failures. */
		replayAll: useMutation({
			mutationFn: async (ids: readonly string[]) => {
				let failed = 0;
				for (const id of ids) {
					await replayFailedMessage(id).catch(() => {
						failed++;
					});
				}
				return { replayed: ids.length - failed, failed };
			},
			onSettled: refresh,
		}),
	};
}

export {
	useFailedMessageCounts,
	useFailedMessageDetails,
	useFailedMessages,
	useFailureActions,
};
