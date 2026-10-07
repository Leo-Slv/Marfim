import Link from 'next/link';

import { ProductArt } from '@/features/catalog/components/product-art';
import { appRoutes } from '@/lib/routes/app-routes';

import { principles } from '../../lib/content-copy';
import { Lead, PageHeading } from '../content-ui';

/** 25 · Nossa história (model A). */
function StoryPage() {
	return (
		<>
			<PageHeading
				eyebrow="NOSSA HISTÓRIA"
				title="Uma loja pequena para quem"
				accent="faz devagar"
				after="."
				large
			/>
			<Lead>
				A Marfim junta num só lugar peças feitas à mão por gente que assina o
				próprio trabalho. É uma loja de demonstração: os ateliês e as peças são
				fictícios, e os pedidos e pagamentos usam o modo de teste do Stripe, sem
				cobrança real.
			</Lead>

			<div className="mt-6 grid animate-up grid-cols-1 gap-4 [animation-delay:.18s] min-[980px]:mt-10 min-[980px]:grid-cols-2">
				<div className="relative flex h-[220px] items-center justify-center overflow-hidden rounded-[18px] bg-primary-soft min-[980px]:h-[340px] min-[980px]:rounded-[20px]">
					<svg
						aria-hidden="true"
						viewBox="0 0 520 520"
						fill="none"
						className="absolute size-[260px] animate-spin-slow min-[980px]:size-[380px]"
					>
						<circle
							cx="260"
							cy="260"
							r="240"
							stroke="#3B3FD9"
							strokeOpacity=".2"
							strokeDasharray="3 9"
						/>
						<circle cx="260" cy="20" r="7" fill="#E8793A" />
					</svg>
					<div className="flex animate-floaty">
						<ProductArt kind="vase" size={130} />
					</div>
					<span className="absolute bottom-4 left-4 flex h-7 items-center rounded-full bg-white px-3 font-mono text-[11px] tracking-[0.1em] text-ink-soft">
						ESTÚDIO BARRO CRU · CERÂMICA
					</span>
				</div>
				<div className="flex flex-col justify-between gap-6 rounded-[18px] bg-foreground p-[18px] text-background min-[980px]:h-[340px] min-[980px]:rounded-[20px] min-[980px]:border min-[980px]:bg-card min-[980px]:p-8 min-[980px]:text-foreground">
					<div className="text-xl leading-[1.35] font-light min-[980px]:text-[26px] min-[980px]:leading-[1.3] min-[980px]:tracking-[-0.02em]">
						“Peças feitas devagar merecem uma loja feita com o mesmo cuidado.”
					</div>
					<span className="font-mono text-[10px] tracking-[0.14em] text-[#B9B8C2] min-[980px]:text-[11px] min-[980px]:text-muted-foreground">
						MARFIM · LOJA DE DEMONSTRAÇÃO
					</span>
				</div>
			</div>

			<div className="mt-6 flex flex-col min-[980px]:mt-14">
				{principles.map((principle) => (
					<div
						key={principle.n}
						className="grid grid-cols-[36px_minmax(0,1fr)] gap-x-2.5 gap-y-1 border-t py-3.5 min-[980px]:grid-cols-[80px_minmax(0,1fr)_minmax(0,1.4fr)] min-[980px]:items-baseline min-[980px]:gap-6 min-[980px]:py-7"
					>
						<span className="row-span-2 font-mono text-xs text-primary min-[980px]:row-span-1 min-[980px]:text-[13px]">
							{principle.n}
						</span>
						<span className="text-[17px] font-medium min-[980px]:text-[26px] min-[980px]:font-light min-[980px]:tracking-[-0.02em]">
							{principle.title}
						</span>
						<span className="text-sm leading-normal text-ink-soft min-[980px]:text-base min-[980px]:leading-[1.6]">
							{principle.text}
						</span>
					</div>
				))}
			</div>

			<div className="mt-4 flex flex-col gap-4 rounded-[20px] min-[980px]:mt-8 min-[980px]:flex-row min-[980px]:flex-wrap min-[980px]:items-center min-[980px]:gap-6 min-[980px]:bg-primary min-[980px]:px-10 min-[980px]:py-9 min-[980px]:text-primary-foreground">
				<div className="hidden grow flex-col gap-2 min-[980px]:flex">
					<span className="font-mono text-[11px] tracking-[0.18em] text-primary-soft">
						QUEM FAZ AS PEÇAS
					</span>
					<span className="text-3xl font-light tracking-[-0.02em]">
						Conheça os quatro ateliês parceiros
					</span>
				</div>
				<Link
					href={appRoutes.content.page('ateliers')}
					className="flex h-12 items-center justify-center rounded-xl border bg-card px-[22px] text-[15px] font-medium text-foreground min-[980px]:border-0 min-[980px]:bg-white min-[980px]:text-primary-strong"
				>
					<span className="min-[980px]:hidden">
						Conheça os quatro ateliês ›
					</span>
					<span className="hidden min-[980px]:inline">Ver ateliês</span>
				</Link>
			</div>
		</>
	);
}

export { StoryPage };
