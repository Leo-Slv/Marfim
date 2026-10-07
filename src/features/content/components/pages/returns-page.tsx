import Link from 'next/link';

import { appRoutes } from '@/lib/routes/app-routes';

import { PageHeading, SoonNote } from '../content-ui';
import { OnThisPage } from '../sections-page';

const figures = [
	{
		value: '30',
		tone: 'text-primary',
		text: 'dias para pedir a troca ou devolução, a partir do recebimento',
	},
	{
		value: '100%',
		tone: '',
		text: 'do valor estornado no mesmo cartão da compra',
	},
	{
		value: 'R$ 0',
		tone: 'text-success',
		text: 'de cobrança real: os pagamentos desta loja são de teste',
	},
];

const index = [
	{ id: 'prazo', label: 'Prazo' },
	{ id: 'como', label: 'Como pedir' },
	{ id: 'condicoes', label: 'Condições' },
	{ id: 'estorno', label: 'Estorno' },
	{ id: 'cancelar', label: 'Cancelar antes do envio' },
];

/** 29 · Trocas e devoluções (model B with its own blocks). */
function ReturnsPage() {
	return (
		<>
			<PageHeading eyebrow="AJUDA" title="Trocas e" accent="devoluções" />
			<div className="mt-5 grid animate-up grid-cols-3 gap-2 [animation-delay:.12s] min-[980px]:mt-7 min-[980px]:gap-3">
				{figures.map((figure) => (
					<div
						key={figure.value}
						className="flex flex-col gap-1 rounded-2xl border bg-card px-2.5 py-3 min-[980px]:p-5"
					>
						<span
							className={`text-[28px] leading-none font-light tracking-[-0.03em] min-[980px]:text-[40px] ${figure.tone}`}
						>
							{figure.value}
						</span>
						<span className="text-[11px] leading-[1.35] text-ink-soft min-[980px]:text-sm">
							{figure.text}
						</span>
					</div>
				))}
			</div>

			<div className="mt-6 grid grid-cols-1 items-start gap-8 min-[980px]:mt-8 min-[980px]:grid-cols-[200px_minmax(0,1fr)]">
				<div className="hidden min-[980px]:block">
					<OnThisPage links={index} />
				</div>
				<div className="flex max-w-[680px] flex-col gap-6 text-[15px] leading-[1.6] text-ink-soft min-[980px]:gap-7 min-[980px]:text-base min-[980px]:leading-[1.7]">
					<Block id="prazo" title="Prazo">
						<p>
							Você tem 30 dias corridos a partir do recebimento para pedir a
							troca ou a devolução de qualquer peça, sem precisar justificar.
						</p>
					</Block>
					<Block id="como" title="Como pedir">
						<ol className="flex flex-col gap-3">
							<Step n="01">
								Entre em{' '}
								<Link href={appRoutes.account.orders}>Meus pedidos</Link> e abra
								o pedido.
							</Step>
							<Step n="02">
								Fale com o atendimento informando o número do pedido e a peça.
							</Step>
							<Step n="03">
								Embale a peça como chegou. Combinamos a coleta com você.
							</Step>
						</ol>
						<SoonNote className="mt-1">
							Pedir a troca direto pela página do pedido, e o atendimento por
							WhatsApp e e-mail.
						</SoonNote>
					</Block>
					<Block id="condicoes" title="Condições">
						<p>
							A peça precisa estar sem sinais de uso e com a embalagem original.
							Peças artesanais têm pequenas variações de cor e forma; isso faz
							parte do processo e não é defeito.
						</p>
					</Block>
					<Block id="estorno" title="Estorno">
						<p>
							Na devolução, o valor é estornado no mesmo cartão usado na compra
							assim que a peça chega ao ateliê. O prazo para aparecer na fatura
							depende do banco.
						</p>
					</Block>
					<Block id="cancelar" title="Cancelar antes do envio">
						<p>
							Enquanto o ateliê não começou o preparo, você cancela o pedido
							sozinho em{' '}
							<Link href={appRoutes.account.orders}>Meus pedidos</Link>. Depois
							disso, vale a troca ou devolução.
						</p>
					</Block>
				</div>
			</div>
		</>
	);
}

function Block({
	id,
	title,
	children,
}: {
	id: string;
	title: string;
	children: React.ReactNode;
}) {
	return (
		<div
			id={id}
			className="flex scroll-mt-6 flex-col gap-2 [&_a]:text-primary [&_a:hover]:text-primary-strong"
		>
			<h2 className="text-[19px] font-medium tracking-[-0.01em] text-foreground min-[980px]:text-[22px]">
				{title}
			</h2>
			{children}
		</div>
	);
}

function Step({ n, children }: { n: string; children: React.ReactNode }) {
	return (
		<li className="flex gap-3.5">
			<span className="pt-1 font-mono text-xs text-primary">{n}</span>
			<span>{children}</span>
		</li>
	);
}

export { ReturnsPage };
