import type { Metadata } from 'next';

import { CustomersPage } from '@/features/admin-customers/components/customers-page';

export const metadata: Metadata = {
	title: 'Admin · Clientes · Marfim',
};

export default function Page() {
	return <CustomersPage />;
}
