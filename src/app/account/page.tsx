import { redirect } from 'next/navigation';

import { appRoutes } from '@/lib/routes/app-routes';

/** "Minha conta" opens on the orders (Conta.dc.html's default section). */
export default function Page() {
	redirect(appRoutes.account.orders);
}
