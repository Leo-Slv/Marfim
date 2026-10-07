'use client';

import { useState } from 'react';

import { Eyebrow } from '@/components/eyebrow';
import { ProductArt } from '@/features/catalog/components/product-art';
import type { ProductArtKind } from '@/features/catalog/lib/product-visuals';
import { cn } from '@/lib/utils';

import { ateliers, type AtelierArtKind } from '../lib/ateliers';

/** The atelier drawings of the desktop card, as the store's piece drawings. */
const artKinds: Record<AtelierArtKind, ProductArtKind> = {
	clay: 'vase',
	wood: 'chair',
	light: 'pendant',
	loom: 'throw',
};

/**
 * "Quem faz as peças" below 980 px: the ateliers as an accordion
 * (MobileInicio.dc.html). The first one starts open.
 */
function AteliersAccordion() {
	const [openIndex, setOpenIndex] = useState<number | null>(0);

	return (
		<section className="flex flex-col gap-3 px-4 pt-7 pb-2 min-[980px]:hidden">
			<Eyebrow className="text-[10px] tracking-[0.18em]">
				QUEM FAZ AS PEÇAS
			</Eyebrow>
			<h2 className="text-[28px] leading-[1.1] font-light tracking-[-0.02em]">
				Nada aqui sai <b className="font-medium text-primary">de fábrica</b>.
			</h2>
			<div className="flex flex-col border-b">
				{ateliers.map((atelier, index) => {
					const open = openIndex === index;
					return (
						<button
							key={atelier.num}
							type="button"
							aria-expanded={open}
							onClick={() => setOpenIndex(open ? null : index)}
							className="flex flex-col gap-2.5 border-t py-3.5 text-left text-foreground"
						>
							<span className="flex w-full items-baseline gap-3">
								<span
									className={cn(
										'font-mono text-[11px]',
										open ? 'text-primary' : 'text-muted-foreground',
									)}
								>
									{atelier.num}
								</span>
								<span
									className={cn(
										'grow text-[22px]',
										open ? 'font-medium text-primary' : 'font-light',
									)}
								>
									{atelier.name}
								</span>
								<span className="text-[13px] text-muted-foreground">
									{atelier.craft}
								</span>
							</span>
							{open ? (
								<span className="flex animate-fade-in items-center gap-3">
									<span
										className="flex size-[72px] shrink-0 items-center justify-center rounded-xl"
										style={{ background: atelier.tint }}
									>
										<ProductArt kind={artKinds[atelier.art]} size={44} />
									</span>
									<span className="text-[13px] leading-normal text-ink-soft">
										{atelier.city} · {atelier.technique}.
									</span>
								</span>
							) : null}
						</button>
					);
				})}
			</div>
		</section>
	);
}

export { AteliersAccordion };
