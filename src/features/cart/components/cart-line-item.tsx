import { MinusIcon, PlusIcon, WarningCircleIcon } from '@phosphor-icons/react';

import { ProductArt } from '@/features/catalog/components/product-art';
import { formatCurrencyBrl } from '@/features/catalog/lib/format-currency-brl';
import { getProductVisual } from '@/features/catalog/lib/product-visuals';
import { cn } from '@/lib/utils';

import type { CartViewLine } from '../lib/cart-view';
import { MAX_LINE_QUANTITY } from '../lib/cart-lines';
import { lineNotice, type IssueAction } from '../lib/line-issue-copy';

type CartLineItemProps = {
	line: CartViewLine;
	onQuantityChange: (quantity: number) => void;
	onRemove: () => void;
	onAcknowledgePrice: () => void;
};

function CartLineItem({
	line,
	onQuantityChange,
	onRemove,
	onAcknowledgePrice,
}: CartLineItemProps) {
	const visual = getProductVisual(line.slug);
	const notice = lineNotice(line.issue, line);
	const stock = stockNote(line);

	const actions: Record<IssueAction, () => void> = {
		acknowledge: onAcknowledgePrice,
		decrease: () => onQuantityChange(line.quantity - 1),
		remove: onRemove,
	};

	const noticeBox = notice ? (
		<div
			role="alert"
			className="flex animate-up flex-wrap items-center gap-2.5 rounded-[10px] bg-clay-soft px-3 py-2.5 text-[13px] leading-[1.45] text-foreground"
		>
			<WarningCircleIcon size={14} weight="bold" className="text-clay" />
			<span className="grow">{notice.text}</span>
			<button
				type="button"
				onClick={actions[notice.action]}
				className="h-[34px] rounded-lg border border-clay px-2.5 text-xs font-medium whitespace-nowrap text-clay transition-colors hover:bg-clay hover:text-white"
			>
				{notice.actionLabel}
			</button>
		</div>
	) : null;

	return (
		<>
			{/* Below 980 px: one card per line (MobileSacola.dc.html). */}
			<article className="flex animate-up flex-col gap-2.5 rounded-2xl border bg-card p-3 min-[980px]:hidden">
				<div className="flex gap-3">
					<div
						className="flex size-[84px] shrink-0 items-center justify-center rounded-xl"
						style={{ background: visual.tint }}
					>
						<ProductArt kind={visual.kind} size={48} />
					</div>
					<div className="flex min-w-0 grow flex-col gap-0.5">
						<span className="text-xs text-muted-foreground">{line.brand}</span>
						<span className="text-base font-medium">{line.name}</span>
						<span className="flex items-baseline gap-1.5">
							<span
								key={`${line.quantity}-${line.unitPrice}`}
								className="animate-pop font-mono text-sm"
							>
								{formatCurrencyBrl(line.lineTotal)}
							</span>
							{line.oldLineTotal !== null ? (
								<span className="font-mono text-[11px] text-muted-foreground line-through">
									{formatCurrencyBrl(line.oldLineTotal)}
								</span>
							) : null}
						</span>
					</div>
				</div>
				{noticeBox}
				<div className="flex items-center justify-between">
					<Stepper line={line} onQuantityChange={onQuantityChange} />
					<button
						type="button"
						onClick={onRemove}
						className="min-h-11 px-2 text-sm text-muted-foreground underline underline-offset-3"
					>
						Remover
					</button>
				</div>
			</article>
			<div className="hidden animate-up flex-wrap items-stretch gap-5 border-t py-5 [animation-duration:.7s] first:border-t-0 min-[980px]:flex min-[980px]:flex-nowrap">
				<div
					className="flex size-28 shrink-0 items-center justify-center rounded-xl"
					style={{ background: visual.tint }}
				>
					<ProductArt kind={visual.kind} size={64} />
				</div>
				<div className="flex min-w-0 grow basis-48 flex-col gap-1">
					<div className="min-h-[1em] font-mono text-[11px] tracking-[0.12em] text-muted-foreground">
						{line.categoryName?.toUpperCase()}
					</div>
					<div className="text-lg font-medium">{line.name}</div>
					{line.brand ? (
						<div className="text-[13px] text-muted-foreground">
							por {line.brand}
						</div>
					) : null}
					{notice ? (
						<div
							role="alert"
							className="mt-1.5 flex animate-up flex-wrap items-center gap-2.5 rounded-[10px] bg-clay-soft px-3 py-2 text-[13px] text-foreground"
						>
							<WarningCircleIcon
								size={14}
								weight="bold"
								className="text-clay"
							/>
							<span className="grow">{notice.text}</span>
							<button
								type="button"
								onClick={actions[notice.action]}
								className="h-[30px] rounded-lg border border-clay px-2.5 text-xs font-medium text-clay transition-colors hover:bg-clay hover:text-white"
							>
								{notice.actionLabel}
							</button>
						</div>
					) : null}
					<div className="mt-auto flex flex-wrap items-center gap-3.5 pt-2">
						<span
							className={cn(
								'flex items-center gap-1.5 text-[13px]',
								stock.className,
							)}
						>
							<span className="size-1.5 rounded-full bg-current" />
							{stock.label}
						</span>
						<button
							type="button"
							onClick={onRemove}
							className="min-h-8 text-[13px] text-muted-foreground underline underline-offset-3 hover:text-foreground"
						>
							Remover
						</button>
					</div>
				</div>
				<div className="flex shrink-0 flex-col items-end justify-between gap-3 max-sm:w-full max-sm:flex-row max-sm:items-center">
					<div className="flex flex-col items-end gap-0.5">
						<span
							key={`${line.quantity}-${line.unitPrice}`}
							className="animate-pop font-mono text-base font-medium"
						>
							{formatCurrencyBrl(line.lineTotal)}
						</span>
						{line.oldLineTotal !== null ? (
							<span className="font-mono text-xs text-muted-foreground line-through">
								{formatCurrencyBrl(line.oldLineTotal)}
							</span>
						) : null}
						{line.quantity > 1 ? (
							<span className="text-xs text-muted-foreground">
								{formatCurrencyBrl(line.unitPrice)} cada
							</span>
						) : null}
					</div>
					<div className="flex h-11 items-center overflow-hidden rounded-xl border">
						<button
							type="button"
							onClick={() => onQuantityChange(line.quantity - 1)}
							aria-label={`Diminuir quantidade de ${line.name}`}
							className="flex size-11 items-center justify-center bg-card text-foreground transition-colors hover:bg-surface"
						>
							<MinusIcon size={14} weight="bold" />
						</button>
						<span
							aria-live="polite"
							aria-label={`Quantidade: ${line.quantity}`}
							className="w-8 text-center font-mono text-sm"
						>
							{line.quantity}
						</span>
						<button
							type="button"
							onClick={() => onQuantityChange(line.quantity + 1)}
							disabled={line.quantity >= MAX_LINE_QUANTITY}
							aria-label={`Aumentar quantidade de ${line.name}`}
							className="flex size-11 items-center justify-center bg-card text-foreground transition-colors hover:bg-surface disabled:text-[#C4C3C8] disabled:hover:bg-card"
						>
							<PlusIcon size={14} weight="bold" />
						</button>
					</div>
				</div>
			</div>
		</>
	);
}

