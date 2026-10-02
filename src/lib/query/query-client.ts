import { QueryClient } from '@tanstack/react-query';

import { isApiError } from '@/lib/http/api-error';

/**
 * One retry for failures that may be transient (5xx, network, timeout).
 * A 4xx won't change by asking again — a 404 or 403 shows its error
 * screen right away, and retrying a 429 only extends the wait.
 */
function shouldRetry(failureCount: number, error: unknown) {
	if (failureCount >= 1) {
		return false;
	}
	return !(
		isApiError(error) &&
		error.status >= 400 &&
		error.status < 500 &&
		error.status !== 408
	);
}

function createQueryClient() {
	return new QueryClient({
		defaultOptions: {
			queries: {
				staleTime: 30_000,
				retry: shouldRetry,
			},
		},
	});
}

export { createQueryClient, shouldRetry };
