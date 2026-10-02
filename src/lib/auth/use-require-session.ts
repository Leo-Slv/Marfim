'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

import { useIsHydrated } from '@/lib/hooks/use-is-hydrated';
import { appRoutes } from '@/lib/routes/app-routes';

import { useSession } from './use-session';

/**
 * Client-side gate for screens that need a signed-in shopper: once the
 * session has been read, a signed-out visitor goes to Entrar and comes back
 * to this exact URL afterwards. Returns the session (null while redirecting
 * or before hydration). The backend still authorizes every call.
 */
function useRequireSession() {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const hydrated = useIsHydrated();
	const session = useSession();

	useEffect(() => {
		if (hydrated && !session) {
			const query = searchParams.toString();
			router.replace(
				appRoutes.auth.loginThen(query ? `${pathname}?${query}` : pathname),
			);
		}
	}, [hydrated, session, pathname, searchParams, router]);

	return hydrated ? session : null;
}

export { useRequireSession };
