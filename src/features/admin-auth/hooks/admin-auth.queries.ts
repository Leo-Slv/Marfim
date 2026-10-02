'use client';

import { useMutation } from '@tanstack/react-query';

import { signInAdmin } from '@/lib/auth/session-client';

function useAdminSignIn() {
	return useMutation({ mutationFn: signInAdmin });
}

export { useAdminSignIn };
