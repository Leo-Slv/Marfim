'use client';

import {
	errorKindOf,
	errorRetryAfter,
	errorTraceCode,
} from '../lib/error-kind';

import { ErrorState } from './error-state';

/**
 * The full error screen for a page's main query that failed without data
 * (Docs/specs/storefront/error-states.md): 404, 403, 429, sem conexão or
 * 500 by error. Key it by the query's `errorUpdatedAt` so a new failure
 * restarts the 429 countdown.
 */
function QueryErrorState({
	error,
	onRetry,
}: {
	error: unknown;
	onRetry: () => void;
}) {
	return (
		<ErrorState
			kind={errorKindOf(error)}
			traceCode={errorTraceCode(error)}
			retryAfterSeconds={errorRetryAfter(error)}
			onRetry={onRetry}
		/>
	);
}

export { QueryErrorState };
