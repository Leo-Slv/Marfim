'use client';

import { useEffect, useState } from 'react';

import { countdownToEndOfSunday } from '../lib/countdown';

const PLACEHOLDER_PARTS = [
	{ value: '--', label: 'DIAS' },
	{ value: '--', label: 'HORAS' },
	{ value: '--', label: 'MIN' },
	{ value: '--', label: 'SEG' },
];

/** "Semana do design" banner — editorial copy (backend pendency #7). */
function PromoBanner() {
	// Null until mounted: the server can't know the visitor's clock, so the
	// countdown starts client-side to avoid a hydration mismatch.
	const [now, setNow] = useState<Date | null>(null);

	useEffect(() => {
		const tick = () => setNow(new Date());
		const first = setTimeout(tick, 0);
		const interval = setInterval(tick, 1000);
		return () => {
			clearTimeout(first);
			clearInterval(interval);
		};
	}, []);

	const parts = now ? countdownToEndOfSunday(now) : PLACEHOLDER_PARTS;

	return (
		<section className="py-6">
			<div className="mx-auto max-w-[1280px] px-5 sm:px-10">
				<div className="relative flex flex-wrap items-center gap-x-9 gap-y-6 overflow-hidden rounded-[20px] bg-primary px-6 py-9 text-primary-foreground min-[980px]:flex-nowrap sm:px-10">
					<svg
						className="absolute -top-[110px] -right-20 animate-spin-slow"
						width="340"
						height="340"
						viewBox="0 0 420 420"
						fill="none"
						aria-hidden="true"
					>
						<circle
							cx="210"
							cy="210"
							r="200"
							stroke="#FFFFFF"
							strokeOpacity=".18"
							strokeDasharray="3 10"
						/>
						<circle
							cx="210"
							cy="210"
							r="140"
							stroke="#FFFFFF"
							strokeOpacity=".12"
						/>
						<circle cx="210" cy="10" r="7" fill="#E8793A" />
					</svg>
					<div className="relative flex grow flex-col gap-2.5">
						<div className="font-mono text-[11px] tracking-[0.18em] text-primary-soft">
							SEMANA DO DESIGN
						</div>
						<div className="text-[34px] leading-[1.1] font-light tracking-[-0.025em]">
							Até <span className="font-medium">20% off</span> em iluminação
						</div>
						<div className="text-[15px] text-primary-soft">
							Válido para peças selecionadas até domingo, 23h59.
						</div>
					</div>
					<div
						className="relative flex gap-2"
						role="timer"
						aria-label="Tempo restante da promoção"
					>
						{parts.map((part) => (
							<div
								key={part.label}
								className="flex h-[72px] w-16 flex-col items-center justify-center gap-0.5 rounded-xl bg-primary-strong"
							>
								<span className="font-mono text-2xl font-medium tabular-nums">
									{part.value}
								</span>
								<span className="font-mono text-[10px] tracking-[0.12em] text-primary-soft">
									{part.label}
								</span>
							</div>
						))}
					</div>
					<a
						href="#produtos"
						className="relative flex h-12 items-center rounded-xl bg-white px-[22px] text-[15px] font-medium text-primary-strong"
					>
						Aproveitar
					</a>
				</div>
			</div>
		</section>
	);
}

export { PromoBanner };
