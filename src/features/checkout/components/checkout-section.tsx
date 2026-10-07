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
				// Below 980 px the content sits on the page, without the card
				// (MobileCheckout.dc.html).
				'flex animate-up flex-col gap-3 [animation-duration:.6s] min-[980px]:gap-4 min-[980px]:rounded-[20px] min-[980px]:border min-[980px]:bg-card min-[980px]:p-6',
				className,
			)}
		>
			<div className="flex items-center gap-3">
				<span className="hidden font-mono text-xs text-primary min-[980px]:inline">
					{letter}
				</span>
				<h2
					id={`checkout-section-${letter}`}
					className="grow text-base font-medium min-[980px]:text-xl"
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
		<>
			<div className="flex items-center gap-2 rounded-[14px] border border-dashed px-3.5 py-3 text-[13px] text-muted-foreground min-[980px]:hidden">
				Frete e prazo por CEP
				<ComingSoonBadge />
			</div>
			<div className="hidden flex-col gap-3 rounded-[20px] border border-dashed bg-card px-6 py-5 min-[980px]:flex">
				<div className="flex items-center gap-3">
					<span className="font-mono text-xs text-muted-foreground">C</span>
					<h2 className="grow text-xl font-medium text-muted-foreground">
						Frete e prazo
					</h2>
					<ComingSoonBadge />
				</div>
				<p className="text-sm leading-normal text-muted-foreground">
					A escolha de entrega econômica ou expressa, com prazo por CEP, chega
					em breve. Por enquanto o pedido não tem custo de frete.
				</p>
			</div>
		</>
	);
}

export { CheckoutSection, ShippingComingSoon };
