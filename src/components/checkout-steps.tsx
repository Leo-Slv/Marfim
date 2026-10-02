import { CheckIcon } from '@phosphor-icons/react/dist/ssr';
import Link from 'next/link';
import { Fragment } from 'react';

import { appRoutes } from '@/lib/routes/app-routes';
import { cn } from '@/lib/utils';

const steps = [
	{ key: 'cart', number: '01', label: 'Sacola', href: appRoutes.cart.index },
	{
		key: 'delivery',
		number: '02',
		label: 'Entrega',
		href: appRoutes.checkout.delivery,
	},
	{
		key: 'payment',
		number: '03',
		label: 'Pagamento',
		href: appRoutes.checkout.payment,
	},
] as const;

type CheckoutStep = (typeof steps)[number]['key'];

/**
 * "01 Sacola · 02 Entrega · 03 Pagamento" (Carrinho/Entrega/Pagamento).
 * Steps before `current` are done: green, with a check, linking back
 * (`hrefs` overrides a link, e.g. to keep the chosen addresses).
 */
function CheckoutSteps({
	current,
	hrefs = {},
}: {
	current: CheckoutStep;
	hrefs?: Partial<Record<CheckoutStep, string>>;
}) {
	const currentIndex = steps.findIndex((step) => step.key === current);

	return (
		<ol
			aria-label="Etapas da compra"
			className="flex flex-wrap items-center gap-3 font-mono text-xs tracking-[0.08em]"
		>
			{steps.map((step, index) => {
				const done = index < currentIndex;
				const active = index === currentIndex;
				const label = (
					<span
						className={cn(
							'font-sans text-sm tracking-normal',
							done || active ? 'font-medium' : 'text-ink-soft',
						)}
					>
						{step.label}
					</span>
				);

				return (
					<Fragment key={step.key}>
						{index > 0 ? (
							<li
								aria-hidden="true"
								className={cn(
									'h-px w-6 sm:w-10',
									index <= currentIndex ? 'bg-success' : 'bg-border',
								)}
							/>
						) : null}
						{done ? (
							<li>
								<Link
									href={hrefs[step.key] ?? step.href}
									className="flex h-8 items-center gap-2 rounded-full bg-success-soft px-3.5 text-success transition-colors hover:bg-success/15"
								>
									<CheckIcon size={12} weight="bold" />
									{label}
									<span className="sr-only"> (concluída)</span>
								</Link>
							</li>
						) : (
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
								{label}
							</li>
						)}
					</Fragment>
				);
			})}
		</ol>
	);
}

export type { CheckoutStep };
export { CheckoutSteps };
