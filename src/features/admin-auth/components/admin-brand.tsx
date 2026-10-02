import { cn } from '@/lib/utils';

/** marfim. wordmark + ADMIN badge (AdminLogin.dc.html, AdminNav). */
function AdminWordmark({ tone }: { tone: 'dark' | 'light' }) {
	return (
		<div className="flex items-center gap-2.5">
			<span className="flex size-[30px] items-center justify-center rounded-lg bg-primary">
				<svg
					width="14"
					height="14"
					viewBox="0 0 16 16"
					fill="none"
					stroke="#FFFFFF"
					strokeWidth="1.8"
					strokeLinecap="round"
					aria-hidden="true"
				>
					<circle cx="8" cy="8" r="5" />
					<path d="M8 3v10" />
				</svg>
			</span>
			<span className="text-[22px] font-medium tracking-[-0.02em]">
				marfim
				<span className={tone === 'dark' ? 'text-[#8F92FF]' : 'text-primary'}>
					.
				</span>
			</span>
			<span
				className={cn(
					'flex h-[22px] items-center rounded-full px-2 font-mono text-[10px] tracking-[0.1em]',
					tone === 'dark'
						? 'bg-background text-foreground'
						: 'bg-foreground text-background',
				)}
			>
				ADMIN
			</span>
		</div>
	);
}

const bars = [
	{ width: '100%', className: 'bg-primary', delay: '0s' },
	{ width: '62%', className: 'bg-primary opacity-75', delay: '.1s' },
	{ width: '78%', className: 'bg-warning', delay: '.2s' },
];

/**
 * The dark side of the admin sign-in: a pure illustration — the page is
 * public, so the mockup's sample numbers are left out (admin pendency #3).
 */
function AdminBrandPanel() {
	return (
		<div className="relative hidden flex-col justify-between overflow-hidden bg-foreground px-14 py-12 text-background min-[980px]:flex">
			<svg
				width="620"
				height="620"
				viewBox="0 0 520 520"
				fill="none"
				aria-hidden="true"
				className="absolute -top-[180px] -right-[220px] animate-[spin_60s_linear_infinite]"
			>
				<circle
					cx="260"
					cy="260"
					r="240"
					stroke="#3B3FD9"
					strokeOpacity=".5"
					strokeDasharray="3 9"
				/>
				<circle
					cx="260"
					cy="260"
					r="170"
					stroke="#FFFFFF"
					strokeOpacity=".08"
				/>
				<circle cx="260" cy="20" r="7" fill="#E8793A" />
			</svg>
			<div className="relative">
				<AdminWordmark tone="dark" />
			</div>
			<div className="relative flex flex-col gap-[18px]">
				<p className="text-[44px] leading-[1.08] font-light tracking-[-0.03em]">
					Pedidos, peças e ateliês
					<br />
					<span className="font-medium text-[#8F92FF]">num só painel.</span>
				</p>
				<div className="flex max-w-[420px] flex-col gap-3" aria-hidden="true">
					{bars.map((bar) => (
						<span
							key={bar.width}
							className="h-1.5 overflow-hidden rounded-full bg-[#2E2E33]"
						>
							<span
								className={cn(
									'block h-1.5 origin-left animate-bar rounded-full',
									bar.className,
								)}
								style={{ width: bar.width, animationDelay: bar.delay }}
							/>
						</span>
					))}
				</div>
			</div>
			<div className="relative font-mono text-[11px] tracking-[0.12em] text-muted-foreground">
				ACESSO RESTRITO À EQUIPE
			</div>
		</div>
	);
}

export { AdminBrandPanel, AdminWordmark };
