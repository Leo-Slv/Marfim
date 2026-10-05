import type { Metadata } from 'next';

import { InventoryPage } from '@/features/admin-inventory/components/inventory-page';

export const metadata: Metadata = {
	title: 'Admin · Estoque · Marfim',
};

export default function Page() {
	return <InventoryPage />;
}
