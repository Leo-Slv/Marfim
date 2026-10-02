import { ArrowRightIcon } from '@phosphor-icons/react';

import { Eyebrow } from '@/components/eyebrow';
import { cn } from '@/lib/utils';

import { formatAtelierProductsLine } from '../lib/atelier-products';
import { ateliers, type Atelier } from '../lib/ateliers';
import { AtelierArt } from './atelier-art';

type AteliersSectionProps = {
	selectedIndex: number;
	onSelect: (index: number) => void;
	/** Live product names of the selected atelier; null while loading. */
	productNames: readonly string[] | null;
};

/** Editorial atelier index + featured atelier card. */
function AteliersSection({
	selectedIndex,
	onSelect,
	productNames,
}: AteliersSectionProps) {
	const atelier = ateliers[selectedIndex];

	return (
		<section id="ateliers" className="pt-14 pb-6">
			<div className="mx-auto grid max-w-[1280px] grid-cols-1 items-stretch gap-x-6 gap-y-10 px-5 min-[980px]:grid-cols-12 sm:px-10">
				<AtelierCard
					key={atelier.num}
					atelier={atelier}
					productNames={productNames}
				/>
				<div className="flex flex-col justify-center min-[980px]:col-span-6 min-[980px]:col-start-7">
					<Eyebrow>QUEM FAZ AS PEÇAS</Eyebrow>
					<h2 className="mt-2.5 text-[40px] leading-[1.05] font-light tracking-[-0.03em]">
						Nada aqui sai{' '}
						<span className="font-medium text-primary">de fábrica</span>.
					</h2>
					<p className="mt-3.5 max-w-[460px] text-[15px] leading-[1.55] text-muted-foreground">
						Trabalhamos com quatro ateliês. Cada peça é feita, conferida e
						embalada por quem assina o acabamento.
					</p>
					<div className="mt-7 flex flex-col border-b">
						{ateliers.map((item, index) => {
							const selected = index === selectedIndex;
							return (
								<button
									key={item.num}
									type="button"
									onClick={() => onSelect(index)}
									aria-pressed={selected}
									className="group flex w-full items-baseline gap-[18px] border-t bg-transparent py-4 text-left text-foreground"
								>
									<span
										className={cn(
											'w-[22px] font-mono text-xs',
											selected ? 'text-primary' : 'text-muted-foreground',
										)}
									>
										{item.num}
									</span>
									<span
										className={cn(
											'inline-block grow text-[22px] tracking-[-0.02em] transition-[transform,color] duration-350 ease-[cubic-bezier(.2,.7,.2,1)] group-hover:translate-x-2 group-hover:text-primary sm:text-[26px]',
											selected ? 'font-medium text-primary' : 'font-light',
										)}
									>
										{item.name}
									</span>
									<span className="text-sm text-muted-foreground">
										{item.craft}
									</span>
									<span className="hidden w-[130px] text-right font-mono text-[11px] text-ink-soft min-[980px]:inline">
										{item.city}
									</span>
								</button>
							);
						})}
					</div>
				</div>
			</div>
		</section>
	);
}

function AtelierCard({
	atelier,
	productNames,
}: {
	atelier: Atelier;
	productNames: readonly string[] | null;
}) {
	return (
		<div
			className="relative h-[500px] animate-up overflow-hidden rounded-[20px] min-[980px]:col-span-5"
			style={{ background: atelier.tint }}
		>
			<div className="absolute inset-x-[22px] top-5 flex justify-between font-mono text-[11px] tracking-[0.14em] text-ink-soft">
				<span>ATELIÊ {atelier.num} / 04</span>
				<span>{atelier.city}</span>
			</div>
			<div className="absolute inset-x-0 top-12 flex h-60 animate-floaty items-center justify-center">
				<AtelierArt kind={atelier.art} />
			</div>
			<div className="absolute inset-x-3 bottom-3 flex flex-col gap-3 rounded-[14px] bg-card px-5 py-[18px]">
				<div className="text-[21px] font-medium tracking-[-0.015em]">
					{atelier.name}
				</div>
				<div className="grid grid-cols-2 gap-2.5 text-[13px]">
					<AtelierFact label="TÉCNICA" value={atelier.technique} />
					<AtelierFact label="MATÉRIA-PRIMA" value={atelier.material} />
				</div>
				<div className="flex items-center gap-3 border-t pt-3">
					<span className="grow text-[13px] text-ink-soft">
						{productNames ? formatAtelierProductsLine(productNames) : ' '}
					</span>
					<a
						href="#produtos"
						className="flex items-center gap-1.5 text-sm font-medium whitespace-nowrap text-primary hover:text-primary-strong"
					>
						Ver peças
						<ArrowRightIcon size={14} />
					</a>
				</div>
			</div>
		</div>
	);
}

function AtelierFact({ label, value }: { label: string; value: string }) {
	return (
		<div className="flex flex-col gap-0.5">
			<span className="font-mono text-[10px] tracking-[0.12em] text-muted-foreground">
				{label}
			</span>
			<span>{value}</span>
		</div>
	);
}

export { AteliersSection };
