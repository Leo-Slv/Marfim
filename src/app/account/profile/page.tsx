import { AccountLayout } from '@/features/account/components/account-layout';
import { ProfileSection } from '@/features/account/components/profile-section';

export default function Page() {
	return (
		<AccountLayout>
			<ProfileSection />
		</AccountLayout>
	);
}
