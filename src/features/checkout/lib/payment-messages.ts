import { isApiError } from '@/lib/http/api-error';

/** Countdown when a 429's `Retry-After` can't be read (CORS). */
const DEFAULT_LOCK_SECONDS = 60;

type CheckoutAlertKind = 'price' | 'stock' | 'email' | 'rate' | 'generic';

type CheckoutAlert = {
	kind: CheckoutAlertKind;
	title: string;
	text: string;
	lockSeconds?: number;
};

/** Maps a failed `POST /api/orders/checkout` to the mockup's notice. */
function checkoutAlert(error: unknown): CheckoutAlert {
	if (!isApiError(error)) {
		return {
			kind: 'generic',
			title: 'Não deu para criar o pedido',
			text: 'Algo deu errado. Tente de novo em instantes; nada foi cobrado.',
		};
	}
	if (error.status === 429) {
		return {
			kind: 'rate',
			title: 'Muitas tentativas seguidas',
			text: 'Aguarde um pouco para tentar de novo. Sua sacola continua salva.',
			lockSeconds: error.retryAfterSeconds ?? DEFAULT_LOCK_SECONDS,
		};
	}
	switch (error.code) {
		case 'price_changed':
			return {
				kind: 'price',
				title: 'O preço de uma peça mudou',
				text: 'O total mudou desde que você abriu a sacola. Nada foi cobrado.',
			};
		case 'insufficient_stock':
			return {
				kind: 'stock',
				title: 'Uma peça acabou de esgotar',
				text: 'Não há estoque para toda a sua sacola agora. Ajuste as quantidades para continuar.',
			};
		case 'product_unavailable':
		case 'product_not_found':
			return {
				kind: 'stock',
				title: 'Uma peça saiu de venda',
				text: 'Uma das peças da sua sacola não está mais disponível. Revise a sacola para continuar.',
			};
		case 'email_not_confirmed':
			return {
				kind: 'email',
				title: 'Confirme seu e-mail para finalizar',
				text: 'Por segurança, só finalizamos compras de contas com e-mail confirmado. O link vale 24 horas.',
			};
		default:
			return {
				kind: 'generic',
				title: 'Não deu para criar o pedido',
				text: 'Confira os dados e tente de novo. Nada foi cobrado.',
			};
	}
}

/** Plain-language reason for a payment that didn't go through. */
function paymentFailureReason(reason: string | null) {
	switch (reason) {
		case 'payment_window_expired':
			return 'O prazo de 30 minutos para concluir o pagamento terminou. Nenhum valor foi cobrado.';
		case 'insufficient_funds':
			return 'O cartão não tinha limite suficiente. Nenhum valor foi cobrado.';
		case 'expired_card':
			return 'O cartão está vencido. Nenhum valor foi cobrado.';
		case 'incorrect_cvc':
			return 'O código de segurança não confere. Nenhum valor foi cobrado.';
		default:
			return 'O banco emissor não autorizou a transação. Nenhum valor foi cobrado.';
	}
}

export type { CheckoutAlert, CheckoutAlertKind };
export { checkoutAlert, paymentFailureReason };
