'use client';

import { AdminGate } from '@/features/admin-auth/components/admin-gate';
import { AdminShell } from '@/features/admin-shell/components/admin-shell';

/** Every admin screen but the sign-in: gated, inside the admin frame. */
export default function AdminPanelLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<AdminGate>
			{(session) => <AdminShell session={session}>{children}</AdminShell>}
		</AdminGate>
	);
}
