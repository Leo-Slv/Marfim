'use client';

import { CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react';
import { useState } from 'react';

import { ProductArt } from '@/features/catalog/components/product-art';
import type { ProductVisual } from '@/features/catalog/lib/product-visuals';
import { cn } from '@/lib/utils';

import { galleryViews } from '../lib/product-content';

/**
 * The piece in a few views of its drawing (photos aren't stored by design):
 * thumbnails select the big view.
 */
function ProductGallery({
	visual,
	name,
	discount,
}: {
	visual: ProductVisual;
	name: string;
	/** "-20%" when on sale. */
	discount: string | null;
}) {
	const views = galleryViews(visual);
	const [selected, setSelected] = useState(0);
	const view = views[Math.min(selected, views.length - 1)];

	function go(delta: number) {
		setSelected((current) => (current + delta + views.length) % views.length);
	}

	return (
		<>
			{/* Below 720 px: full-width view with arrows and dots (MobileProduto). */}
			<div className="relative -mx-4 min-[720px]:hidden">
				<div
					key={view.id}
					className="relative flex h-[400px] animate-fade-in items-center justify-center overflow-hidden"
					style={{ background: view.background }}
					aria-roledescription="carrossel"
					aria-label={`Vistas de ${name}: ${view.label}`}
				>
					{view.lit ? (
						<div
							aria-hidden="true"
							className="absolute top-[58%] left-1/2 -mt-[140px] -ml-[140px] size-[280px] animate-glow rounded-full"
							style={{
								background:
									'radial-gradient(circle, rgba(232,121,58,.55) 0, rgba(232,121,58,0) 65%)',
							}}
						/>
					) : null}
					<div className="relative flex animate-floaty">
						<ProductArt
							kind={visual.kind}
							size={Math.round(view.size * 0.7)}
							lit={view.lit}
							className="max-w-none"
						/>
					</div>
				</div>
				{discount ? (
					<span className="absolute top-3 left-3 flex h-[26px] items-center rounded-full bg-success-soft px-2.5 font-mono text-[11px] text-success">
						{discount}
					</span>
				) : null}
				<button
					type="button"
					onClick={() => go(-1)}
					aria-label="Vista anterior"
					className="absolute top-[178px] left-2 flex size-11 items-center justify-center rounded-full bg-white/90"
				>
					<CaretLeftIcon size={18} />
				</button>
				<button
					type="button"
					onClick={() => go(1)}
					aria-label="Próxima vista"
					className="absolute top-[178px] right-2 flex size-11 items-center justify-center rounded-full bg-white/90"
				>
					<CaretRightIcon size={18} />
				</button>
				<div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
					{views.map((item, index) => (
						<button
							key={item.id}
							type="button"
							onClick={() => setSelected(index)}
							aria-label={item.label}
							aria-current={index === selected ? 'true' : undefined}
							className={cn(
								'h-2 rounded-full transition-[width] duration-200',
								index === selected
									? 'w-[22px] bg-primary'
									: 'w-2 bg-foreground/25',
							)}
						/>
					))}
				</div>
			</div>
			<div className="hidden animate-up flex-col-reverse gap-3 min-[720px]:grid min-[720px]:grid-cols-[88px_minmax(0,1fr)]">
				<div
					role="tablist"
					aria-label={`Vistas de ${name}`}
					className="flex gap-2.5 min-[720px]:flex-col"
				>
					{views.map((item, index) => (
						<button
							key={item.id}
							type="button"
							role="tab"
							aria-selected={index === selected}
							aria-label={item.label}
							onClick={() => setSelected(index)}
							className={cn(
								'flex size-[72px] shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 transition-[border-color,transform] hover:-translate-y-0.5 min-[720px]:size-[88px]',
								index === selected ? 'border-primary' : 'border-transparent',
							)}
							style={{ background: item.background }}
						>
							<ProductArt
								kind={visual.kind}
								size={item.thumbSize}
								lit={item.lit}
							/>
						</button>
					))}
				</div>
				<div
					key={view.id}
					role="tabpanel"
					aria-label={view.label}
					className="relative flex h-[380px] animate-fade-in items-center justify-center overflow-hidden rounded-[20px] min-[980px]:h-[560px]"
					style={{ background: view.background }}
				>
					{view.lit ? (
						<div
							aria-hidden="true"
							className="absolute top-[58%] left-1/2 -mt-[180px] -ml-[180px] size-[360px] animate-glow rounded-full"
							style={{
								background:
									'radial-gradient(circle, rgba(232,121,58,.55) 0, rgba(232,121,58,0) 65%)',
							}}
						/>
					) : null}
					<div className="relative flex animate-floaty">
						<ProductArt
							kind={visual.kind}
							size={view.size}
							lit={view.lit}
							detailed={view.id === 'frente'}
							className="max-w-none"
						/>
					</div>
					<span className="absolute bottom-4 left-4 flex h-7 items-center rounded-full bg-white px-3 font-mono text-[11px] tracking-[0.1em] text-ink-soft">
						{view.caption}
					</span>
					{discount ? (
						<span className="absolute top-4 left-4 flex h-7 items-center rounded-full bg-success-soft px-3 font-mono text-xs text-success">
							{discount}
						</span>
					) : null}
				</div>
			</div>
		</>
	);
}

export { ProductGallery };
