import { isApiError } from '@/lib/http/api-error';

import type { StockFilterValue } from '../api/admin-inventory';
import type {
	StockLevel,
	StockMovement,
} from '../schemas/admin-inventory.schema';

type StockFilter = { id: string; label: string; stock: StockFilterValue };

/** The mockup's tabs; `?nivel=` holds the id. */
const stockFilters: StockFilter[] = [
	{ id: 'todos', label: 'Todos', stock: null },
	{ id: 'abaixo', label: 'Abaixo da reposição', stock: 'LowStock' },
	{ id: 'esgotados', label: 'Esgotados', stock: 'OutOfStock' },
];

function parseFilter(value: string | null) {
	return stockFilters.find((filter) => filter.id === value) ?? stockFilters[0];
}

type LevelState = 'ok' | 'low' | 'out';

/** The bar's full width, in units (the mockup's scale). */
const BAR_SCALE = 16;

/** NÍVEL column: bar, tick at the reorder point, state. */
function stockLevelView(stock: StockLevel | null) {
	const available = stock?.quantityAvailable ?? 0;
	const reorderLevel = stock?.reorderLevel ?? 0;
	const scale = Math.max(BAR_SCALE, reorderLevel, available);
	// OrderCore's rule (`StockItem.AlertLevel`): low is at or below the point.
	const state: LevelState =
		available <= 0 ? 'out' : available <= reorderLevel ? 'low' : 'ok';
	return {
		available,
		reserved: stock?.quantityReserved ?? 0,
		reorderLevel,
		state,
		label: state === 'out' ? 'Zerado' : state === 'low' ? 'Baixo' : 'OK',
		barPercent: Math.min(100, (available / scale) * 100),
		tickPercent: Math.min(100, (reorderLevel / scale) * 100),
	};
}

/** The tiles, from every product's stock. */
function stockSummary(levels: readonly (StockLevel | null)[]) {
	let units = 0;
	let low = 0;
	let out = 0;
	for (const level of levels) {
		const view = stockLevelView(level);
		units += view.available;
		if (view.state === 'out') {
			out++;
		} else if (view.state === 'low') {
			low++;
		}
	}
	return { units, low, out };
}

type StockAction = 'receive' | 'adjust' | 'reorder';

const adjustReasons = [
	'Contagem de inventário',
	'Peça danificada',
	'Amostra para foto',
	'Devolução de cliente',
] as const;

/** Whole numbers, optional leading sign; null otherwise. */
function parseQuantity(input: string) {
	return /^[+\-−]?\d+$/.test(input.trim())
		? Number(input.trim().replace('−', '-'))
		: null;
}

/** The form's error for this action, or null when it can be sent. */
function validateAction(
	action: StockAction,
	input: string,
	item: { quantityAvailable: number },
) {
	const quantity = parseQuantity(input);
	if (quantity === null) {
		return 'Informe um número inteiro.';
	}
	switch (action) {
		case 'receive':
			return quantity > 0 ? null : 'O recebimento precisa ser maior que zero.';
		case 'adjust':
			if (quantity === 0) {
				return 'O ajuste não pode ser zero.';
			}
			return item.quantityAvailable + quantity < 0
				? 'O disponível não pode ficar negativo.'
				: null;
		case 'reorder':
			return quantity >= 0
				? null
				: 'O ponto de reposição não pode ser negativo.';
	}
}

const movementLabels: Record<string, string> = {
	Inbound: 'Recebimento',
	Outbound: 'Saída',
	Adjustment: 'Ajuste',
	ReservationCreated: 'Reservado para um pedido',
	ReservationReleased: 'Reserva liberada',
	ReservationConsumed: 'Vendido',
	ReservationReturned: 'Devolvido ao estoque',
};

type MovementTone = 'in' | 'out' | 'reserve';

/**
 * "+6 Recebimento · Recebimento do ateliê": signed by its effect on the
 * units on hand; reservations only hold units (indigo, no sign).
 */
function movementView(movement: StockMovement) {
	const quantity = Math.abs(movement.quantity);
	const label = movementLabels[movement.movementType] ?? 'Movimentação';
	const what = movement.reason ? `${label} · ${movement.reason}` : label;
	switch (movement.movementType) {
		case 'Inbound':
		case 'ReservationReturned':
			return { delta: `+${quantity}`, tone: 'in' as MovementTone, what };
		case 'Outbound':
		case 'ReservationConsumed':
			return { delta: `−${quantity}`, tone: 'out' as MovementTone, what };
		case 'Adjustment':
			return movement.quantity >= 0
				? { delta: `+${quantity}`, tone: 'in' as MovementTone, what }
				: { delta: `−${quantity}`, tone: 'out' as MovementTone, what };
		default:
			return { delta: `${quantity}`, tone: 'reserve' as MovementTone, what };
	}
}

function stockErrorCopy(error: unknown) {
	if (isApiError(error)) {
		switch (error.code) {
			case 'stock_below_reserved':
				return 'O ajuste deixaria menos peças do que as reservadas para pedidos.';
			case 'concurrency_conflict':
				return 'O estoque mudou enquanto você editava. Atualizamos os números — confira e tente de novo.';
			case 'not_found':
				return 'Este produto ainda não tem registro de estoque.';
			case 'validation_error':
				return 'Confira os números e tente de novo.';
		}
		if (error.status === 503 || error.status === 408) {
			return 'Não conseguimos falar com a loja agora. Tente de novo em instantes.';
		}
	}
	return 'Algo deu errado. Tente de novo em instantes.';
}

export type { LevelState, MovementTone, StockAction, StockFilter };
export {
	adjustReasons,
	movementView,
	parseFilter,
	parseQuantity,
	stockErrorCopy,
	stockFilters,
	stockLevelView,
	stockSummary,
	validateAction,
};
