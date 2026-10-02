'use client';

import { AdminGate } from '@/features/admin-auth/components/admin-gate';
import { AdminPlaceholder } from '@/features/admin-auth/components/admin-placeholder';

export default function Page() {
	return (
		<AdminGate>{(session) => <AdminPlaceholder session={session} />}</AdminGate>
	);
}
