import { ComingSoonBadge } from '@/components/coming-soon-badge';
import { ProductArt } from '@/features/catalog/components/product-art';
import {
	getProductVisual,
	hasProductVisual,
	productTints,
} from '@/features/catalog/lib/product-visuals';
import { cn } from '@/lib/utils';

const views = [
	{ label: 'CAPA', background: null, size: 64 },
	{ label: 'DETALHE', background: productTints.indigo, size: 110 },
	{ label: 'AMBIENTE', background: productTints.clay, size: 44 },
] as const;

/**
 * "Imagem na loja": the drawing the store shows for this product (photos
 * aren't stored by design — admin products pendency #5).
 */
function ProductArtPreview({ slug }: { slug: string }) {
	const visual = getProductVisual(slug);
	const ownDrawing = hasProductVisual(slug);

	return (
		<div className="flex flex-col gap-3 rounded-2xl border bg-card p-[18px]">
			<div className="flex flex-wrap items-center gap-2">
				<span className="grow font-mono text-[10px] tracking-[0.14em] text-muted-foreground">
					IMAGEM NA LOJA · DESENHO DA MARFIM
				</span>
				<span
					aria-disabled="true"
					title="Em breve"
					className="flex h-[34px] items-center gap-2 rounded-[9px] border border-dashed border-[#C9C7C0] px-3 text-[13px] text-muted-foreground"
				>
					Enviar imagem
					<ComingSoonBadge />
				</span>
			</div>
			<div className="flex flex-wrap gap-2.5">
				{views.map((view, index) => (
					<div
						key={view.label}
						className={cn(
							'relative flex size-[120px] animate-pop-in items-center justify-center overflow-hidden rounded-xl border-2',
							index === 0 ? 'border-primary' : 'border-transparent',
						)}
						style={{
							background: view.background ?? visual.tint,
							animationDelay: `${index * 0.06}s`,
						}}
					>
						<ProductArt kind={visual.kind} size={view.size} />
						<span className="absolute top-1.5 left-1.5 flex h-5 items-center rounded-md bg-white px-1.5 font-mono text-[10px]">
							{view.label}
						</span>
					</div>
				))}
			</div>
			<p className="text-xs text-muted-foreground">
				{ownDrawing
					? `Desenho próprio da loja, escolhido pelo endereço na loja${visual.tag ? ` · etiqueta "${visual.tag}"` : ''}.`
					: 'Este produto ainda não tem desenho próprio: a loja mostra o desenho padrão. Peça à equipe de desenvolvimento para cadastrar um.'}
			</p>
		</div>
	);
}

export { ProductArtPreview };
