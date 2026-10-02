import { formatCurrencyBrl } from '@/features/catalog/lib/format-currency-brl';

import type { CartLineIssue } from '../model/cart-quote';

type IssueAction = 'acknowledge' | 'decrease' | 'remove';

type LineNotice = { text: string; action: IssueAction; actionLabel: string };

/** Notice shown inside a buyable line (price change, not enough stock). */
function lineNotice(
	issue: CartLineIssue | null,
	context: {
		previousUnitPrice: number | null;
		unitPrice: number;
		quantity: number;
	},
): LineNotice | null {
	switch (issue) {
		case 'PriceChanged':
			return {
				text:
					context.previousUnitPrice === null
						? 'O preço desta peça mudou desde que você adicionou.'
						: `O preço mudou de ${formatCurrencyBrl(context.previousUnitPrice)} para ${formatCurrencyBrl(context.unitPrice)} desde que você adicionou.`,
				action: 'acknowledge',
				actionLabel: 'Entendi',
			};
		case 'InsufficientStock':
			// OrderCore doesn't say how many are left (cart pendency #1).
			return context.quantity > 1
				? {
						text: 'Não temos estoque para essa quantidade.',
						action: 'decrease',
						actionLabel: 'Diminuir quantidade',
					}
				: {
						text: 'Esta peça esgotou enquanto estava na sua sacola.',
						action: 'remove',
						actionLabel: 'Remover',
					};
		default:
			return null;
	}
}

/** Label and text of a line that can't be bought at all. */
function unavailableCopy(issue: 'NotFound' | 'Unavailable') {
	return issue === 'NotFound'
		? {
				code: 'NÃO ENCONTRADA',
				text: 'Não encontramos mais este produto no catálogo.',
			}
		: {
				code: 'INDISPONÍVEL',
				text: 'Esta peça saiu de venda e não pode ser comprada agora.',
			};
}

export type { IssueAction, LineNotice };
export { lineNotice, unavailableCopy };
