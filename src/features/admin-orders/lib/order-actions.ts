import { z } from 'zod';

import type { OrderStatus } from '@/features/checkout/model/order';
import { isApiError } from '@/lib/http/api-error';

type NextAction = 'start' | 'ship' | 'deliver' | 'none';

/** The fulfilment step an admin takes next (Confirmed → … → Delivered). */
function nextAction(status: OrderStatus): NextAction {
	switch (status) {
		case 'Confirmed':
			return 'start';
		case 'Processing':
			return 'ship';
		case 'Shipped':
			return 'deliver';
		default:
			return 'none';
	}
}

/** OrderCore cancels anything not shipped; the mockup offers it until shipping. */
function canCancel(status: OrderStatus) {
	return ['Created', 'PendingPayment', 'Confirmed', 'Processing'].includes(
		status,
	);
}

/** "Próxima ação" text when there's nothing to do. */
function statusNote(status: OrderStatus, paymentStatus: string | null) {
	switch (status) {
		case 'Delivered':
			return 'Pedido concluído.';
		case 'Cancelled':
			return paymentStatus === 'Refunded'
				? 'Pedido cancelado. Pagamento estornado.'
				: paymentStatus === 'Voided'
					? 'Pedido cancelado. A autorização do cartão foi liberada — o cliente não foi cobrado.'
					: 'Pedido cancelado.';
		case 'PaymentFailed':
			return 'Pagamento recusado. Os itens voltaram ao estoque.';
		default:
			return 'Aguardando a confirmação do pagamento.';
	}
}

const paymentStatusLabels: Record<string, string> = {
	Pending: 'pagamento pendente',
	Processing: 'pagamento em processamento',
	Authorized: 'pagamento autorizado',
	Captured: 'pagamento capturado',
	Failed: 'pagamento recusado',
	Refunded: 'pagamento estornado',
	Voided: 'autorização liberada',
};

/** "Cartão · pagamento autorizado" (no card last four — pendency #5). */
function paymentSummary(
	payment: { method: string; status: string } | null,
): string {
	if (!payment) {
		return 'Sem pagamento';
	}
	const method = payment.method === 'Pix' ? 'Pix' : 'Cartão';
	const status = paymentStatusLabels[payment.status];
	return status ? `${method} · ${status}` : method;
}

/** Toast after cancelling, by what happened to the payment. */
function cancelToast(paymentSettlement: string) {
	switch (paymentSettlement) {
		case 'Voided':
			return 'Pedido cancelado e autorização liberada';
		case 'Refunded':
			return 'Pedido cancelado e estorno solicitado';
		default:
			return 'Pedido cancelado';
	}
}

/** Copy for a failed fulfilment action, by OrderCore's error code. */
function actionErrorCopy(error: unknown) {
	if (isApiError(error)) {
		switch (error.code) {
			case 'payment_capture_failed':
				return 'O Stripe recusou a captura do pagamento. O pedido continua em preparo.';
			case 'payment_in_progress':
				return 'O pagamento ainda está sendo processado. Tente de novo em instantes.';
			case 'invalid_order_state':
			case 'concurrency_conflict':
				return 'Este pedido mudou enquanto você olhava. Atualizamos os dados — confira e tente de novo.';
			case 'validation_error':
				return 'Confira os dados e tente de novo.';
		}
		if (error.status === 503 || error.status === 408) {
			return 'Não conseguimos falar com a loja agora. Tente de novo em instantes.';
		}
	}
	return 'Algo deu errado. Tente de novo em instantes.';
}

const shipFormSchema = z.object({
	carrier: z.string().trim().min(1, 'Informe a transportadora.').max(100),
	trackingCode: z
		.string()
		.trim()
		.min(1, 'Informe o código de rastreio.')
		.max(100),
	trackingUrl: z
		.string()
		.trim()
		.refine((value) => value === '' || /^https?:\/\/\S+\.\S+/.test(value), {
			message: 'Use um link completo, começando com http:// ou https://.',
		}),
});

type ShipForm = z.infer<typeof shipFormSchema>;

export type { NextAction, ShipForm };
export {
	actionErrorCopy,
	canCancel,
	cancelToast,
	nextAction,
	paymentSummary,
	shipFormSchema,
	statusNote,
};
