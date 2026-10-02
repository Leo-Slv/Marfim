import { AccountLayout } from '@/features/account/components/account-layout';
import { PasswordSection } from '@/features/account/components/password-section';

export default function Page() {
	return (
		<AccountLayout>
			<PasswordSection />
		</AccountLayout>
	);
}
