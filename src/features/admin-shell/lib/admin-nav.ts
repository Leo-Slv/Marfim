import { appRoutes } from '@/lib/routes/app-routes';

/** Which live counter an item shows (AdminNav.dc.html badges). */
type CounterKey = 'toPrepare' | 'stockAlerts' | 'failedMessages';

type AdminNavItem = {
	id: string;
	label: string;
	/** SVG path from AdminNav.dc.html (24×24, stroked). */
	icon: string;
	/** Null while the screen isn't built: muted, EM BREVE, no link. */
	href: string | null;
	counter?: CounterKey;
	/** Counter colours: attention (clay) or informative (indigo). */
	counterTone?: 'info' | 'alert';
};

type AdminNavGroup = { title: string; items: AdminNavItem[] };

const adminNavGroups: AdminNavGroup[] = [
	{
		title: 'OPERAÇÃO',
		items: [
			{
				id: 'dashboard',
				label: 'Dashboard',
				icon: 'M4 13h6V4H4zM14 20h6v-9h-6zM14 4h6v4h-6zM4 20h6v-3H4z',
				href: appRoutes.admin.index,
			},
			{
				id: 'orders',
				label: 'Pedidos',
				icon: 'M5 8h14l-1 12H6L5 8ZM9 8V6a3 3 0 0 1 6 0v2',
				href: appRoutes.admin.orders,
				counter: 'toPrepare',
				counterTone: 'info',
			},
			{
				id: 'products',
				label: 'Produtos',
				icon: 'M12 3 3 8l9 5 9-5-9-5ZM3 8v8l9 5 9-5V8',
				href: appRoutes.admin.products,
			},
			{
				id: 'categories',
				label: 'Categorias',
				icon: 'M4 6h7v7H4zM13 6h7v7h-7zM4 15h7v5H4zM13 15h7v5h-7z',
				href: appRoutes.admin.categories,
			},
			{
				id: 'inventory',
				label: 'Estoque',
				icon: 'M3 7h18v13H3zM3 7l3-4h12l3 4M9 12h6',
				href: appRoutes.admin.inventory,
				counter: 'stockAlerts',
				counterTone: 'alert',
			},
		],
	},
	{
		title: 'CLIENTES E FINANÇAS',
		items: [
			{
				id: 'customers',
				label: 'Clientes',
				icon: 'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM2 21c1-4 4-6 7-6s6 2 7 6M17 11a3 3 0 1 0 0-6M19 15c2 1 3 3 3 6',
				href: appRoutes.admin.customers,
			},
			{
				id: 'payments',
				label: 'Pagamentos',
				icon: 'M2 6h20v12H2zM2 10h20',
				href: appRoutes.admin.payments,
			},
		],
	},
	{
		title: 'SISTEMA',
		items: [
			{
				id: 'audit',
				label: 'Auditoria',
				icon: 'M9 5h10v16H5V9zM9 5v4H5M9 14h6M9 17h4',
				href: appRoutes.admin.audit,
			},
			{
				id: 'failures',
				label: 'Mensagens com falha',
				icon: 'M12 3 2 21h20L12 3ZM12 10v5M12 18h.01',
				href: null,
				counter: 'failedMessages',
				counterTone: 'alert',
			},
		],
	},
];

/** "LE" for leonardo@…: admins have no name (dashboard pendency #6). */
function adminInitials(email: string) {
	const letters = email.split('@')[0].replace(/[^\p{L}\p{N}]/gu, '');
	return letters.slice(0, 2).toUpperCase() || 'AD';
}

/** Whether `pathname` is this item's screen (exact for the dashboard). */
function isActiveItem(item: AdminNavItem, pathname: string) {
	if (!item.href) {
		return false;
	}
	return item.href === appRoutes.admin.index
		? pathname === item.href
		: pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export type { AdminNavGroup, AdminNavItem, CounterKey };
export { adminInitials, adminNavGroups, isActiveItem };
