import { env } from '@/lib/env';

const testCards = [
	['4242 4242 4242 4242', 'aprova o pagamento'],
	['4000 0000 0000 0002', 'recusa o pagamento'],
	['4000 0025 0000 3155', 'pede a verificação 3-D Secure'],
] as const;

/** Demonstration store only: which Stripe test cards to type. */
function TestCardHint() {
	if (!env.demoStore) {
		return null;
	}

	return (
		<div
			role="note"
			className="flex flex-col gap-2 rounded-2xl border border-dashed bg-surface px-4 py-3.5 text-[13px] text-ink-soft"
		>
			<span className="font-medium text-foreground">
				Pagamento de teste — não use um cartão real.
			</span>
			<ul className="flex flex-col gap-1">
				{testCards.map(([number, effect]) => (
					<li key={number}>
						<span className="font-mono text-xs text-foreground">{number}</span>{' '}
						{effect}
					</li>
				))}
			</ul>
			<span className="text-xs text-muted-foreground">
				Qualquer validade futura e qualquer CVC.
			</span>
		</div>
	);
}

export { TestCardHint };
