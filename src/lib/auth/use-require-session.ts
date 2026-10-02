'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

import { useIsHydrated } from '@/lib/hooks/use-is-hydrated';
import { appRoutes } from '@/lib/routes/app-routes';

import { wasSessionExpired } from './session-store';
import { useSession } from './use-session';

/**
 * Client-side gate for screens that need a signed-in shopper: once the
 * session has been read, a signed-out visitor goes to Entrar and comes back
 * to this exact URL afterwards. When the session ended because the backend
 * refused to renew it, there's no redirect: `expired` is true and the
 * screen shows "Sessão expirada" (Docs/specs/storefront/error-states.md).
 * `session` is null while redirecting or before hydration. The backend
 * still authorizes every call.
 */
function useRequireSession() {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const hydrated = useIsHydrated();
	const session = useSession();
	// Re-read whenever the session changes (the flag is written first).
	const expired = hydrated && !session && wasSessionExpired();

	useEffect(() => {
		if (hydrated && !session && !expired) {
			const query = searchParams.toString();
			router.replace(
				appRoutes.auth.loginThen(query ? `${pathname}?${query}` : pathname),
			);
		}
	}, [hydrated, session, expired, pathname, searchParams, router]);

	return { session: hydrated ? session : null, expired };
}

export { useRequireSession };
