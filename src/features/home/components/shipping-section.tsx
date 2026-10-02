import { Eyebrow } from '@/components/eyebrow';

import type { Atelier } from '../lib/ateliers';

const facts = [
	{
		value: '3 DIAS',
		text: 'É o prazo máximo para o ateliê embalar e despachar. Peças sob encomenda avisam o prazo na página.',
	},
	{
		value: '0 g',
		text: 'de plástico na embalagem: papel kraft, palha e fita de algodão, tudo reaproveitável.',
	},
	{
		value: '30 DIAS',
		text: 'para trocar ou devolver. A coleta fica por nossa conta.',
	},
];

// Widths of the decorative barcode's bars and gaps, from the mockup.
const barcode = [
	[0, 3],
	[6, 1],
	[10, 2],
	[15, 4],
	[22, 1],
	[26, 2],
	[31, 1],
	[35, 3],
	[41, 2],
	[46, 1],
	[50, 4],
	[57, 1],
	[61, 2],
	[66, 3],
	[72, 1],
	[76, 2],
	[81, 1],
	[85, 4],
	[92, 2],
	[97, 1],
	[101, 3],
	[107, 1],
	[111, 2],
	[116, 4],
	[123, 1],
	[127, 3],
	[133, 1],
	[137, 2],
	[142, 1],
	[146, 4],
	[153, 2],
	[158, 1],
	[162, 3],
	[168, 1],
	[172, 2],
	[177, 4],
	[184, 1],
	[188, 2],
	[193, 1],
	[197, 3],
] as const;

type ShippingSectionProps = {
	atelier: Atelier;
	/** First live product of the selected atelier; null while loading/none. */
	firstProductName: string | null;
};

/** "Do ateliê à sua porta" facts + the swinging shipping label. */
function ShippingSection({ atelier, firstProductName }: ShippingSectionProps) {
	return (
		<section className="pt-14 pb-[72px]">
			<div className="mx-auto grid max-w-[1280px] grid-cols-1 items-center gap-x-6 gap-y-10 px-5 min-[980px]:grid-cols-12 sm:px-10">
				<div className="flex flex-col min-[980px]:col-span-6">
					<Eyebrow>DO ATELIÊ À SUA PORTA</Eyebrow>
					<h2 className="mt-2.5 text-[40px] leading-[1.05] font-light tracking-[-0.03em]">
						Sai da bancada,{' '}
						<span className="font-medium">chega na sua mesa.</span>
					</h2>
					<div className="mt-8 flex flex-col gap-[22px]">
						{facts.map((fact) => (
							<div key={fact.value} className="flex items-baseline gap-[18px]">
								<span className="w-[60px] shrink-0 font-mono text-xs text-primary">
									{fact.value}
								</span>
								<span className="text-base leading-normal text-ink-soft">
									{fact.text}
								</span>
							</div>
						))}
					</div>
				</div>

				<div className="flex flex-col items-center min-[980px]:col-span-5 min-[980px]:col-start-8">
					<svg
						width="2"
						height="56"
						viewBox="0 0 2 56"
						className="block"
						aria-hidden="true"
					>
						<path
							d="M1 0v56"
							stroke="#B4501E"
							strokeWidth="1.5"
							strokeDasharray="2 3"
						/>
					</svg>
					<div className="relative w-full max-w-[380px] origin-[50%_-56px] animate-swing rounded-[18px] border bg-card font-mono text-foreground shadow-[0_26px_50px_-28px_rgba(24,24,27,.25)]">
						<span className="absolute -top-2 left-1/2 -ml-[7px] size-3.5 rounded-full border-[1.5px] border-clay bg-background" />
						<div className="flex items-start justify-between px-6 pt-[26px] pb-4">
							<div className="flex flex-col gap-1">
								<span className="text-[10px] tracking-[0.14em] text-muted-foreground">
									ETIQUETA DE ENVIO
								</span>
								<span className="font-sans text-[19px] font-medium">
									marfim<span className="text-primary">.</span>
								</span>
							</div>
							<span className="-rotate-8 rounded-[7px] border-[1.5px] border-clay px-[9px] py-[5px] text-xs tracking-[0.16em] text-clay">
								FRÁGIL
							</span>
						</div>
						<div className="border-t-[1.5px] border-dashed" />
						<dl
							key={atelier.num}
							className="grid animate-up grid-cols-[96px_minmax(0,1fr)] gap-y-2.5 px-6 py-4 text-xs"
						>
							<dt className="text-muted-foreground">DE</dt>
							<dd>
								{atelier.name} · {atelier.city}
							</dd>
							<dt className="text-muted-foreground">PARA</dt>
							<dd>Você</dd>
							<dt className="text-muted-foreground">CONTEÚDO</dt>
							<dd>{firstProductName ?? '—'}</dd>
							<dt className="text-muted-foreground">EMBALAGEM</dt>
							<dd>Kraft · palha · algodão</dd>
							<dt className="text-muted-foreground">DESPACHO</dt>
							<dd className="text-success">Até 3 dias úteis</dd>
						</dl>
						<div className="border-t-[1.5px] border-dashed" />
						<div className="flex items-end justify-between gap-3 px-6 pt-4 pb-5">
							<svg
								width="170"
								height="38"
								viewBox="0 0 200 44"
								aria-hidden="true"
							>
								<g fill="#18181B">
									{barcode.map(([x, width]) => (
										<rect key={x} x={x} width={width} height="44" />
									))}
								</g>
							</svg>
							<span className="text-[11px] text-muted-foreground">
								{atelier.code}
							</span>
						</div>
					</div>
					<div className="mt-5 text-center font-mono text-[11px] tracking-[0.06em] text-muted-foreground">
						ESCOLHA UM ATELIÊ ACIMA PARA VER A ETIQUETA
					</div>
				</div>
			</div>
		</section>
	);
}

export { ShippingSection };
