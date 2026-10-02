import type { OrderStatus } from '@/features/checkout/model/order';

import { orderStatusLabel } from './order-status';

type HistoryEntry = {
	fromStatus: string | null;
	toStatus: string;
	reason: string | null;
	changedAt: string;
};

type TimelineStep = {
	label: string;
	/** ISO date of the change; null for a step still ahead. */
	at: string | null;
	note: string | null;
	state: 'done' | 'current' | 'ahead' | 'stopped';
};

/** The happy path the timeline shows ahead of the current step. */
const FLOW: OrderStatus[] = [
	'PendingPayment',
	'Confirmed',
	'Processing',
	'Shipped',
	'Delivered',
];

/** Editorial note per step (no per-order notes in OrderCore, pendency #4). */
const notes: Partial<Record<OrderStatus, string>> = {
	Confirmed: 'Pagamento aprovado no cartão.',
	Processing: 'O ateliê está embalando as peças.',
	Shipped: 'Coletado pela transportadora.',
	Delivered: 'Pedido entregue.',
	Cancelled: 'As peças voltaram ao estoque.',
	PaymentFailed: 'O banco não autorizou a transação.',
};

function normalize(status: string): OrderStatus {
	return status === 'Created' ? 'PendingPayment' : (status as OrderStatus);
}

/**
 * Status history (oldest first) + current status → the "Linha do tempo":
 * recorded steps with their time; for an order still moving, the rest of
 * the flow "A SEGUIR"; a cancellation or failed payment ends the line.
 */
function buildTimeline(
	history: readonly HistoryEntry[],
	currentStatus: OrderStatus,
	createdAt: string,
): TimelineStep[] {
	const reached = new Map<OrderStatus, HistoryEntry>();
	for (const entry of history) {
		reached.set(normalize(entry.toStatus), entry);
	}
	const current = normalize(currentStatus);
	const steps: TimelineStep[] = [];

	// The order exists from checkout on, even when the history starts later.
	if (!reached.has('PendingPayment')) {
		steps.push({
			label: orderStatusLabel('PendingPayment'),
			at: createdAt,
			note: null,
			state: current === 'PendingPayment' ? 'current' : 'done',
		});
	}

	const recorded = [...reached.entries()].sort(
		([, a], [, b]) =>
			new Date(a.changedAt).getTime() - new Date(b.changedAt).getTime(),
	);
	for (const [status, entry] of recorded) {
		const ending = status === 'Cancelled' || status === 'PaymentFailed';
		steps.push({
			label: orderStatusLabel(status),
			at: entry.changedAt,
			// OrderCore's `reason` is operational text in English ("Cancelled
			// by the customer", "payment_window_expired"), not shopper copy:
			// the editorial note is shown instead (account pendency #4).
			note: notes[status] ?? null,
			state: ending ? 'stopped' : status === current ? 'current' : 'done',
		});
	}

	// The order's own status always shows, even if the history lags behind.
	if (!reached.has(current) && current !== 'PendingPayment') {
		const ending = current === 'Cancelled' || current === 'PaymentFailed';
		steps.push({
			label: orderStatusLabel(current),
			at: null,
			note: notes[current] ?? null,
			state: ending ? 'stopped' : 'current',
		});
	}

	if (current !== 'Cancelled' && current !== 'PaymentFailed') {
		const currentIndex = FLOW.indexOf(current);
		for (const status of FLOW.slice(currentIndex + 1)) {
			if (!reached.has(status)) {
				steps.push({
					label: orderStatusLabel(status),
					at: null,
					note: null,
					state: 'ahead',
				});
			}
		}
	}

	return steps;
}

export type { HistoryEntry, TimelineStep };
export { buildTimeline };
