import { ComingSoonBadge } from '@/components/coming-soon-badge';

import { sellCriteria, sellSteps } from '../../lib/content-copy';
import { Lead, PageHeading } from '../content-ui';

/** 27 · Venda com a gente (model A). */
function SellPage() {
	return (
		<>
			<PageHeading
				eyebrow="VENDA COM A GENTE"
				title="Você faz. A gente"
				accent="leva até a casa"
				after=" das pessoas."
				large
			/>
			<Lead>
				Procuramos ateliês pequenos que trabalham à mão. Cuidamos da loja, do
				pagamento e do atendimento; você cuida das peças. Nesta loja de
				demonstração, o cadastro de novos ateliês ainda não está aberto.
			</Lead>

			<div className="mt-6 grid grid-cols-1 gap-3 min-[980px]:mt-10 min-[980px]:grid-cols-3">
				{sellCriteria.map((criterion, index) => (
					<div
						key={criterion.n}
						className="flex animate-up flex-col gap-1 rounded-2xl border bg-card p-3.5 min-[980px]:gap-2 min-[980px]:p-[22px]"
						style={{ animationDelay: `${(index * 0.06).toFixed(2)}s` }}
					>
						<span className="font-mono text-xs text-primary">
							{criterion.n}
						</span>
						<span className="text-[17px] font-medium min-[980px]:text-xl">
							{criterion.title}
						</span>
						<span className="text-sm leading-[1.55] text-ink-soft">
							{criterion.text}
						</span>
					</div>
				))}
			</div>

			<div className="mt-8 flex flex-col min-[980px]:mt-10">
				<span className="pb-3 font-mono text-[10px] tracking-[0.16em] text-muted-foreground min-[980px]:text-[11px]">
					COMO FUNCIONA
				</span>
				{sellSteps.map((step) => (
					<div
						key={step.n}
						className="flex gap-3 py-2 min-[980px]:grid min-[980px]:grid-cols-[60px_minmax(0,1fr)] min-[980px]:items-baseline min-[980px]:gap-4 min-[980px]:border-t min-[980px]:py-[18px]"
					>
						<span className="flex size-[30px] shrink-0 items-center justify-center rounded-full bg-primary-soft font-mono text-xs text-primary min-[980px]:size-auto min-[980px]:justify-start min-[980px]:bg-transparent min-[980px]:font-sans min-[980px]:text-[32px] min-[980px]:font-light">
							{step.n}
						</span>
						<span className="flex flex-col gap-1">
							<b className="text-base font-medium min-[980px]:text-[17px]">
								{step.title}
							</b>
							<span className="text-sm leading-[1.55] text-ink-soft min-[980px]:text-[15px]">
								{step.text}
							</span>
						</span>
					</div>
				))}
			</div>

			<div className="mt-6 flex flex-col gap-2.5 rounded-[18px] bg-primary p-[18px] text-primary-foreground min-[980px]:flex-row min-[980px]:flex-wrap min-[980px]:items-center min-[980px]:gap-6 min-[980px]:rounded-[20px] min-[980px]:px-9 min-[980px]:py-8">
				<div className="flex grow flex-col gap-1.5">
					<span className="text-xl font-medium min-[980px]:text-[26px] min-[980px]:font-light">
						Mande seu portfólio
					</span>
					<span className="text-sm leading-normal text-primary-soft">
						Fotos das peças, cidade, técnica e capacidade de produção por mês.
					</span>
				</div>
				<span
					aria-disabled="true"
					className="flex h-12 items-center justify-center gap-2.5 rounded-xl bg-white/90 px-[22px] text-[15px] font-medium text-primary-strong opacity-80"
				>
					E-mail para ateliês
					<ComingSoonBadge />
				</span>
			</div>
		</>
	);
}

export { SellPage };
