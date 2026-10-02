'use client';

import { Suspense } from 'react';

import { ErrorPage } from '@/features/errors/components/error-page';
import { ErrorState } from '@/features/errors/components/error-state';
import type { Session } from '@/lib/auth/session-store';
import { useRequireAdmin } from '@/lib/auth/use-require-admin';

/**
 * Wraps every `/admin/*` screen: signed-out (or expired) → admin sign-in
 * and back; a shopper's session → the 403 state; an admin → the screen.
 */
function AdminGate({
	children,
}: {
	children: (session: Session) => React.ReactNode;
}) {
	return (
		<Suspense fallback={<AdminSkeleton />}>
			<AdminGateContent>{children}</AdminGateContent>
		</Suspense>
	);
}

function AdminGateContent({
	children,
}: {
	children: (session: Session) => React.ReactNode;
}) {
	const { session, forbidden } = useRequireAdmin();
	if (forbidden) {
		return (
			<ErrorPage>
				<ErrorState kind="forbidden" />
			</ErrorPage>
		);
	}
	return session ? children(session) : <AdminSkeleton />;
}

function AdminSkeleton() {
	return <div className="min-h-screen bg-background" aria-busy="true" />;
}

export { AdminGate };
