import { AccountLayout } from '@/features/account/components/account-layout';
import { AddressesSection } from '@/features/account/components/addresses-section';

export default function Page() {
	return (
		<AccountLayout>
			<AddressesSection />
		</AccountLayout>
	);
}
