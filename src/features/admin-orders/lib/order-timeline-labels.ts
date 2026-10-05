import type { TimelineEntry } from '../schemas/admin-orders.schema';

type TimelineTone = 'neutral' | 'success' | 'alert';

type TimelineItem = {
	key: string;
	label: string;
	at: string;
	tone: TimelineTone;
};

/** pt-BR copy per OrderCore integration event (`OrderTimelineProjector`). */
const labels: Record<string, { label: string; tone: TimelineTone }> = {
	'orders.order-created': { label: 'Pedido criado', tone: 'neutral' },
	'orders.order-payment-requested': {
		label: 'Pagamento solicitado',
		tone: 'neutral',
	},
	'payments.payment-requested': {
		label: 'Pagamento iniciado',
		tone: 'neutral',
	},
	'payments.payment-authorized': {
		label: 'Pagamento aprovado',
		tone: 'success',
	},
	'orders.order-confirmed': { label: 'Pedido confirmado', tone: 'success' },
	'orders.order-processing-started': {
		label: 'Preparo iniciado',
		tone: 'success',
	},
	'payments.payment-captured': {
		label: 'Pagamento capturado',
		tone: 'success',
	},
	'orders.order-shipped': { label: 'Enviado', tone: 'success' },
	'orders.order-delivered': { label: 'Entregue', tone: 'success' },
	'payments.payment-failed': {
		label: 'Pagamento não aprovado',
		tone: 'alert',
	},
	'orders.order-payment-failed': {
		label: 'Pedido sem pagamento aprovado',
		tone: 'alert',
	},
	'payments.payment-authorization-expired': {
		label: 'Autorização do cartão expirou',
		tone: 'alert',
	},
	'payments.payment-voided': {
		label: 'Autorização do cartão liberada',
		tone: 'neutral',
	},
	'payments.payment-refunded': {
		label: 'Pagamento estornado',
		tone: 'neutral',
	},
	'orders.order-cancelled': { label: 'Pedido cancelado', tone: 'alert' },
	'inventory.stock-reserved': { label: 'Estoque reservado', tone: 'neutral' },
	'inventory.stock-released': { label: 'Estoque liberado', tone: 'neutral' },
	'inventory.stock-consumed': { label: 'Estoque baixado', tone: 'neutral' },
	'inventory.stock-returned': { label: 'Estoque devolvido', tone: 'neutral' },
};

function units(entry: TimelineEntry) {
	const quantity = Number(entry.details.quantity);
	return Number.isFinite(quantity) ? quantity : 0;
}

/**
 * The admin timeline in pt-BR, oldest first: consecutive stock events of the
 * same kind become one line with their units. Details like the cancellation
 * `reason` are operational English and never shown.
 */
function timelineItems(
	entries: readonly TimelineEntry[],
	carrier: string | null,
): TimelineItem[] {
	const sorted = [...entries].sort(
		(a, b) =>
			new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime(),
	);
	const items: (TimelineItem & { type: string; units: number })[] = [];

	for (const entry of sorted) {
		const known = labels[entry.type];
		const isStock = entry.type.startsWith('inventory.');
		const previous = items.at(-1);
		if (isStock && previous?.type === entry.type) {
			previous.units += units(entry);
			previous.at = entry.occurredAt;
			continue;
		}
		items.push({
			key: entry.eventId,
			type: entry.type,
			label: known?.label ?? 'Evento do sistema',
			at: entry.occurredAt,
			tone: known?.tone ?? 'neutral',
			units: isStock ? units(entry) : 0,
		});
	}

	return items.map(({ key, type, label, at, tone, units: count }) => ({
		key,
		at,
		tone,
		label:
			type === 'orders.order-shipped' && carrier
				? `${label} · ${carrier}`
				: count > 0
					? `${label} · ${count} un.`
					: label,
	}));
}

export type { TimelineItem, TimelineTone };
export { timelineItems };
