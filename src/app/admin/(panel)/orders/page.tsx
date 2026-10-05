import type { Metadata } from 'next';

import { OrdersPage } from '@/features/admin-orders/components/orders-page';

export const metadata: Metadata = {
	title: 'Admin · Pedidos · Marfim',
};

export default function Page() {
	return <OrdersPage />;
}
