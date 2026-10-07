'use client';

import Link from 'next/link';

import { ProductArt } from '@/features/catalog/components/product-art';
import { useProducts } from '@/features/catalog/hooks/catalog.queries';
import { appRoutes } from '@/lib/routes/app-routes';

import { ALL_PRODUCTS, piecesInCatalog } from '../../lib/catalog-pieces';
import { lookbookScenes } from '../../lib/content-copy';
import { Lead, PageHeading } from '../content-ui';

/** 28 · Lookbook — tags only for pieces that are in the catalog. */
function LookbookPage() {
	const products = useProducts(ALL_PRODUCTS);

	return (
		<>
			<PageHeading
				eyebrow="LOOKBOOK · OUTONO 2026"
				title="As peças"
				accent="em casa"
				large
			/>
			<Lead>
				Quatro cantos montados com a coleção. Toque numa peça para ver na loja.
			</Lead>
			<div className="mt-6 grid grid-cols-1 gap-4 min-[980px]:mt-8 min-[980px]:grid-cols-2">
				{lookbookScenes.map((scene, index) => {
					const tags = products.data
						? piecesInCatalog(products.data.items, scene.productSlugs)
						: [];
					return (
						<figure
							key={scene.title}
							className="relative flex h-[260px] animate-up items-center justify-center gap-3.5 overflow-hidden rounded-[18px] pb-10 min-[980px]:h-(--scene-h) min-[980px]:items-end min-[980px]:gap-3 min-[980px]:rounded-[20px] min-[980px]:pb-[72px]"
							style={
								{
									background: scene.background,
									animationDelay: `${(index * 0.08).toFixed(2)}s`,
									'--scene-h': `${scene.height}px`,
								} as React.CSSProperties
							}
						>
							{scene.pieces.map((piece, pieceIndex) => (
								<div
									key={pieceIndex}
									className="flex animate-floaty"
									style={{
										animationDelay: `${(pieceIndex * 0.7).toFixed(1)}s`,
									}}
								>
									<ProductArt
										kind={piece.kind}
										size={Math.round(piece.size * 0.6)}
										className="min-[980px]:hidden"
									/>
									<ProductArt
										kind={piece.kind}
										size={piece.size}
										className="hidden min-[980px]:block"
									/>
								</div>
							))}
							<figcaption className="absolute inset-x-3 bottom-3 flex flex-wrap items-center gap-1.5 min-[980px]:inset-x-4 min-[980px]:bottom-4 min-[980px]:gap-2">
								<span
									className="basis-full font-mono text-[10px] tracking-[0.12em] min-[980px]:grow min-[980px]:basis-auto min-[980px]:text-[11px]"
									style={{ color: scene.ink }}
								>
									{scene.title}
								</span>
								{tags.map((tag) => (
									<Link
										key={tag.slug}
										href={appRoutes.products.detail(tag.slug)}
										className="flex h-[30px] items-center rounded-full bg-white/90 px-3 text-[13px] text-foreground transition-colors hover:bg-white"
									>
										{tag.name} ›
									</Link>
								))}
							</figcaption>
						</figure>
					);
				})}
			</div>
		</>
	);
}

export { LookbookPage };
