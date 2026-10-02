import { ComingSoonBadge } from '@/components/coming-soon-badge';
import { cn } from '@/lib/utils';

/** A lettered card of the delivery step ("A · Endereço de entrega"). */
function CheckoutSection({
	letter,
	title,
	action,
	className,
	children,
}: {
	letter: string;
	title: string;
	action?: React.ReactNode;
	className?: string;
	children: React.ReactNode;
}) {
	return (
		<section
			aria-labelledby={`checkout-section-${letter}`}
			className={cn(
				'flex animate-up flex-col gap-4 rounded-[20px] border bg-card p-6 [animation-duration:.6s]',
				className,
			)}
		>
			<div className="flex items-center gap-3">
				<span className="font-mono text-xs text-primary">{letter}</span>
				<h2
					id={`checkout-section-${letter}`}
					className="grow text-xl font-medium"
				>
					{title}
				</h2>
				{action}
			</div>
			{children}
		</section>
	);
}

/** "C · Frete e prazo" — EM BREVE (delivery pendency #1). */
function ShippingComingSoon() {
	return (
		<div className="flex flex-col gap-3 rounded-[20px] border border-dashed bg-card px-6 py-5">
			<div className="flex items-center gap-3">
				<span className="font-mono text-xs text-muted-foreground">C</span>
				<h2 className="grow text-xl font-medium text-muted-foreground">
					Frete e prazo
				</h2>
				<ComingSoonBadge />
			</div>
			<p className="text-sm leading-normal text-muted-foreground">
				A escolha de entrega econômica ou expressa, com prazo por CEP, chega em
				breve. Por enquanto o pedido não tem custo de frete.
			</p>
		</div>
	);
}

export { CheckoutSection, ShippingComingSoon };
