import type { Metadata } from 'next';

import { AdminLoginPage } from '@/features/admin-auth/components/admin-login-page';

export const metadata: Metadata = {
	title: 'Admin · Entrar · Marfim',
};

export default function Page() {
	return <AdminLoginPage />;
}
