import { appRoutes } from '@/lib/routes/app-routes';

const destinations: { path: string; label: string }[] = [
	{ path: appRoutes.account.orders, label: 'Meus pedidos' },
	{ path: appRoutes.account.profile, label: 'Meus dados' },
	{ path: appRoutes.account.addresses, label: 'Endereços' },
	{ path: appRoutes.account.password, label: 'Trocar senha' },
	{ path: appRoutes.account.index, label: 'Minha conta' },
	{ path: appRoutes.checkout.delivery, label: 'a entrega' },
	{ path: appRoutes.checkout.payment, label: 'o pagamento' },
];

/** "…você volta direto para {label}" on the Sessão expirada card. */
function sessionDestinationLabel(pathname: string) {
	const match = destinations.find(
		({ path }) => pathname === path || pathname.startsWith(`${path}/`),
	);
	return match?.label ?? 'a página em que você estava';
}

export { sessionDestinationLabel };
