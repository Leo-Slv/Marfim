import { parseMoney } from '@/features/admin-products/lib/product-form';
import { formatCurrencyBrlCents } from '@/features/catalog/lib/format-currency-brl';
import { isApiError } from '@/lib/http/api-error';

import type {
	Payment,
	PaymentStatus,
	Reconciliation,
} from '../schemas/admin-payments.schema';

type PaymentTab = { id: string; label: string; status: PaymentStatus | null };

/** One tab per status — the API filters one at a time (pendency #3). */
const paymentTabs: PaymentTab[] = [
	{ id: 'todos', label: 'Todos', status: null },
	{ id: 'aguardando', label: 'Aguardando', status: 'Pending' },
	{ id: 'processando', label: 'Em processamento', status: 'Processing' },
	{ id: 'autorizados', label: 'Autorizados', status: 'Authorized' },
	{ id: 'capturados', label: 'Capturados', status: 'Captured' },
	{ id: 'recusados', label: 'Recusados', status: 'Failed' },
	{ id: 'estornados', label: 'Estornados', status: 'Refunded' },
	{ id: 'liberados', label: 'Liberados', status: 'Voided' },
];

function parsePaymentTab(value: string | null) {
	return paymentTabs.find((tab) => tab.id === value) ?? paymentTabs[0];
}

const statusInfo: Record<PaymentStatus, { label: string; className: string }> =
	{
		Pending: { label: 'Aguardando', className: 'bg-surface text-ink-soft' },
		Processing: {
			label: 'Em processamento',
			className: 'bg-surface text-ink-soft',
		},
		Authorized: {
			label: 'Autorizado',
			className: 'bg-success-soft text-success',
		},
		Captured: { label: 'Capturado', className: 'bg-success-soft text-success' },
		Failed: { label: 'Recusado', className: 'bg-clay-soft text-clay' },
		Refunded: { label: 'Estornado', className: 'bg-primary-soft text-primary' },
		Voided: { label: 'Liberado', className: 'bg-surface text-ink-soft' },
	};

/** The pill; a captured payment with refunds reads "Estorno parcial". */
function paymentStatusView(status: PaymentStatus, refundedAmount: number) {
	if (status === 'Captured' && refundedAmount > 0) {
		return {
			label: 'Estorno parcial',
			className: 'bg-primary-soft text-primary',
		};
	}
	return statusInfo[status];
}

/** Stripe decline codes (`decline_code` / `code`) in pt-BR. */
const declineExplanations: Record<string, string> = {
	card_declined: 'O banco emissor não autorizou a transação.',
	generic_decline: 'O banco recusou sem informar o motivo.',
	insufficient_funds: 'Saldo ou limite insuficiente.',
	expired_card: 'O cartão está vencido.',
	incorrect_cvc: 'O código de segurança está incorreto.',
	incorrect_number: 'O número do cartão está incorreto.',
	processing_error: 'Erro de processamento no banco.',
	lost_card: 'O cartão foi bloqueado pelo banco (perda).',
	stolen_card: 'O cartão foi bloqueado pelo banco (roubo).',
	fraudulent: 'O banco suspeitou de fraude.',
	do_not_honor: 'O banco recusou a transação.',
	authentication_required:
		'O banco pediu autenticação (3-D Secure) e ela não foi concluída.',
	payment_intent_authentication_failure: 'A autenticação (3-D Secure) falhou.',
	declined: 'Recusado pelo banco.',
};

function declineExplanation(code: string) {
	return declineExplanations[code] ?? 'Recusado pelo banco.';
}

const refundStatusLabels: Record<string, string> = {
	Pending: 'aguardando o Stripe',
	Completed: 'concluído',
	Failed: 'falhou',
};

type PaymentEvent = {
	key: string;
	label: string;
	at: string;
	tone: 'neutral' | 'success' | 'alert' | 'refund';
};

