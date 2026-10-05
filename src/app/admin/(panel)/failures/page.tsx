import type { Metadata } from 'next';

import { FailedMessagesPage } from '@/features/admin-failed-messages/components/failed-messages-page';

export const metadata: Metadata = {
	title: 'Admin · Mensagens com falha · Marfim',
};

export default function Page() {
	return <FailedMessagesPage />;
}
