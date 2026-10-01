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

	constructor(
		message: string,
		status: number,
		options?: {
			title?: string;
			code?: string | null;
			fieldErrors?: Record<string, readonly string[]>;
			traceId?: string | null;
		},
	) {
		super(message);
		this.name = 'ApiError';
		this.status = status;
		this.title = options?.title ?? 'Error';
		this.code = options?.code ?? null;
		this.fieldErrors = options?.fieldErrors ?? {};
		this.traceId = options?.traceId ?? null;
	}
}

function isApiError(error: unknown): error is ApiError {
	return error instanceof ApiError;
}

export type { ApiErrorPayload };
export { ApiError, isApiError };
