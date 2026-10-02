'use client';

import { useMutation, useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/lib/constants/query-keys';
import { refreshSession, signIn, signUp } from '@/lib/auth/session-client';
import { getSessionSnapshot } from '@/lib/auth/session-store';

import {
	confirmEmail,
	requestEmailConfirmation,
	requestPasswordReset,
	resetPassword,
} from '../api/account-emails';
import { hasErrorCode } from '../lib/auth-messages';

function useSignIn() {
	return useMutation({ mutationFn: signIn });
}

function useSignUp() {
	return useMutation({ mutationFn: signUp });
}

function useRequestPasswordReset() {
	return useMutation({ mutationFn: requestPasswordReset });
}

function useResetPassword() {
	return useMutation({
		mutationFn: ({ token, password }: { token: string; password: string }) =>
			resetPassword(token, password),
	});
}

/**
 * Resends the confirmation link. When the backend says the e-mail is
 * already confirmed, the session is refreshed so its token says so too.
 */
function useRequestEmailConfirmation() {
	return useMutation({
		mutationFn: requestEmailConfirmation,
		onError: (error) => {
			if (hasErrorCode(error, 'email_already_confirmed')) {
				void refreshSession();
			}
		},
	});
}

/**
 * Confirms the e-mail with the link's token — a query rather than a
 * mutation so it runs once per token even when React mounts twice in
 * development (the token is single-use). A signed-in shopper's session is
 * refreshed afterwards so checkout sees `email_confirmed`.
 */
function useConfirmEmail(token: string) {
	return useQuery({
		queryKey: queryKeys.auth.confirmEmail(token),
		queryFn: async () => {
			await confirmEmail(token);
			if (getSessionSnapshot()) {
				await refreshSession();
			}
			return true;
		},
		retry: false,
		staleTime: Infinity,
		gcTime: Infinity,
		refetchOnWindowFocus: false,
	});
}

export {
	useConfirmEmail,
	useRequestEmailConfirmation,
	useRequestPasswordReset,
	useResetPassword,
	useSignIn,
	useSignUp,
};
