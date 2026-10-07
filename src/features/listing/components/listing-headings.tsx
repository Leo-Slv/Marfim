'use client';

import { MagnifyingGlassIcon, XIcon } from '@phosphor-icons/react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { appRoutes } from '@/lib/routes/app-routes';

import { SEARCH_DEBOUNCE_MS } from '../lib/listing-copy';

/** Category mode: breadcrumb, title, count and blurb. */
function CategoryHeading({
	title,
	countLabel,
	blurb,
}: {
	title: string;
	countLabel: string | null;
	blurb: string;
}) {
	return (
		<section className="pt-8 pb-2">
			<div className="mx-auto flex max-w-[1280px] flex-col gap-3.5 px-5 sm:px-10">
				<div className="font-mono text-[11px] tracking-[0.14em] text-muted-foreground">
					<Link
						href={appRoutes.system.home}
						className="text-muted-foreground hover:text-primary"
					>
						INÍCIO
					</Link>{' '}
					/ {title.toUpperCase()}
				</div>
				<div className="flex flex-wrap items-baseline gap-3.5">
					<h1
						key={title}
						className="animate-up text-[44px] leading-none font-light tracking-[-0.03em] [animation-duration:.7s]"
					>
						{title}
					</h1>
					{countLabel ? (
						<span className="font-mono text-[13px] text-muted-foreground">
							{countLabel}
						</span>
					) : null}
				</div>
				<p className="max-w-[560px] text-[15px] text-muted-foreground">
					{blurb}
				</p>
			</div>
		</section>
	);
}

/**
 * Search mode: the big field updates `?q=` as the shopper types (debounced).
 * It starts from the URL's term and then owns its text.
 */
function SearchHeading({
	term,
	resultLabel,
	onTermChange,
}: {
	term: string;
	resultLabel: string | null;
	onTermChange: (term: string) => void;
}) {
	const [value, setValue] = useState(term);

	useEffect(() => {
		if (value === term) {
			return;
		}
		const timer = setTimeout(() => onTermChange(value), SEARCH_DEBOUNCE_MS);
		return () => clearTimeout(timer);
	}, [value, term, onTermChange]);

	return (
		<section className="pt-8 pb-2">
			<div className="mx-auto flex max-w-[1280px] flex-col gap-4 px-5 sm:px-10">
				<div className="font-mono text-[11px] tracking-[0.14em] text-muted-foreground">
					BUSCA
				</div>
				<label className="flex h-16 max-w-[720px] items-center gap-3.5 rounded-2xl border bg-card px-5 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary">
					<MagnifyingGlassIcon size={22} className="text-muted-foreground" />
					<input
						type="search"
						aria-label="Buscar produtos"
						placeholder="Buscar por peça, ateliê ou categoria"
						value={value}
						onChange={(event) => setValue(event.target.value)}
						autoFocus
						className="min-w-0 grow bg-transparent text-[22px] font-light text-foreground outline-none placeholder:text-muted-foreground [&::-webkit-search-cancel-button]:hidden"
					/>
					{value.length > 0 ? (
						<button
							type="button"
							onClick={() => {
								setValue('');
								onTermChange('');
							}}
							aria-label="Limpar busca"
							className="flex size-9 items-center justify-center rounded-[10px] text-muted-foreground transition-colors hover:bg-surface-2"
						>
							<XIcon size={16} />
						</button>
					) : null}
				</label>
				{resultLabel ? (
					<div className="text-[15px] text-ink-soft" aria-live="polite">
						{resultLabel}
					</div>
				) : null}
			</div>
		</section>
	);
}

/** Promotions mode: the indigo "Semana do design" banner. */
function PromotionsHeading({ countLabel }: { countLabel: string | null }) {
	return (
		<section className="pt-7 pb-2">
			<div className="mx-auto max-w-[1280px] px-5 sm:px-10">
				<div className="relative flex flex-wrap items-center gap-8 overflow-hidden rounded-[20px] bg-primary px-6 py-9 text-primary-foreground sm:px-10">
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
							PROMOÇÕES · SEMANA DO DESIGN
						</div>
						<h1 className="text-[36px] leading-[1.05] font-light tracking-[-0.03em] sm:text-[44px]">
							Peças com <span className="font-medium">preço especial</span>
						</h1>
						<div className="min-h-[1.5em] text-[15px] text-primary-soft">
							{countLabel
								? `${countLabel} com desconto enquanto durar a semana.`
								: null}
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}

export { CategoryHeading, PromotionsHeading, SearchHeading };
