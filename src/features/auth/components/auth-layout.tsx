'use client';

import { Suspense } from 'react';

import { StoreFooter } from '@/components/store-footer';
import { StoreHeader } from '@/components/store-header';
import { ProductArt } from '@/features/catalog/components/product-art';

const benefits = [
	'Acompanhe o pedido em tempo real',
	'Salve endereços de entrega e cobrança',
	'Veja o histórico de tudo que comprou',
];

/**
 * Acesso.dc.html's frame: indigo side panel + form column. Children read
 * `?next=`/`?token=`, so they render inside Suspense (Next 16 prerender).
 */
function AuthLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className="flex min-h-screen min-w-[360px] flex-col overflow-hidden bg-background">
			<StoreHeader />
			<main className="grow pt-12 pb-[72px]">
				<div className="mx-auto grid max-w-[1280px] grid-cols-1 items-stretch gap-x-8 px-5 min-[980px]:grid-cols-12 sm:px-10">
					<AuthSidePanel />
					<div className="flex flex-col justify-center min-[980px]:col-span-6 min-[980px]:col-start-7">
						<Suspense fallback={<div className="min-h-[420px]" />}>
							{children}
						</Suspense>
					</div>
				</div>
			</main>
			<StoreFooter />
		</div>
	);
}

function AuthSidePanel() {
	return (
		<div className="relative hidden min-h-[600px] animate-up flex-col justify-between overflow-hidden rounded-3xl bg-primary p-10 text-primary-foreground [animation-duration:.6s] min-[980px]:col-span-5 min-[980px]:flex">
			<svg
				className="absolute -top-[120px] -right-[140px] animate-spin-slow"
				width="460"
				height="460"
				viewBox="0 0 520 520"
				fill="none"
				aria-hidden="true"
			>
				<circle
					cx="260"
					cy="260"
					r="240"
					stroke="#FFFFFF"
					strokeOpacity=".2"
					strokeDasharray="3 9"
				/>
				<circle
					cx="260"
					cy="260"
					r="170"
					stroke="#FFFFFF"
					strokeOpacity=".14"
				/>
				<circle cx="260" cy="20" r="7" fill="#E8793A" />
			</svg>
			<div className="relative flex flex-col gap-3.5">
				<div className="font-mono text-[11px] tracking-[0.18em] text-primary-soft">
					SUA CONTA MARFIM
				</div>
				<div className="text-4xl leading-[1.08] font-light tracking-[-0.03em]">
					Cada peça,
					<br />
					<span className="font-medium">do ateliê até você.</span>
				</div>
			</div>
			<div className="relative flex size-[200px] animate-floaty items-center justify-center self-center rounded-full bg-white">
				<ProductArt kind="vase" size={120} />
			</div>
			<ol className="relative flex flex-col gap-3 text-[15px]">
				{benefits.map((benefit, index) => (
					<li key={benefit} className="flex items-center gap-3">
						<span className="w-6 font-mono text-xs text-primary-soft">
							{String(index + 1).padStart(2, '0')}
						</span>
						{benefit}
					</li>
				))}
			</ol>
		</div>
	);
}

export { AuthLayout };
