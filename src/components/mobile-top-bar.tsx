'use client';

import {
	CaretLeftIcon,
	HandbagIcon,
	ListIcon,
	MagnifyingGlassIcon,
} from '@phosphor-icons/react';
import Link from 'next/link';
import { useState } from 'react';

import { appRoutes } from '@/lib/routes/app-routes';
import { cn } from '@/lib/utils';

import { MobileMenu } from './mobile-menu';

/** Voltar + title variant of the bar (inner screens of the mockups). */
type MobileBack = {
	href: string;
	/** Replaces the logo; without it the logo stays. */
	title?: string;
};

type MobileTopBarProps = {
	back?: MobileBack;
	count: number;
	onBag: boolean;
	account: { label: string; href: string };
};

const iconButton =
	'flex size-11 shrink-0 items-center justify-center rounded-xl text-foreground transition-colors hover:bg-surface-2';

/** MobileTopo.dc.html — the storefront header below 980 px. */
function MobileTopBar({ back, count, onBag, account }: MobileTopBarProps) {
	const [menuOpen, setMenuOpen] = useState(false);

	return (
		<div className="min-[980px]:hidden">
			<div className="flex h-[30px] items-center justify-center bg-primary font-mono text-[10px] tracking-[0.08em] text-primary-foreground">
				TROCA FÁCIL EM 30 DIAS
			</div>
			<header className="flex h-14 items-center gap-1 border-b px-2">
				{back ? (
					<Link href={back.href} aria-label="Voltar" className={iconButton}>
						<CaretLeftIcon size={20} />
					</Link>
				) : (
					<button
						type="button"
						onClick={() => setMenuOpen(true)}
						aria-label="Abrir menu"
						aria-expanded={menuOpen}
						className={iconButton}
					>
						<ListIcon size={20} />
					</button>
				)}
				<Link
					href={appRoutes.system.home}
					className="flex min-w-0 grow items-center justify-center text-[19px] font-medium tracking-[-0.02em] text-foreground"
				>
					{back?.title ? (
						<span className="truncate">{back.title}</span>
					) : (
						<span>
							marfim<span className="text-primary">.</span>
						</span>
					)}
				</Link>
				<Link
					href={appRoutes.products.search()}
					aria-label="Buscar"
					className={iconButton}
				>
					<MagnifyingGlassIcon size={20} />
				</Link>
				<Link
					href={appRoutes.cart.index}
					aria-label={`Sacola, ${count} itens`}
					aria-current={onBag ? 'page' : undefined}
					className={cn(iconButton, 'relative', onBag && 'text-primary')}
				>
					<HandbagIcon size={20} />
					{count > 0 ? (
						<span
							key={count}
							className="absolute top-1 right-0.5 flex h-[18px] min-w-[18px] animate-pop items-center justify-center rounded-full bg-warning px-[5px] font-mono text-[10px] text-white"
						>
							{count > 9 ? '9+' : count}
						</span>
					) : null}
				</Link>
			</header>
			{back ? null : (
				<MobileMenu
					open={menuOpen}
					onOpenChange={setMenuOpen}
					account={account}
				/>
			)}
		</div>
	);
}

export type { MobileBack };
export { MobileTopBar };
