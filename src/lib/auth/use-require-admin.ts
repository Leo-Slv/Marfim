'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

import { useIsHydrated } from '@/lib/hooks/use-is-hydrated';
import { appRoutes } from '@/lib/routes/app-routes';

import { refreshSession } from './session-client';
import { useSession } from './use-session';

/**
 * Gate for the admin panel (`/admin/*`): once the session has been read, a
 * signed-out visitor — or one whose session expired — goes to the admin
 * sign-in and comes back to this URL (the sign-in shows the "sessão
 * terminou" notice itself). An expired token is renewed on arrival. A
 * shopper's session is `forbidden`. UX only: the backend authorizes every
 * admin call.
 */
function useRequireAdmin() {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const hydrated = useIsHydrated();
	const session = useSession();

	useEffect(() => {
		if (hydrated && !session) {
			const query = searchParams.toString();
			router.replace(
				appRoutes.admin.loginThen(query ? `${pathname}?${query}` : pathname),
			);
		}
	}, [hydrated, session, pathname, searchParams, router]);

	// A token past its expiry is renewed right away, so a session the
	// backend ended shows up here even on a screen that makes no API call.
	useEffect(() => {
		if (session && session.expiresAt <= Date.now()) {
			void refreshSession();
		}
	}, [session]);

	const current = hydrated ? session : null;
	return {
		session: current?.role === 'Admin' ? current : null,
		forbidden: current !== null && current.role !== 'Admin',
	};
}

export { useRequireAdmin };
