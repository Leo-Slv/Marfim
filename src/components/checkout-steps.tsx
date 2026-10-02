import { Fragment } from 'react';

import { cn } from '@/lib/utils';

const steps = [
	{ key: 'cart', number: '01', label: 'Sacola' },
	{ key: 'delivery', number: '02', label: 'Entrega' },
	{ key: 'payment', number: '03', label: 'Pagamento' },
] as const;

type CheckoutStep = (typeof steps)[number]['key'];

/** "01 Sacola · 02 Entrega · 03 Pagamento" (Carrinho/Entrega/Pagamento). */
function CheckoutSteps({ current }: { current: CheckoutStep }) {
	return (
		<ol
			aria-label="Etapas da compra"
			className="flex items-center gap-3 font-mono text-xs tracking-[0.08em]"
		>
			{steps.map((step, index) => {
				const active = step.key === current;
				return (
					<Fragment key={step.key}>
						{index > 0 ? (
							<li aria-hidden="true" className="h-px w-6 bg-border sm:w-10" />
						) : null}
						<li
							aria-current={active ? 'step' : undefined}
							className={cn(
								'flex h-8 items-center gap-2 rounded-full px-3.5',
								active
									? 'bg-primary-soft text-primary'
									: 'bg-surface text-muted-foreground',
							)}
						>
							<span>{step.number}</span>
							<span
								className={cn(
									'font-sans text-sm tracking-normal',
									active ? 'font-medium' : 'text-ink-soft',
								)}
							>
								{step.label}
							</span>
						</li>
					</Fragment>
				);
			})}
		</ol>
	);
}

export type { CheckoutStep };
export { CheckoutSteps };
