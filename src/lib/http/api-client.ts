import {
	getValidAccessToken,
	hasSession,
	refreshSession,
} from '@/lib/auth/session-client';
import { env } from '@/lib/env';

import { ApiError, parseResponseBody, toApiError } from './api-error';

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

/**
 * The OrderCore API returns success responses as the raw DTO (no
 * envelope) and errors as RFC 7807 ProblemDetails with a stable `code`
 * extension (see Shared/Presentation/ExceptionHandling/ApiExceptionHandler.cs
 * in the backend repo).
 *
 * With a session, the bearer token is renewed before it expires and, if the
 * API still answers 401, renewed once more and the request retried.
 */
async function apiFetch<TData>(
	path: string,
	options: ApiFetchOptions = {},
): Promise<TData> {
	const response = await send(path, options, await getValidAccessToken());

	if (response.status === 401 && hasSession()) {
		const renewed = await refreshSession();
		if (renewed) {
			return read<TData>(await send(path, options, renewed.accessToken));
		}
	}

	return read<TData>(response);
}

async function send(
	path: string,
	options: ApiFetchOptions,
	accessToken: string | null,
) {
	const headers = new Headers(options.headers);
	headers.set('Accept', 'application/json');
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
		return await fetch(buildApiUrl(path), {
			...options,
			body,
			cache: options.cache ?? 'no-store',
			credentials: options.credentials ?? 'include',
			headers,
			signal: options.signal ?? controller.signal,
		});
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

async function read<TData>(response: Response) {
	const payload = await parseResponseBody(response);

	if (!response.ok) {
		throw toApiError(response, payload);
	}

	return payload as TData;
}

export { apiFetch, buildApiUrl };
