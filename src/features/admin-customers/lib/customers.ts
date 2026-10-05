import { REVENUE_STATUSES } from '@/features/admin-dashboard/lib/dashboard-metrics';
import type { CustomerAddress } from '@/features/checkout/model/address';

import type { CustomerOrder } from '../schemas/admin-customers.schema';

/** "AR" for Ana Ribeiro; letters only. */
function customerInitials(name: string) {
	const words = name
		.split(/\s+/)
		.map((word) => word.replace(/[^\p{L}\p{N}]/gu, ''))
		.filter(Boolean);
	const initials =
		words.length > 1
			? `${words[0][0]}${words[words.length - 1][0]}`
			: (words[0] ?? '').slice(0, 2);
	return initials.toUpperCase() || '?';
}

const sinceFormatter = new Intl.DateTimeFormat('pt-BR', {
	timeZone: 'America/Sao_Paulo',
	month: 'short',
	year: 'numeric',
});

/** "jul 2026". */
function customerSince(createdAt: string) {
	return sinceFormatter
		.format(new Date(createdAt))
		.replace('.', '')
		.replace(' de ', ' ');
}

/** Orders placed and money spent (paid statuses — the dashboard's rule). */
function orderStats(orders: readonly CustomerOrder[], totalOrders: number) {
	const spent = orders
		.filter((order) => REVENUE_STATUSES.includes(order.status))
		.reduce((sum, order) => sum + order.totalAmount, 0);
	return { orders: totalOrders, spent };
}

/** "entrega e cobrança padrão" / "entrega padrão" / "sem padrão". */
function addressTags(address: CustomerAddress) {
	if (address.isDefaultShipping && address.isDefaultBilling) {
		return 'entrega e cobrança padrão';
	}
	if (address.isDefaultShipping) {
		return 'entrega padrão';
	}
	if (address.isDefaultBilling) {
		return 'cobrança padrão';
	}
	return 'sem padrão';
}

export { addressTags, customerInitials, customerSince, orderStats };
