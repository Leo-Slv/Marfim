import { AccountLayout } from '@/features/account/components/account-layout';
import { OrdersSection } from '@/features/account/components/orders-section';

export default function Page() {
	return (
		<AccountLayout>
			<OrdersSection />
		</AccountLayout>
	);
}
