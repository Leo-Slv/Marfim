import type { OrderStatus } from '@/features/checkout/model/order';

type StatusTone = 'neutral' | 'primary' | 'warm' | 'strong' | 'success';

/** Label and pill tone per OrderCore status (Conta.dc.html). */
const statusInfo: Record<OrderStatus, { label: string; tone: StatusTone }> = {
	Created: { label: 'Aguardando pagamento', tone: 'neutral' },
	PendingPayment: { label: 'Aguardando pagamento', tone: 'neutral' },
	Confirmed: { label: 'Confirmado', tone: 'primary' },
	Processing: { label: 'Em preparo', tone: 'warm' },
	Shipped: { label: 'Enviado', tone: 'strong' },
	Delivered: { label: 'Entregue', tone: 'success' },
	Cancelled: { label: 'Cancelado', tone: 'neutral' },
	PaymentFailed: { label: 'Pagamento não aprovado', tone: 'warm' },
};

const statusToneClass: Record<StatusTone, string> = {
	neutral: 'bg-surface text-ink-soft',
	primary: 'bg-primary-soft text-primary',
	warm: 'bg-clay-soft text-clay',
	strong: 'bg-primary text-primary-foreground',
	success: 'bg-success-soft text-success',
};

function orderStatusLabel(status: OrderStatus) {
	return statusInfo[status].label;
}

function orderStatusClass(status: OrderStatus) {
	return statusToneClass[statusInfo[status].tone];
}

/** The shopper can cancel until the store starts preparing (OrderCore). */
function canCancelOrder(status: OrderStatus) {
	return status === 'PendingPayment' || status === 'Confirmed';
}

function isInFulfilment(status: OrderStatus) {
	return status === 'Processing' || status === 'Shipped';
}

/** Still moving: worth refreshing ("Ao vivo"). */
function isActiveOrder(status: OrderStatus) {
	return !['Delivered', 'Cancelled', 'PaymentFailed'].includes(status);
}

export {
	canCancelOrder,
	isActiveOrder,
	isInFulfilment,
	orderStatusClass,
	orderStatusLabel,
};
