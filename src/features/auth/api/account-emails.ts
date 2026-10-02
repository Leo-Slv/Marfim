import { apiFetch } from '@/lib/http/api-client';

/**
 * OrderCore's anonymous account-e-mail endpoints, called straight from the
 * browser (no tokens involved). Sign-in/up/refresh/out go through the
 * session BFF instead (`src/lib/auth/session-client.ts`).
 */

/** Always 202, whether the address has an account or not. */
async function requestPasswordReset(email: string) {
	await apiFetch<null>('/api/auth/password/forgot', {
		method: 'POST',
		body: { email },
	});
}

/** 204; every session of the account ends. */
async function resetPassword(token: string, newPassword: string) {
	await apiFetch<null>('/api/auth/password/reset', {
		method: 'POST',
		body: { token, newPassword },
	});
}

/** 204; refresh the session afterwards so the token says `email_confirmed`. */
async function confirmEmail(token: string) {
	await apiFetch<null>('/api/auth/email/confirm', {
		method: 'POST',
		body: { token },
	});
}

/** Signed-in customers only; 202, or 409 `email_already_confirmed`. */
async function requestEmailConfirmation() {
	await apiFetch<null>('/api/auth/email/confirmation', { method: 'POST' });
}

export {
	confirmEmail,
	requestEmailConfirmation,
	requestPasswordReset,
	resetPassword,
};
