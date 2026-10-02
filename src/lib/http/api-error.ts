/**
 * RFC 7807 ProblemDetails as written by OrderCore's ApiExceptionHandler /
 * ProblemDetailsDefaults: every error carries a stable `code` extension
 * the client branches on (e.g. `validation_error`, `not_found`).
 */
type ApiErrorPayload = {
	type?: string;
	title?: string;
	status: number;
	detail?: string | null;
	instance?: string;
	code?: string;
	traceId?: string;
	errors?: Record<string, readonly string[]>;
};

class ApiError extends Error {
	readonly status: number;
	readonly title: string;
	readonly code: string | null;
	readonly fieldErrors: Record<string, readonly string[]>;
	readonly traceId: string | null;
	/** From a 429's `Retry-After`, when the header is readable. */
	readonly retryAfterSeconds: number | null;

	constructor(
		message: string,
		status: number,
		options?: {
			title?: string;
			code?: string | null;
			fieldErrors?: Record<string, readonly string[]>;
			traceId?: string | null;
			retryAfterSeconds?: number | null;
		},
	) {
		super(message);
		this.name = 'ApiError';
		this.status = status;
		this.title = options?.title ?? 'Error';
		this.code = options?.code ?? null;
		this.fieldErrors = options?.fieldErrors ?? {};
		this.traceId = options?.traceId ?? null;
		this.retryAfterSeconds = options?.retryAfterSeconds ?? null;
	}
}

function isApiError(error: unknown): error is ApiError {
	return error instanceof ApiError;
}

function isApiErrorPayload(payload: unknown): payload is ApiErrorPayload {
	return (
		typeof payload === 'object' &&
		payload !== null &&
		'status' in payload &&
		typeof payload.status === 'number'
	);
}

/** Parses a JSON body (incl. `application/problem+json`); null otherwise. */
async function parseResponseBody(response: Response) {
	if (response.status === 204) {
		return null;
	}

	const contentType = response.headers.get('content-type') ?? '';
	if (!contentType.includes('json')) {
		return null;
	}

	return (await response.json()) as unknown;
}

function parseRetryAfter(value: string | null) {
	const seconds = Number(value);
	return value !== null && Number.isFinite(seconds) && seconds >= 0
		? Math.ceil(seconds)
		: null;
}

function toApiError(response: Response, payload: unknown) {
	const retryAfterSeconds = parseRetryAfter(
		response.headers.get('retry-after'),
	);

	if (isApiErrorPayload(payload)) {
		const message =
			payload.detail ??
			payload.title ??
			`API request failed with status ${response.status}.`;

		return new ApiError(message, response.status, {
			title: payload.title,
			code: payload.code,
			fieldErrors: payload.errors,
			traceId: payload.traceId,
			retryAfterSeconds,
		});
	}

	return new ApiError(
		`API request failed with status ${response.status}.`,
		response.status,
		{ retryAfterSeconds },
	);
}

export type { ApiErrorPayload };
export { ApiError, isApiError, parseResponseBody, parseRetryAfter, toApiError };
