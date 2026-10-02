import { isApiError } from '@/lib/http/api-error';

/** The error screens of Erro.dc.html, plus 403 and "sem conexão". */
type ErrorKind =
	| 'not-found'
	| 'forbidden'
	| 'server'
	| 'offline'
	| 'rate-limited'
	| 'session-expired';

/** Which error screen an error gets; anything unrecognised is a 500. */
function errorKindOf(error: unknown): ErrorKind {
	if (!isApiError(error)) {
		return 'server';
	}
	if (error.status === 404 || error.code === 'not_found') {
		return 'not-found';
	}
	if (error.status === 403 || error.code === 'forbidden') {
		return 'forbidden';
	}
	if (error.status === 429) {
		return 'rate-limited';
	}
	if (error.status === 401) {
		return 'session-expired';
	}
	// `apiFetch` throws 408 on a timeout and a 503 without a ProblemDetails
	// code when the API can't be reached; OrderCore's own 5xx carry a code.
	if (error.status === 408 || (error.status === 503 && error.code === null)) {
		return 'offline';
	}
	return 'server';
}

/**
 * The code the support team can look up: OrderCore's `traceId` (what its
 * logs are searched by), else Next's digest of a server render error.
 */
function errorTraceCode(error: unknown): string | null {
	if (isApiError(error)) {
		return error.traceId;
	}
	if (
		error instanceof Error &&
		'digest' in error &&
		typeof error.digest === 'string'
	) {
		return error.digest;
	}
	return null;
}

function errorRetryAfter(error: unknown): number | null {
	return isApiError(error) ? error.retryAfterSeconds : null;
}

export type { ErrorKind };
export { errorKindOf, errorRetryAfter, errorTraceCode };
