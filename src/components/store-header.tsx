'use client';

import {
	HandbagIcon,
	MagnifyingGlassIcon,
	UserIcon,
} from '@phosphor-icons/react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

import { useCart } from '@/features/cart/hooks/use-cart';
import { useCategories } from '@/features/catalog/hooks/catalog.queries';
import { appRoutes } from '@/lib/routes/app-routes';
import { cn } from '@/lib/utils';

const promises = [
	'TROCA FÁCIL EM 30 DIAS',
	'PEÇAS FEITAS À MÃO POR QUATRO ATELIÊS',
	'COLEÇÃO OUTONO 2026',
];

/** Storefront header from Docs/design/mockups/Header.dc.html. */
function StoreHeader() {
	const { count } = useCart();

	return (
		<div className="w-full bg-background">
			<div className="flex h-9 items-center justify-center gap-7 overflow-hidden bg-primary font-mono text-[11px] tracking-[0.08em] whitespace-nowrap text-primary-foreground">
				{promises.map((promise, index) => (
					<span key={promise} className="contents">
						{index > 0 ? <span aria-hidden="true">·</span> : null}
						<span className={cn(index > 0 && 'hidden md:inline')}>
							{promise}
						</span>
					</span>
				))}
			</div>
			<header className="border-b">
				<div className="mx-auto flex h-[72px] max-w-[1280px] items-center gap-10 px-5 sm:px-10">
					<Link
						href={appRoutes.system.home}
						className="flex items-center gap-2 text-foreground"
					>
						<span className="flex size-7 items-center justify-center rounded-lg bg-primary">
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
						<span className="text-xl font-medium tracking-[-0.02em]">
							marfim<span className="text-primary">.</span>
						</span>
					</Link>
					<Suspense fallback={<CategoryNavLinks activeSlug={null} />}>
						<CategoryNav />
					</Suspense>
					<div className="grow" />
					<Link
						href={appRoutes.products.search()}
						className="hidden h-10 w-60 items-center gap-2 rounded-xl border bg-card px-3.5 text-sm text-muted-foreground min-[980px]:flex"
					>
						<MagnifyingGlassIcon size={16} />
						Buscar produtos
					</Link>
					<div className="flex gap-1.5">
						<Link
							href={appRoutes.auth.login}
							aria-label="Entrar"
							className="flex h-11 min-w-11 items-center justify-center gap-2 rounded-xl px-2.5 text-sm text-foreground transition-colors hover:bg-surface-2"
						>
							<UserIcon size={19} />
							<span className="hidden min-[980px]:inline">Entrar</span>
						</Link>
						<Link
							href={appRoutes.cart.index}
							aria-label={`Sacola, ${count} itens`}
							className="flex h-11 items-center gap-2 rounded-xl border bg-card pr-3 pl-2.5 text-sm text-foreground transition-colors hover:bg-surface-2"
						>
							<HandbagIcon size={19} />
							<span>Sacola</span>
							<span
								key={count}
								className={cn(
									'flex h-5 min-w-5 animate-pop items-center justify-center rounded-full px-1.5 font-mono text-[11px]',
									count > 0
										? 'bg-warning text-white'
										: 'bg-surface text-muted-foreground',
								)}
							>
								{count > 9 ? '9+' : count}
							</span>
						</Link>
					</div>
				</div>
			</header>
		</div>
	);
}

/** Highlights the listing's `?categoria=` (incl. "novidades") in the nav. */
function CategoryNav() {
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const activeSlug =
		pathname === appRoutes.products.list ? searchParams.get('categoria') : null;

	return <CategoryNavLinks activeSlug={activeSlug} />;
}

function CategoryNavLinks({ activeSlug }: { activeSlug: string | null }) {
	const categories = useCategories();

	return (
		<nav
			aria-label="Categorias"
			className="hidden gap-7 text-sm min-[1180px]:flex"
		>
			<NavLink
				href={appRoutes.products.newest}
				active={activeSlug === 'novidades'}
			>
				Novidades
			</NavLink>
			{categories.data?.map((category) => (
				<NavLink
					key={category.id}
					href={appRoutes.products.category(category.slug)}
					active={category.slug === activeSlug}
				>
					{category.name}
				</NavLink>
			))}
		</nav>
	);
}

function NavLink({
	href,
	active,
	children,
}: {
	href: string;
	active: boolean;
	children: React.ReactNode;
}) {
	return (
		<Link
			href={href}
			aria-current={active ? 'page' : undefined}
			className={cn(
				'transition-colors hover:text-primary',
				active ? 'font-medium text-primary' : 'text-foreground',
			)}
		>
			{children}
		</Link>
	);
}

export { StoreHeader };
