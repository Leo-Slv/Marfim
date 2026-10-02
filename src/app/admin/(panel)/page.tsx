import type { Metadata } from 'next';

import { DashboardPage } from '@/features/admin-dashboard/components/dashboard-page';

export const metadata: Metadata = {
	title: 'Admin · Dashboard · Marfim',
};

export default function Page() {
	return <DashboardPage />;
}
