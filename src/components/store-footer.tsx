import { LockSimpleIcon } from '@phosphor-icons/react/dist/ssr';
import Link from 'next/link';

import { ComingSoonBadge } from '@/components/coming-soon-badge';
import { appRoutes } from '@/lib/routes/app-routes';
import { cn } from '@/lib/utils';

type FooterLink = { label: string; href: string };

const storeLinks: FooterLink[] = [
	{ label: 'Novidades', href: appRoutes.products.newest },
	{ label: 'Casa', href: appRoutes.products.category('casa') },
	{ label: 'Cozinha', href: appRoutes.products.category('cozinha') },
	{
		label: 'Iluminação',
		href: appRoutes.products.category('iluminacao'),
	},
	{ label: 'Têxteis', href: appRoutes.products.category('texteis') },
];

const helpLinks: FooterLink[] = [
	{ label: 'Rastrear pedido', href: appRoutes.account.orders },
	{ label: 'Trocas e devoluções', href: appRoutes.content.page('trocas') },
	{ label: 'Prazos e frete', href: appRoutes.content.page('frete') },
	{ label: 'Cuidados com as peças', href: appRoutes.content.page('cuidados') },
	{ label: 'Perguntas frequentes', href: appRoutes.content.page('faq') },
];

const brandLinks: FooterLink[] = [
	{ label: 'Nossa história', href: appRoutes.content.page('historia') },
	{ label: 'Ateliês parceiros', href: appRoutes.content.page('ateliers') },
	{ label: 'Venda com a gente', href: appRoutes.content.page('venda') },
	{ label: 'Lookbook', href: appRoutes.content.page('lookbook') },
	{ label: 'Instagram', href: appRoutes.content.page('instagram') },
];

/** Storefront footer from Docs/design/mockups/Footer.dc.html. */
function StoreFooter() {
	return (
		<footer className="w-full overflow-hidden bg-foreground pt-14 text-background">
			<div className="mx-auto grid max-w-[1280px] grid-cols-2 gap-x-6 gap-y-10 px-5 min-[980px]:grid-cols-12 min-[980px]:gap-y-0 sm:px-10">
				<form className="col-span-2 flex flex-col gap-3.5 min-[980px]:col-span-4">
					<div className="flex items-center gap-2.5">
						<label
							htmlFor="newsletter-email"
							className="font-mono text-[11px] tracking-[0.14em] text-[#A1A1A8]"
						>
							NEWSLETTER
						</label>
						<ComingSoonBadge tone="dark" />
					</div>
					<p className="text-xl leading-[1.35] font-light tracking-[-0.01em]">
						Uma carta por mês com peças novas, bastidores dos ateliês e cuidados
						com a casa.
					</p>
					<div className="flex gap-2 pt-0.5 opacity-60">
						<input
							id="newsletter-email"
							type="email"
							disabled
							placeholder="seu@email.com"
							className="h-11 min-w-0 grow rounded-xl border border-[#44444A] bg-[#232327] px-3.5 text-sm text-background"
						/>
						<button
							type="button"
							disabled
							className="h-11 rounded-xl bg-primary px-[18px] text-sm font-medium text-primary-foreground"
						>
							Assinar
						</button>
					</div>
				</form>
				<FooterColumn
					title="LOJA"
					links={storeLinks}
					className="min-[980px]:col-span-2 min-[980px]:col-start-6"
				>
					<span className="flex items-center gap-2 text-[#A1A1A8]">
						Vale-presente
						<span className="font-mono text-[9px] tracking-[0.1em] text-[#F0A070]">
							EM BREVE
						</span>
					</span>
				</FooterColumn>
				<FooterColumn
					title="AJUDA"
					links={helpLinks}
					className="min-[980px]:col-span-2"
				/>
				<FooterColumn
					title="MARFIM"
					links={brandLinks}
					className="min-[980px]:col-span-2"
				/>
			</div>
			<div className="mx-auto max-w-[1280px] px-5 sm:px-10">
				<div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4 border-y border-[#2E2E33] py-5 text-[13px] text-[#D4D4D8]">
					<div className="flex flex-col gap-1">
						<span className="font-mono text-[10px] tracking-[0.14em] text-[#A1A1A8]">
							ATENDIMENTO
						</span>
						<span>Seg a sex, 9h às 18h · [SEU WHATSAPP] · [SEU E-MAIL]</span>
					</div>
					<div className="grow" />
					<div className="flex flex-wrap items-center gap-1.5">
						<span className="mr-1.5 font-mono text-[10px] tracking-[0.14em] text-[#A1A1A8]">
							PAGAMENTO
						</span>
						<span className="flex h-[26px] items-center rounded-[7px] border border-[#44444A] px-[9px] font-mono text-[10px]">
							CARTÃO DE CRÉDITO
						</span>
						<span className="flex h-[26px] items-center rounded-[7px] border border-dashed border-[#44444A] px-[9px] font-mono text-[10px] text-[#A1A1A8]">
							PIX · EM BREVE
						</span>
					</div>
				</div>
				<div className="flex flex-wrap items-center gap-x-5 gap-y-3 py-4 font-mono text-[11px] text-[#A1A1A8]">
					<span>© 2026 MARFIM · CNPJ [SEU CNPJ]</span>
					<span className="grow" />
					<Link
						href={appRoutes.content.page('privacidade')}
						className="hover:text-background"
					>
						PRIVACIDADE
					</Link>
					<Link
						href={appRoutes.content.page('termos')}
						className="hover:text-background"
					>
						TERMOS DE USO
					</Link>
					<span className="flex items-center gap-1.5">
						<LockSimpleIcon size={13} />
						COMPRA SEGURA
					</span>
				</div>
				<div
					aria-hidden="true"
					className="mt-2 -ml-2 h-[0.62em] overflow-hidden text-[17vw] leading-[0.78] font-light tracking-[-0.06em] whitespace-nowrap text-[#232327]"
				>
					marfim<span className="text-primary">.</span>
				</div>
			</div>
		</footer>
	);
}

function FooterColumn({
	title,
	links,
	className,
	children,
}: {
	title: string;
	links: FooterLink[];
	className?: string;
	children?: React.ReactNode;
}) {
	return (
		<div className={cn('flex flex-col gap-2.5 text-sm', className)}>
			<div className="pb-1 font-mono text-[11px] tracking-[0.14em] text-[#A1A1A8]">
				{title}
			</div>
			{links.map((link) => (
				<Link
					key={link.label}
					href={link.href}
					className="text-background transition-colors hover:text-[#A1A1A8]"
				>
					{link.label}
				</Link>
			))}
			{children}
		</div>
	);
}

export { StoreFooter };
