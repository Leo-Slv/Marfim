'use client';

import {
	CaretLeftIcon,
	CaretRightIcon,
	ClockIcon,
	MagnifyingGlassIcon,
	MagnifyingGlassMinusIcon,
	XIcon,
} from '@phosphor-icons/react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { ProductArt } from '@/features/catalog/components/product-art';
import {
	useCatalog,
	useCategories,
} from '@/features/catalog/hooks/catalog.queries';
import { formatCurrencyBrl } from '@/features/catalog/lib/format-currency-brl';
import { getProductVisual } from '@/features/catalog/lib/product-visuals';
import { searchProducts } from '@/features/catalog/lib/search-products';
import { appRoutes } from '@/lib/routes/app-routes';

import { useRecentSearches } from '../hooks/use-recent-searches';
import { exploreTerms } from '../lib/explore-terms';
import {
	formatResultCount,
	isSearchable,
	SEARCH_DEBOUNCE_MS,
} from '../lib/listing-copy';
import { DEFAULT_SORT } from '../lib/listing-sort';
import { buildListingHref } from '../lib/listing-url';

/** MobileBusca.dc.html — `/search` below 980 px; the term lives in `?q=`. */
function MobileSearch() {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const urlTerm = searchParams.get('q') ?? '';
	const [value, setValue] = useState(urlTerm);
	const { recent, remember, clear } = useRecentSearches();
	const categories = useCategories();
	// Same key as the desktop search (default sort), so one request serves both.
	const catalog = useCatalog(DEFAULT_SORT.apiSort);

	// The field owns its text; the URL follows after a pause (replace, so
	// typing doesn't fill the history).
	useEffect(() => {
		if (value.trim() === urlTerm) {
			return;
		}
		const timer = setTimeout(() => {
			router.replace(
				buildListingHref(pathname, searchParams, {
					q: value.trim() || null,
				}),
				{ scroll: false },
			);
		}, SEARCH_DEBOUNCE_MS);
		return () => clearTimeout(timer);
	}, [value, urlTerm, router, pathname, searchParams]);

	const term = value.trim();
	const results =
		catalog.data && isSearchable(term)
			? searchProducts(catalog.data.items, categories.data ?? [], term)
			: [];
	const explore = exploreTerms(
		categories.data ?? [],
		catalog.data?.items ?? [],
	);

	function pick(next: string) {
		setValue(next);
		remember(next);
	}

	function goBack() {
		if (window.history.length > 1) {
			router.back();
		} else {
			router.push(appRoutes.system.home);
		}
	}

	return (
		<div className="flex min-h-screen min-w-[360px] flex-col bg-background">
			<div className="flex h-[30px] items-center justify-center bg-primary font-mono text-[10px] tracking-[0.08em] text-primary-foreground">
				TROCA FÁCIL EM 30 DIAS
			</div>
			<header className="flex items-center gap-1 border-b py-2.5 pr-2 pl-1">
				<button
					type="button"
					onClick={goBack}
					aria-label="Voltar"
					className="flex size-11 shrink-0 items-center justify-center rounded-xl text-foreground"
				>
					<CaretLeftIcon size={20} />
				</button>
				<form
					role="search"
					className="flex h-[46px] grow items-center gap-2 rounded-xl border border-primary bg-card px-3"
					onSubmit={(event) => {
						event.preventDefault();
						if (isSearchable(term)) {
							remember(term);
						}
						(document.activeElement as HTMLElement | null)?.blur();
					}}
				>
					<MagnifyingGlassIcon size={18} className="text-muted-foreground" />
					<input
						type="search"
						aria-label="Buscar produtos"
						placeholder="Peça, ateliê ou categoria"
						value={value}
						onChange={(event) => setValue(event.target.value)}
						autoFocus
						enterKeyHint="search"
						className="min-w-0 grow bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground [&::-webkit-search-cancel-button]:hidden"
					/>
					{value ? (
						<button
							type="button"
							onClick={() => setValue('')}
							aria-label="Limpar"
							className="flex size-8 items-center justify-center rounded-full bg-surface text-ink-soft"
						>
							<XIcon size={14} />
						</button>
					) : null}
				</form>
			</header>

			<main className="grow" aria-live="polite">
				{term.length === 0 ? (
					<section className="flex animate-fade-in flex-col gap-[22px] px-4 py-5">
						<div className="flex flex-col gap-2.5">
							<div className="flex items-baseline justify-between">
								<Eyebrow>BUSCAS RECENTES</Eyebrow>
								{recent.length > 0 ? (
									<button
										type="button"
										onClick={clear}
										className="min-h-8 text-[13px] font-medium text-primary"
									>
										Limpar
									</button>
								) : null}
							</div>
							{recent.length > 0 ? (
								recent.map((item) => (
									<button
										key={item}
										type="button"
										onClick={() => pick(item)}
										className="flex min-h-11 items-center gap-3 border-b text-left text-base text-foreground"
									>
										<ClockIcon size={16} className="text-muted-foreground" />
										{item}
									</button>
								))
							) : (
								<span className="text-sm text-muted-foreground">
									Nenhuma busca recente.
								</span>
							)}
						</div>
						<ExploreChips terms={explore} onPick={pick} />
					</section>
				) : !isSearchable(term) ? (
					<section className="flex animate-fade-in flex-col gap-1.5 px-6 py-12 text-center">
						<span className="text-[22px] font-light">Continue digitando</span>
						<span className="text-sm text-muted-foreground">
							A busca começa a partir de 2 letras.
						</span>
					</section>
				) : catalog.isError ? (
					<section className="flex flex-col items-center gap-3 px-6 py-12 text-center">
						<span className="text-[15px] text-ink-soft">
							Não foi possível buscar agora.
						</span>
						<button
							type="button"
							onClick={() => void catalog.refetch()}
							className="h-11 rounded-xl border bg-card px-4 text-sm font-medium"
						>
							Tentar novamente
						</button>
					</section>
				) : !catalog.data ? (
					<section className="flex flex-col gap-3 p-4">
						{[0, 1, 2].map((index) => (
							<div key={index} className="skeleton h-[90px] rounded-[14px]" />
						))}
					</section>
				) : results.length === 0 ? (
					<section className="flex animate-up flex-col items-center gap-2.5 px-5 py-10 text-center">
						<span className="flex size-[60px] animate-floaty items-center justify-center rounded-full bg-surface text-muted-foreground">
							<MagnifyingGlassMinusIcon size={26} />
						</span>
						<span className="text-[22px] font-light">Nada para “{term}”</span>
						<span className="text-sm leading-normal text-muted-foreground">
							Confira a grafia ou tente o tipo da peça ou o nome do ateliê.
						</span>
						<div className="pt-1.5">
							<ExploreChips terms={explore} onPick={pick} centered />
						</div>
					</section>
				) : (
					<section className="flex flex-col gap-3 p-4">
						<span className="text-sm text-ink-soft">
							{formatResultCount(results.length, term)}
						</span>
						{results.map((product) => {
							const visual = getProductVisual(product.slug);
							const category = categories.data?.find(
								(item) => item.id === product.categoryId,
							);
							return (
								<Link
									key={product.id}
									href={appRoutes.products.detail(product.slug)}
									onClick={() => remember(term)}
									className="flex animate-up items-center gap-3 rounded-[14px] border bg-card p-2 text-foreground"
								>
									<span
										className="flex size-[72px] shrink-0 items-center justify-center rounded-[10px]"
										style={{ background: visual.tint }}
									>
										<ProductArt kind={visual.kind} size={42} />
									</span>
									<span className="flex min-w-0 grow flex-col gap-0.5">
										<span className="truncate text-xs text-muted-foreground">
											{[product.brand, category?.name]
												.filter(Boolean)
												.join(' · ')}
										</span>
										<span className="text-[15px] font-medium">
											{product.name}
										</span>
										<span className="font-mono text-[13px]">
											{formatCurrencyBrl(product.currentPrice)}
										</span>
									</span>
									<CaretRightIcon
										size={14}
										className="mr-1.5 shrink-0 text-muted-foreground"
									/>
								</Link>
							);
						})}
					</section>
				)}
			</main>
		</div>
	);
}

function Eyebrow({ children }: { children: React.ReactNode }) {
	return (
		<span className="font-mono text-[10px] tracking-[0.16em] text-muted-foreground">
			{children}
		</span>
	);
}

/** Categories and ateliers to start from (no search statistics exist). */
function ExploreChips({
	terms,
	onPick,
	centered = false,
}: {
	terms: string[];
	onPick: (term: string) => void;
	centered?: boolean;
}) {
	if (terms.length === 0) {
		return null;
	}
	return (
		<div className="flex flex-col gap-2.5">
			{centered ? null : <Eyebrow>EXPLORE</Eyebrow>}
			<div
				className={`flex flex-wrap gap-2 ${centered ? 'justify-center' : ''}`}
			>
				{terms.map((item) => (
					<button
						key={item}
						type="button"
						onClick={() => onPick(item)}
						className="h-10 rounded-full bg-surface px-3.5 text-sm font-medium text-ink-soft"
					>
						{item}
					</button>
				))}
			</div>
		</div>
	);
}

export { MobileSearch };
