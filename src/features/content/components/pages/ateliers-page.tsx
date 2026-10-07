'use client';

import Link from 'next/link';

import { ProductArt } from '@/features/catalog/components/product-art';
import { useCatalog } from '@/features/catalog/hooks/catalog.queries';
import { ateliers } from '@/features/home/lib/ateliers';
import { appRoutes } from '@/lib/routes/app-routes';

import { piecesOfAtelier } from '../../lib/catalog-pieces';
import { atelierStories } from '../../lib/content-copy';
import { Lead, PageHeading } from '../content-ui';

/** 26 · Ateliês parceiros — pieces from the live catalog, by brand. */
function AteliersPage() {
	const products = useCatalog();

	return (
		<>
			<PageHeading
				eyebrow="ATELIÊS PARCEIROS"
				title="Quatro bancadas,"
				accent="um endereço"
				after="."
				large
			/>
			<Lead>
				Cada ateliê cuida de um ofício. Nas páginas de produto, o nome de quem
				fez aparece junto com a peça.
			</Lead>
			<div className="mt-6 flex flex-col gap-4 min-[980px]:mt-10">
				{ateliers.map((atelier, index) => {
					const story = atelierStories[atelier.name];
					const pieces = products.data
						? piecesOfAtelier(products.data.items, atelier.name)
						: products.isError
							? []
							: null;
					return (
						<article
							key={atelier.num}
							className="grid animate-up grid-cols-1 overflow-hidden rounded-2xl border bg-card min-[980px]:grid-cols-[260px_minmax(0,1fr)] min-[980px]:gap-6 min-[980px]:rounded-[20px] min-[980px]:p-4"
							style={{ animationDelay: `${(index * 0.06).toFixed(2)}s` }}
						>
							<div
								className="flex h-[150px] items-center justify-center min-[980px]:h-[220px] min-[980px]:rounded-[14px]"
								style={{ background: atelier.tint }}
							>
								<div className="flex animate-floaty">
									<ProductArt kind={story?.kind ?? 'vase'} size={100} />
								</div>
							</div>
							<div className="flex flex-col gap-2 p-3.5 min-[980px]:gap-2.5 min-[980px]:py-3 min-[980px]:pr-3 min-[980px]:pl-0">
								<span className="font-mono text-[10px] tracking-[0.14em] text-muted-foreground min-[980px]:text-[11px]">
									{atelier.num} · {atelier.city}
								</span>
								<span className="text-xl font-medium min-[980px]:text-3xl min-[980px]:font-light min-[980px]:tracking-[-0.02em]">
									{atelier.name}
								</span>
								<span className="text-sm leading-normal text-ink-soft min-[980px]:text-[15px] min-[980px]:leading-[1.6]">
									{story?.text ?? atelier.craft}
								</span>
								<div className="flex flex-wrap gap-1.5 pt-1">
									{pieces === null ? (
										<span className="skeleton h-8 w-40 rounded-full" />
									) : (
										pieces.map((piece) => (
											<Link
												key={piece.slug}
												href={appRoutes.products.detail(piece.slug)}
												className="flex h-8 items-center rounded-full bg-surface px-3 text-[13px] text-ink-soft transition-colors hover:bg-surface-2 hover:text-foreground"
											>
												{piece.name}
											</Link>
										))
									)}
								</div>
							</div>
						</article>
					);
				})}
			</div>
		</>
	);
}

export { AteliersPage };
