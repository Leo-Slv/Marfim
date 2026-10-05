import type { Metadata } from 'next';

import { PaymentsPage } from '@/features/admin-payments/components/payments-page';

export const metadata: Metadata = {
	title: 'Admin · Pagamentos · Marfim',
};

export default function Page() {
	return <PaymentsPage />;
}
