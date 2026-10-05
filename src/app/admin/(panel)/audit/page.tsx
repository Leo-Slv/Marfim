import type { Metadata } from 'next';

import { AuditPage } from '@/features/admin-audit/components/audit-page';

export const metadata: Metadata = {
	title: 'Admin · Auditoria · Marfim',
};

export default function Page() {
	return <AuditPage />;
}
