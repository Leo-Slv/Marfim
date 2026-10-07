'use client';

import { Suspense } from 'react';

import { StoreFooter } from '@/components/store-footer';
import { StoreHeader } from '@/components/store-header';
import { ProductArt } from '@/features/catalog/components/product-art';
import { appRoutes } from '@/lib/routes/app-routes';

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
			<StoreHeader mobileBack={{ href: appRoutes.system.home }} />
			<main className="grow pt-3.5 pb-10 min-[980px]:pt-12 min-[980px]:pb-[72px]">
				<div className="mx-auto grid max-w-[1280px] grid-cols-1 items-stretch gap-x-8 px-4 min-[980px]:grid-cols-12 sm:px-10">
					<AuthMobileBanner />
					<AuthSidePanel />
					<div className="flex flex-col justify-center pt-[22px] min-[980px]:col-span-6 min-[980px]:col-start-7 min-[980px]:pt-0">
						<Suspense fallback={<div className="min-h-[420px]" />}>
							{children}
						</Suspense>
					</div>
				</div>
			</main>
			<StoreFooter hideOnMobile />
		</div>
	);
}

/** Below 980 px: the dark banner of MobileAcesso.dc.html. */
function AuthMobileBanner() {
	return (
		<div className="relative flex h-24 items-center gap-3.5 overflow-hidden rounded-[18px] bg-foreground px-[18px] text-white min-[980px]:hidden">
			<svg
				className="absolute -top-[42px] -right-[50px] animate-spin-slow opacity-25"
				width="180"
				height="180"
				viewBox="0 0 200 200"
				fill="none"
				aria-hidden="true"
			>
				<circle
					cx="100"
					cy="100"
					r="80"
					stroke="#ECECFD"
					strokeDasharray="2 8"
				/>
				<circle
					cx="100"
					cy="100"
					r="54"
					stroke="#E8793A"
					strokeDasharray="1 6"
				/>
			</svg>
			<div className="relative z-10 flex grow flex-col gap-1">
				<span className="font-mono text-[10px] tracking-[0.16em] text-[#B9B8C2]">
					SUA CONTA MARFIM
				</span>
				<span className="text-lg leading-tight font-light">
					Cada peça, do ateliê
					<br />
					até você.
				</span>
			</div>
			<span className="relative z-10 flex animate-floaty">
				<ProductArt kind="vase" size={54} />
			</span>
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