/** −/+ stepper of the mobile card (1 to the bag's per-piece cap). */
function Stepper({
	line,
	onQuantityChange,
}: {
	line: CartViewLine;
	onQuantityChange: (quantity: number) => void;
}) {
	return (
		<div className="flex h-11 items-center overflow-hidden rounded-xl border">
			<button
				type="button"
				onClick={() => onQuantityChange(line.quantity - 1)}
				aria-label={`Diminuir quantidade de ${line.name}`}
				className="flex size-11 items-center justify-center text-foreground"
			>
				<MinusIcon size={14} weight="bold" />
			</button>
			<span
				aria-live="polite"
				aria-label={`Quantidade: ${line.quantity}`}
				className="w-6 text-center font-mono text-sm"
			>
				{line.quantity}
			</span>
			<button
				type="button"
				onClick={() => onQuantityChange(line.quantity + 1)}
				disabled={line.quantity >= MAX_LINE_QUANTITY}
				aria-label={`Aumentar quantidade de ${line.name}`}
				className="flex size-11 items-center justify-center text-foreground disabled:text-[#C4C3C8]"
			>
				<PlusIcon size={14} weight="bold" />
			</button>
		</div>
	);
}

/** The line's stock note; the dispatch time is editorial (pendency #6). */
function stockNote(line: CartViewLine) {
	if (
		line.availability === 'OutOfStock' ||
		line.issue === 'InsufficientStock'
	) {
		return { label: 'Sem estoque', className: 'text-muted-foreground' };
	}
	if (line.availability === 'LowStock') {
		return {
			label: 'Últimas unidades · despacho em até 3 dias',
			className: 'text-clay',
		};
	}
	return {
		label: 'Em estoque · despacho em até 3 dias',
		className: 'text-success',
	};
}

export { CartLineItem };
