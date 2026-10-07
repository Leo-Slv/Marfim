'use client';

import { ArrowLeftIcon } from '@phosphor-icons/react';
import Link from 'next/link';
import { useState } from 'react';

import { notify } from '@/features/account/components/account-toast';
import { formatTimelineMoment } from '@/features/account/lib/account-format';
import { ProductArt } from '@/features/catalog/components/product-art';
import { getProductVisual } from '@/features/catalog/lib/product-visuals';
import { QueryErrorState } from '@/features/errors/components/query-error-state';
import { appRoutes } from '@/lib/routes/app-routes';
import { cn } from '@/lib/utils';

import {
	useActiveReservations,
	useStockActions,
	useStockItem,
	useStockMovements,
} from '../hooks/admin-inventory.queries';
import {
	adjustReasons,
	movementView,
	parseQuantity,
	stockErrorCopy,
	validateAction,
	type StockAction,
} from '../lib/stock';
import type { StockItem, StockRow } from '../schemas/admin-inventory.schema';

const actionCopy: Record<
	StockAction,
	{
		tab: string;
		label: string;
		placeholder: string;
		cta: string;
		toast: string;
	}
> = {
	receive: {
		tab: 'Recebimento',
		label: 'Quantidade recebida',
		placeholder: 'Ex.: 6',
		cta: 'Registrar recebimento',
		toast: 'Recebimento registrado',
	},
	adjust: {
		tab: 'Ajuste',
		label: 'Ajuste (+ ou −)',
		placeholder: 'Ex.: -1',
		cta: 'Aplicar ajuste',
		toast: 'Ajuste aplicado',
	},
	reorder: {
		tab: 'Reposição',
		label: 'Novo ponto de reposição',
		placeholder: '',
		cta: 'Salvar ponto',
		toast: 'Ponto de reposição salvo',
	},
};

const toneClass = {
	in: 'text-success',
	out: 'text-clay',
	reserve: 'text-primary',
} as const;

function SectionLabel({ children }: { children: React.ReactNode }) {
	return (
		<span className="font-mono text-[10px] tracking-[0.14em] text-muted-foreground">
			{children}
		</span>
	);
}

/** The product's stock (AdminEstoque.dc.html, right panel). */
function StockPanel({
	row,
	productId,
	onClose,
}: {
	row: StockRow | undefined;
	productId: string;
	onClose: () => void;
}) {
	const item = useStockItem(productId);
	const visual = getProductVisual(row?.slug ?? '');

	return (
		<aside className="flex w-full shrink-0 animate-slide-in flex-col gap-[18px] bg-card px-4 py-4 min-[980px]:border-l min-[980px]:px-6 min-[980px]:py-7 min-[1280px]:sticky min-[1280px]:top-0 min-[1280px]:h-screen min-[1280px]:w-[400px] min-[1280px]:overflow-y-auto">
			<button
				type="button"
				onClick={onClose}
				className="flex min-h-8 items-center gap-1.5 self-start text-sm font-medium text-primary hover:text-primary-strong min-[1280px]:hidden"
			>
				<ArrowLeftIcon size={14} />
				Estoque
			</button>
			<div className="flex items-center gap-3">
				<span
					className="flex size-12 shrink-0 items-center justify-center rounded-xl"
					style={{ background: visual.tint }}
				>
					<ProductArt kind={visual.kind} size={30} />
				</span>
				<span className="flex min-w-0 grow flex-col">
					<span className="truncate text-lg font-medium">
						{row?.name ?? 'Produto'}
					</span>
					<span className="font-mono text-[11px] text-muted-foreground">
						{row?.sku ?? ''}
					</span>
				</span>
			</div>
			{item.isPending ? (
				<div className="flex flex-col gap-3">
					<div className="skeleton h-[72px] rounded-xl" />
					<div className="skeleton h-40 rounded-xl" />
				</div>
			) : item.isError ? (
				<QueryErrorState
					key={item.errorUpdatedAt}
					error={item.error}
					onRetry={() => void item.refetch()}
				/>
			) : (
				<StockDetail item={item.data} />
			)}
		</aside>
	);
}

