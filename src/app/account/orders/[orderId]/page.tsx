'use client';

import { useParams } from 'next/navigation';

import { AccountLayout } from '@/features/account/components/account-layout';
import { OrderDetailSection } from '@/features/account/components/order-detail-section';

export default function Page() {
	const { orderId } = useParams<{ orderId: string }>();
	return (
		<AccountLayout>
			<OrderDetailSection key={orderId} orderId={orderId} />
		</AccountLayout>
	);
}
