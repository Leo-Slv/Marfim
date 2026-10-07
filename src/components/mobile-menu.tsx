'use client';

import {
	CaretRightIcon,
	MagnifyingGlassIcon,
	XIcon,
} from '@phosphor-icons/react';
import Link from 'next/link';
import { Dialog as DialogPrimitive } from 'radix-ui';

import { useCategories } from '@/features/catalog/hooks/catalog.queries';
import { appRoutes } from '@/lib/routes/app-routes';

type MobileMenuProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	/** "Entrar ou criar conta" or "Minha conta" and where it leads. */
	account: { label: string; href: string };
};

const helpLinks = [
	{ label: 'Meus pedidos', href: appRoutes.account.orders },
	{
		label: 'Trocas e devoluções',
		href: appRoutes.content.page('trocas-e-devolucoes'),
	},
	{
		label: 'Perguntas frequentes',
		href: appRoutes.content.page('perguntas-frequentes'),
	},
	{ label: 'Nossa história', href: appRoutes.content.page('nossa-historia') },
];

/** Side menu of MobileTopo.dc.html. */
function MobileMenu({ open, onOpenChange, account }: MobileMenuProps) {
	const categories = useCategories();
	const close = () => onOpenChange(false);

	return (
		<DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
			<DialogPrimitive.Portal>
				<DialogPrimitive.Overlay className="fixed inset-0 z-50 animate-fade-in bg-foreground/35" />
				<DialogPrimitive.Content
					aria-describedby={undefined}
					className="fixed inset-y-0 left-0 z-51 flex w-[310px] max-w-[85vw] animate-slide-in-left flex-col gap-5 overflow-y-auto bg-background p-5 shadow-[20px_0_40px_-20px_rgba(24,24,27,.3)] outline-none"
				>
					<div className="flex items-center">
						<DialogPrimitive.Title className="grow text-xl font-medium">
							marfim<span className="text-primary">.</span>
							<span className="sr-only"> · Menu</span>
						</DialogPrimitive.Title>
						<DialogPrimitive.Close
							aria-label="Fechar menu"
							className="flex size-11 items-center justify-center rounded-xl text-foreground transition-colors hover:bg-surface-2"
						>
							<XIcon size={20} />
						</DialogPrimitive.Close>
					</div>

					<Link
						href={account.href}
						onClick={close}
						className="flex h-12 shrink-0 items-center justify-center rounded-xl bg-primary text-[15px] font-medium text-primary-foreground transition-colors hover:bg-primary-strong"
					>
						{account.label}
					</Link>

					<nav aria-label="Loja" className="flex flex-col">
						<MenuEyebrow>LOJA</MenuEyebrow>
						<StoreLink href={appRoutes.products.newest} onClick={close}>
							Novidades
						</StoreLink>
						{categories.data?.map((category) => (
							<StoreLink
								key={category.id}
								href={appRoutes.products.category(category.slug)}
								onClick={close}
							>
								{category.name}
							</StoreLink>
						))}
						<Link
							href={appRoutes.products.promotions}
							onClick={close}
							className="flex h-12 items-center justify-between text-xl text-primary"
						>
							Promoções
							<CaretRightIcon size={16} />
						</Link>
						<Link
							href={appRoutes.products.search()}
							onClick={close}
							className="flex h-12 items-center gap-2.5 text-base text-ink-soft"
						>
							<MagnifyingGlassIcon size={18} />
							Buscar produtos
						</Link>
					</nav>

					<nav aria-label="Ajuda" className="flex flex-col gap-0.5 text-[15px]">
						<MenuEyebrow>AJUDA</MenuEyebrow>
						{helpLinks.map((link) => (
							<Link
								key={link.label}
								href={link.href}
								onClick={close}
								className="flex min-h-10 items-center text-foreground hover:text-primary"
							>
								{link.label}
							</Link>
						))}
					</nav>
				</DialogPrimitive.Content>
			</DialogPrimitive.Portal>
		</DialogPrimitive.Root>
	);
}

function MenuEyebrow({ children }: { children: React.ReactNode }) {
	return (
		<span className="pb-1.5 font-mono text-[10px] tracking-[0.16em] text-muted-foreground">
			{children}
		</span>
	);
}

function StoreLink({
	href,
	onClick,
	children,
}: {
	href: string;
	onClick: () => void;
	children: React.ReactNode;
}) {
	return (
		<Link
			href={href}
			onClick={onClick}
			className="flex h-12 items-center justify-between border-b text-xl font-light text-foreground hover:text-primary"
		>
			{children}
			<CaretRightIcon size={16} className="text-muted-foreground" />
		</Link>
	);
}

export { MobileMenu };
