import type { OrderStatus } from '@/features/checkout/model/order';

type OrderTab = {
	/** `?status=` value. */
	id: string;
	label: string;
	/** Null = every status. */
	status: OrderStatus | null;
};

/** One tab per status — the API filters one status at a time (pendency #2). */
const orderTabs: OrderTab[] = [
	{ id: 'todos', label: 'Todos', status: null },
	{ id: 'a-preparar', label: 'A preparar', status: 'Confirmed' },
	{ id: 'em-preparo', label: 'Em preparo', status: 'Processing' },
	{ id: 'enviados', label: 'Enviados', status: 'Shipped' },
	{ id: 'entregues', label: 'Entregues', status: 'Delivered' },
	{
		id: 'aguardando-pagamento',
		label: 'Aguardando pagamento',
		status: 'PendingPayment',
	},
	{ id: 'cancelados', label: 'Cancelados', status: 'Cancelled' },
	{
		id: 'pagamento-nao-aprovado',
		label: 'Pagamento não aprovado',
		status: 'PaymentFailed',
	},
];

/** `?status=` → tab; anything unknown is "Todos". */
function parseTab(value: string | null): OrderTab {
	return orderTabs.find((tab) => tab.id === value) ?? orderTabs[0];
}

/** `?pagina=` → page number (1 when missing or invalid). */
function parsePage(value: string | null) {
	const page = Number(value);
	return Number.isInteger(page) && page > 1 ? page : 1;
}

export type { OrderTab };
export { orderTabs, parsePage, parseTab };
