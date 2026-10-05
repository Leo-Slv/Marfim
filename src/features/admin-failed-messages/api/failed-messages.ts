import { apiFetch } from '@/lib/http/api-client';

import {
	failedMessageDetailsSchema,
	failedMessagePageSchema,
	type FailedMessageStatus,
} from '../schemas/failed-messages.schema';

async function listFailedMessages(
	status: FailedMessageStatus,
	page: number,
	pageSize: number,
) {
	const params = new URLSearchParams({
		Status: status,
		Page: String(page),
		PageSize: String(pageSize),
	});
	return failedMessagePageSchema.parse(
		await apiFetch(`/api/messaging/failed-messages?${params.toString()}`),
	);
}

function messagePath(id: string, action = '') {
	return `/api/messaging/failed-messages/${encodeURIComponent(id)}${action}`;
}

async function getFailedMessage(id: string) {
	return failedMessageDetailsSchema.parse(await apiFetch(messagePath(id)));
}

/** Back to its consumer's queue; it becomes `Replayed`. */
async function replayFailedMessage(id: string) {
	return failedMessageDetailsSchema.parse(
		await apiFetch(messagePath(id, '/replay'), { method: 'POST' }),
	);
}

/** Given up on for good; it becomes `Discarded` (and is audited). */
async function discardFailedMessage(id: string) {
	return failedMessageDetailsSchema.parse(
		await apiFetch(messagePath(id, '/discard'), { method: 'POST' }),
	);
}

export {
	discardFailedMessage,
	getFailedMessage,
	listFailedMessages,
	replayFailedMessage,
};