/** "Eventos": the payment's timestamps and refunds, oldest first. */
function paymentEvents(payment: Payment): PaymentEvent[] {
	const events: PaymentEvent[] = [
		{
			key: 'created',
			label: 'Pagamento criado',
			at: payment.createdAt,
			tone: 'neutral',
		},
	];
	if (payment.lastDeclinedAt) {
		events.push({
			key: 'declined',
			label: `Recusado pelo banco${payment.lastDeclineReason ? ` · ${payment.lastDeclineReason}` : ''}`,
			at: payment.lastDeclinedAt,
			tone: 'alert',
		});
	}
	if (payment.authorizedAt) {
		events.push({
			key: 'authorized',
			label: 'Autorizado',
			at: payment.authorizedAt,
			tone: 'success',
		});
	}
	if (payment.capturedAt) {
		events.push({
			key: 'captured',
			label: 'Capturado',
			at: payment.capturedAt,
			tone: 'success',
		});
	}
	if (payment.voidedAt) {
		events.push({
			key: 'voided',
			label: 'Autorização liberada (cliente não cobrado)',
			at: payment.voidedAt,
			tone: 'neutral',
		});
	}
	if (payment.disputedAt) {
		events.push({
			key: 'disputed',
			label: 'Contestação aberta no banco',
			at: payment.disputedAt,
			tone: 'alert',
		});
	}
	for (const refund of payment.refunds) {
		events.push({
			key: refund.id,
			label: `Estorno de ${formatCurrencyBrlCents(refund.amount)} · ${refundStatusLabels[refund.status] ?? refund.status.toLowerCase()}`,
			at: refund.processedAt ?? refund.requestedAt,
			tone: refund.status === 'Failed' ? 'alert' : 'refund',
		});
	}
	return events.sort(
		(a, b) => new Date(a.at).getTime() - new Date(b.at).getTime(),
	);
}

/** What can still be refunded (failed refunds don't count). */
function refundableBalance(payment: Payment) {
	const granted = payment.refunds
		.filter((refund) => refund.status !== 'Failed')
		.reduce((sum, refund) => sum + refund.amount, 0);
	return Math.max(0, Math.round((payment.amount - granted) * 100) / 100);
}

function canRefund(payment: Payment) {
	return payment.status === 'Captured' && refundableBalance(payment) > 0;
}

/** null when the amount can be refunded; otherwise the message. */
function validateRefund(input: string, balance: number) {
	const amount = parseMoney(input);
	if (amount === null || amount < 0.01 || amount > balance) {
		return `Informe um valor entre R$ 0,01 e ${formatCurrencyBrlCents(balance)}.`;
	}
	return null;
}

const refundReasons = [
	'Pedido do cliente',
	'Produto com defeito',
	'Cobrança indevida',
	'Outro',
] as const;

/** "Conferir agora" result. */
function reconciliationMessage(result: Reconciliation) {
	const label = (status: string) =>
		(statusInfo[status as PaymentStatus]?.label ?? status).toLowerCase();
	return result.changed
		? {
				text: `Corrigido: estava ${label(result.statusBefore)}, agora ${label(result.statusAfter)}.`,
				tone: 'changed' as const,
			}
		: {
				text: `Status no Stripe igual ao da loja: ${label(result.statusAfter)}.`,
				tone: 'same' as const,
			};
}

function paymentErrorCopy(error: unknown) {
	if (isApiError(error)) {
		switch (error.code) {
			case 'refund_exceeds_balance':
				return 'O valor passa do que ainda pode ser estornado.';
			case 'invalid_payment_state':
				return 'Este pagamento mudou de status. Atualizamos os dados — confira e tente de novo.';
			case 'validation_error':
				return 'Confira o valor e tente de novo.';
		}
		if (error.status === 503 || error.status === 408) {
			return 'Não conseguimos falar com a loja agora. Tente de novo em instantes.';
		}
	}
	return 'O Stripe não respondeu como esperado. Tente de novo em instantes.';
}

export type { PaymentEvent, PaymentTab };
export {
	canRefund,
	declineExplanation,
	parsePaymentTab,
	paymentErrorCopy,
	paymentEvents,
	paymentStatusView,
	paymentTabs,
	reconciliationMessage,
	refundableBalance,
	refundReasons,
	validateRefund,
};