function StockDetail({ item }: { item: StockItem }) {
	const actions = useStockActions(item.productId);
	const reservations = useActiveReservations(item.productId);
	const movements = useStockMovements(item.productId);
	const [action, setAction] = useState<StockAction>('receive');
	const [amount, setAmount] = useState('');
	const [reason, setReason] = useState<string>(adjustReasons[0]);
	const [error, setError] = useState<string | null>(null);
	const pending =
		actions.receive.isPending ||
		actions.adjust.isPending ||
		actions.reorder.isPending;
	const copy = actionCopy[action];

	function pick(next: StockAction) {
		setAction(next);
		setAmount('');
		setError(null);
	}

	function handleSubmit(event: React.FormEvent) {
		event.preventDefault();
		const invalid = validateAction(action, amount, item);
		if (invalid) {
			setError(invalid);
			return;
		}
		const quantity = parseQuantity(amount) ?? 0;
		const done = {
			onSuccess: () => {
				setAmount('');
				setError(null);
				notify(copy.toast);
			},
			onError: (failure: unknown) => setError(stockErrorCopy(failure)),
		};
		if (action === 'receive') {
			actions.receive.mutate(quantity, done);
		} else if (action === 'adjust') {
			actions.adjust.mutate({ quantity, reason }, done);
		} else {
			actions.reorder.mutate(quantity, done);
		}
	}

	const entries = movements.data?.pages.flatMap((page) => page.items) ?? [];

	return (
		<>
			<div className="grid grid-cols-3 gap-2">
				{[
					['Disponível', item.quantityAvailable],
					['Reservado', item.quantityReserved],
					['Reposição', item.reorderLevel],
				].map(([label, value]) => (
					<div
						key={label}
						className="flex flex-col gap-0.5 rounded-xl bg-background p-3"
					>
						<span className="text-[11px] text-muted-foreground">{label}</span>
						<span
							key={String(value)}
							className="animate-pop-in text-2xl font-light"
						>
							{value}
						</span>
					</div>
				))}
			</div>

			<div
				role="tablist"
				aria-label="Ação"
				className="grid grid-cols-3 gap-1 rounded-xl bg-surface p-1"
			>
				{(Object.keys(actionCopy) as StockAction[]).map((key) => (
					<button
						key={key}
						type="button"
						role="tab"
						aria-selected={action === key}
						onClick={() => pick(key)}
						className={cn(
							'h-9 rounded-[9px] text-[13px] font-medium transition-colors',
							action === key
								? 'bg-card text-foreground shadow-[0_1px_2px_rgba(24,24,27,.06)]'
								: 'text-ink-soft hover:text-foreground',
						)}
					>
						{actionCopy[key].tab}
					</button>
				))}
			</div>
			<form
				onSubmit={handleSubmit}
				noValidate
				className="flex flex-col gap-2.5"
			>
				<div className="flex flex-col gap-[5px] text-xs text-ink-soft">
					<label htmlFor="stock-amount">{copy.label}</label>
					<input
						id="stock-amount"
						inputMode="numeric"
						value={amount}
						placeholder={copy.placeholder || String(item.reorderLevel)}
						aria-invalid={error ? true : undefined}
						onChange={(event) => {
							setAmount(event.target.value.replace(/[^\d+\-−]/g, ''));
							setError(null);
						}}
						className="h-[42px] rounded-[10px] border bg-card px-3 font-mono text-[15px] text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary aria-invalid:border-clay"
					/>
				</div>
				{action === 'adjust' ? (
					<div className="flex flex-col gap-[5px] text-xs text-ink-soft">
						<label htmlFor="stock-reason">Motivo</label>
						<select
							id="stock-reason"
							value={reason}
							onChange={(event) => setReason(event.target.value)}
							className="h-[42px] rounded-[10px] border bg-card px-2 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
						>
							{adjustReasons.map((option) => (
								<option key={option}>{option}</option>
							))}
						</select>
					</div>
				) : null}
				{error ? (
					<span role="alert" className="text-xs text-clay">
						{error}
					</span>
				) : null}
				<button
					type="submit"
					disabled={pending}
					className="h-11 rounded-xl bg-primary text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-strong disabled:opacity-55"
				>
					{pending ? 'Salvando…' : copy.cta}
				</button>
			</form>

			<div className="flex flex-col gap-2">
				<SectionLabel>RESERVAS ATIVAS</SectionLabel>
				{reservations.isPending ? (
					<div className="skeleton h-9 rounded-[10px]" />
				) : reservations.isError ? (
					<span className="text-[13px] text-clay">
						Não foi possível carregar as reservas.
					</span>
				) : reservations.data.length === 0 ? (
					<span className="text-[13px] text-muted-foreground">
						Nenhuma reserva agora.
					</span>
				) : (
					reservations.data.map((reservation) => (
						<Link
							key={reservation.id}
							href={appRoutes.admin.order(reservation.orderId)}
							className="flex justify-between gap-3 rounded-[10px] bg-primary-soft px-2.5 py-2 text-[13px] text-foreground hover:bg-[#E2E2FB]"
						>
							<span className="font-mono">
								{reservation.orderNumber ?? 'Pedido'}
							</span>
							<span>
								{reservation.quantity} un. · desde{' '}
								{formatTimelineMoment(reservation.reservedAt)}
							</span>
						</Link>
					))
				)}
			</div>

			<div className="flex flex-col gap-1.5">
				<SectionLabel>MOVIMENTAÇÕES</SectionLabel>
				{movements.isPending ? (
					<div className="skeleton h-24 rounded-lg" />
				) : movements.isError ? (
					<span className="text-[13px] text-clay">
						Não foi possível carregar as movimentações.
					</span>
				) : entries.length === 0 ? (
					<span className="text-[13px] text-muted-foreground">
						Nenhuma movimentação ainda.
					</span>
				) : (
					entries.map((movement) => {
						const view = movementView(movement);
						return (
							<div
								key={movement.id}
								className="grid animate-up grid-cols-[52px_minmax(0,1fr)_auto] items-baseline gap-2.5 border-t py-2 text-[13px]"
							>
								<span className={cn('font-mono', toneClass[view.tone])}>
									{view.delta}
								</span>
								<span className="text-ink-soft">{view.what}</span>
								<span className="font-mono text-[10px] text-muted-foreground">
									{formatTimelineMoment(movement.createdAt)}
								</span>
							</div>
						);
					})
				)}
				{movements.hasNextPage ? (
					<button
						type="button"
						onClick={() => void movements.fetchNextPage()}
						disabled={movements.isFetchingNextPage}
						className="min-h-8 self-start text-[13px] font-medium text-primary hover:text-primary-strong"
					>
						{movements.isFetchingNextPage ? 'Carregando…' : 'Mostrar mais'}
					</button>
				) : null}
			</div>
		</>
	);
}

export { StockPanel };
