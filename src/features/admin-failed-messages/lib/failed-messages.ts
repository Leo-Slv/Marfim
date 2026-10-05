import { eventTypeLabel } from '@/features/admin-orders/lib/order-timeline-labels';
import { isApiError } from '@/lib/http/api-error';

import type { FailedMessageStatus } from '../schemas/failed-messages.schema';

type FailureTab = { id: string; label: string; status: FailedMessageStatus };

const failureTabs: FailureTab[] = [
	{ id: 'pendentes', label: 'Pendentes', status: 'Pending' },
	{ id: 'reprocessadas', label: 'Reprocessadas', status: 'Replayed' },
	{ id: 'descartadas', label: 'Descartadas', status: 'Discarded' },
];

function parseFailureTab(value: string | null) {
	return failureTabs.find((tab) => tab.id === value) ?? failureTabs[0];
}

/** OrderCore's consumers (queues) and what is lost while one fails. */
const consumers: Record<string, { label: string; consequence: string }> = {
	'notifications.order-emails': {
		label: 'E-mails de pedido',
		consequence: 'O cliente não recebe o e-mail deste evento.',
	},
	'orders.payment-outcomes': {
		label: 'Resultado do pagamento no pedido',
		consequence:
			'O pedido não muda de status com o resultado do pagamento (fica aguardando).',
	},
	'orders.timeline': {
		label: 'Linha do tempo do pedido',
		consequence: 'A linha do tempo do pedido fica sem este evento.',
	},
	'orders.realtime': {
		label: 'Atualização ao vivo',
		consequence:
			'Telas abertas não se atualizam na hora com este evento (atualizam ao recarregar).',
	},
};

function consumerLabel(consumer: string) {
	return consumers[consumer]?.label ?? consumer;
}

function consequenceOf(consumer: string) {
	return (
		consumers[consumer]?.consequence ??
		'O serviço que devia processar esta mensagem não a recebe.'
	);
}

/** "Pedido cancelado → E-mails de pedido". */
function messageTitle(type: string, consumer: string) {
	const event = eventTypeLabel(type) ?? type;
	return `${event} → ${consumerLabel(consumer)}`;
}

function attemptsLabel(attempts: number) {
	return attempts === 1 ? '1 TENTATIVA' : `${attempts} TENTATIVAS`;
}

/** The envelope as received, indented when it's JSON. */
function prettyBody(body: string) {
	try {
		return JSON.stringify(JSON.parse(body), null, 2);
	} catch {
		return body;
	}
}

function failureErrorCopy(error: unknown) {
	if (isApiError(error)) {
		// Replayed or discarded meanwhile (e.g. in another tab).
		if (error.code === 'invalid_failed_message_state') {
			return 'Esta mensagem já foi resolvida. Atualizamos a lista.';
		}
		if (error.status === 404) {
			return 'Esta mensagem não existe mais.';
		}
		if (error.status === 503 || error.status === 408) {
			return 'Não conseguimos falar com a loja agora. Tente de novo em instantes.';
		}
	}
	return 'Algo deu errado. Tente de novo em instantes.';
}

export type { FailureTab };
export {
	attemptsLabel,
	consequenceOf,
	consumerLabel,
	failureErrorCopy,
	failureTabs,
	messageTitle,
	parseFailureTab,
	prettyBody,
};
