import { formatCurrencyBrl } from '@/features/catalog/lib/format-currency-brl';

/**
 * Free-shipping goal shown as "EM BREVE" in the mockup — OrderCore has no
 * shipping rules yet (backend pendency #6), so it's only a preview.
 */
const FREE_SHIPPING_GOAL = 299;

function freeShippingProgress(subtotal: number, goal = FREE_SHIPPING_GOAL) {
	const percent = Math.min(100, (subtotal / goal) * 100);
	const label =
		subtotal >= goal
			? 'Frete grátis liberado'
			: `Faltam ${formatCurrencyBrl(goal - subtotal)} para frete grátis`;

	return { percent, label };
}

export { FREE_SHIPPING_GOAL, freeShippingProgress };
