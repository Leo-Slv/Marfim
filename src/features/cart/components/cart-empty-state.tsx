import Link from 'next/link';

import { appRoutes } from '@/lib/routes/app-routes';

function CartEmptyState() {
	return (
		<div className="flex animate-up flex-col items-center gap-4 rounded-[20px] border bg-card px-8 py-14 text-center">
			<div className="flex animate-floaty">
				<svg
					className="line-draw"
					width="120"
					height="120"
					viewBox="0 0 24 24"
					fill="none"
					stroke="#3B3FD9"
					strokeWidth="0.8"
					strokeLinejoin="round"
					aria-hidden="true"
				>
					<path d="M5 8h14l-1 12H6L5 8Z" />
					<path d="M9 8V6a3 3 0 0 1 6 0v2" />
				</svg>
			</div>
			<h2 className="text-[26px] font-light tracking-[-0.02em]">
				Sua sacola está vazia
			</h2>
			<p className="max-w-[360px] text-[15px] text-muted-foreground">
				As peças dos ateliês esperam por você. Que tal começar pelos escolhidos
				da semana?
			</p>
			<Link
				href={appRoutes.system.home}
				className="mt-2 flex h-12 items-center rounded-xl bg-primary px-[22px] text-[15px] font-medium text-primary-foreground transition-[background-color,transform] duration-200 hover:-translate-y-px hover:bg-primary-strong"
			>
				Ver a loja
			</Link>
		</div>
	);
}

export { CartEmptyState };
