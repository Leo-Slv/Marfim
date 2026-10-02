import type { OrderStatus } from '../model/order';

/** Which screen of Pagamento.dc.html to show. */
type PaymentStage = 'review' | 'card' | 'processing' | 'confirmed' | 'failed';

/**
 * The screen for the current order (if any): before placing it, the
 * review; while it waits for payment, the card form — or "processing" once
 * the card was confirmed in this tab; afterwards, the outcome.
 */
function paymentStage(
	orderStatus: OrderStatus | null,
	cardSubmitted: boolean,
): PaymentStage {
	switch (orderStatus) {
		case null:
		case 'Created':
			return 'review';
		case 'PendingPayment':
			return cardSubmitted ? 'processing' : 'card';
		case 'PaymentFailed':
		case 'Cancelled':
			return 'failed';
		case 'Confirmed':
		case 'Processing':
		case 'Shipped':
		case 'Delivered':
			return 'confirmed';
	}
}

/**
 * The processing checklist (Pedido criado · Pagamento enviado ao banco ·
 * Aguardando confirmação · Confirmando estoque): index of the step being
 * waited on. The backend confirms stock and payment together, so the last
 * two advance with the elapsed time while the order is pending.
 */
function processingStep(secondsWaiting: number) {
	return secondsWaiting < 4 ? 2 : 3;
}

export type { PaymentStage };
export { paymentStage, processingStep };
