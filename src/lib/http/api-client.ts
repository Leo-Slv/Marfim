import { getAccessToken } from '@/lib/auth/access-token';
import { env } from '@/lib/env';

import { ApiError, type ApiErrorPayload } from './api-error';

type ApiFetchOptions = Omit<RequestInit, 'body'> & {
	body?: BodyInit | FormData | URLSearchParams | Record<string, unknown> | null;
	timeoutMs?: number;
};

function buildApiUrl(path: string) {
	const normalizedPath = path.startsWith('/') ? path : `/${path}`;
	return `${env.apiUrl.replace(/\/$/, '')}${normalizedPath}`;
}

function isPlainObjectBody(
	body: ApiFetchOptions['body'],
): body is Record<string, unknown> {
	return (
		body !== null &&
		body !== undefined &&
		!(body instanceof FormData) &&
		!(body instanceof URLSearchParams) &&
		typeof body !== 'string' &&
		!(body instanceof Blob) &&
		!(body instanceof ArrayBuffer)
	);
}

function isApiErrorPayload(payload: unknown): payload is ApiErrorPayload {
	return (
		typeof payload === 'object' &&
		payload !== null &&
		'status' in payload &&
		typeof payload.status === 'number'
	);
}

function toApiError(status: number, payload: unknown) {
	if (isApiErrorPayload(payload)) {
		const message =
			payload.detail ??
			payload.title ??
			`API request failed with status ${status}.`;

		return new ApiError(message, status, {
			title: payload.title,
			code: payload.code,
			fieldErrors: payload.errors,
			traceId: payload.traceId,
		});
	}

	return new ApiError(`API request failed with status ${status}.`, status);
}

async function parseResponseBody(response: Response) {
	if (response.status === 204) {
		return null;
	}

	// Covers both `application/json` and ProblemDetails'
	// `application/problem+json`.
	const contentType = response.headers.get('content-type') ?? '';
	if (!contentType.includes('json')) {
		return null;
	}

	return (await response.json()) as unknown;
}

/**
 * The OrderCore API returns success responses as the raw DTO (no
 * envelope) and errors as RFC 7807 ProblemDetails with a stable `code`
 * extension (see Shared/Presentation/ExceptionHandling/ApiExceptionHandler.cs
 * in the backend repo).
 */
async function apiFetch<TData>(path: string, options: ApiFetchOptions = {}) {
	const headers = new Headers(options.headers);
	headers.set('Accept', 'application/json');
	const accessToken = getAccessToken();
	if (accessToken && !headers.has('Authorization')) {
		headers.set('Authorization', `Bearer ${accessToken}`);
	}
	const controller = new AbortController();
	const timeoutMs = options.timeoutMs ?? 30_000;
	const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

	let body: BodyInit | null | undefined;

	if (isPlainObjectBody(options.body)) {
		headers.set('Content-Type', 'application/json');
		body = JSON.stringify(options.body);
	} else {
		body = options.body as BodyInit | null | undefined;
	}

	try {
		const response = await fetch(buildApiUrl(path), {
			...options,
			body,
			cache: options.cache ?? 'no-store',
			credentials: options.credentials ?? 'include',
			headers,
			signal: options.signal ?? controller.signal,
		});

		const payload = await parseResponseBody(response);

		if (!response.ok) {
			throw toApiError(response.status, payload);
		}

		return payload as TData;
	} catch (error) {
		if (error instanceof DOMException && error.name === 'AbortError') {
			throw new ApiError('The request timed out.', 408);
		}

		if (error instanceof TypeError) {
			throw new ApiError('Could not reach the API.', 503);
		}

		throw error;
	} finally {
		clearTimeout(timeoutId);
	}
}

export { apiFetch, buildApiUrl };
