import type { ProductArtKind } from '../lib/product-visuals';

const INK = '#18181B';
const INDIGO = '#3B3FD9';
const ORANGE = '#E8793A';
const GREEN = '#15803D';
const WHITE = '#FFFFFF';
const GROUND = '#F4F3EF';

type ProductArtProps = {
	kind: ProductArtKind;
	/** Rendered width in px; height keeps the drawings' 160×180 ratio. */
	size: number;
	strokeWidth?: number;
	/** Hero-only extra detail (the lamp's light ray). */
	detailed?: boolean;
	/** Light strokes for a dark ground (the product page's "Acesa" view). */
	lit?: boolean;
	className?: string;
};

/** Inline SVG drawings from Docs/design/mockups/Art.dc.html. */
function ProductArt({
	kind,
	size,
	strokeWidth,
	detailed = false,
	lit = false,
	className,
}: ProductArtProps) {
	return (
		<svg
			width={size}
			height={Math.round(size * 1.125)}
			viewBox="0 0 160 180"
			fill="none"
			stroke={lit ? GROUND : INK}
			strokeWidth={strokeWidth ?? (size < 90 ? 3 : 2)}
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
			className={className}
		>
			<ArtPaths kind={kind} detailed={detailed} />
		</svg>
	);
}

function ArtPaths({
	kind,
	detailed,
}: {
	kind: ProductArtKind;
	detailed: boolean;
}) {
	switch (kind) {
		case 'lamp':
			return (
				<>
					<path d="M44 164V70c0-30 18-46 44-46 22 0 34 12 37 30" />
					<path d="M108 56h34l-8 22h-18z" fill={INDIGO} stroke={INDIGO} />
					<ellipse cx="44" cy="166" rx="22" ry="5" fill={WHITE} />
					{detailed ? (
						<path d="M125 82v8" stroke={ORANGE} strokeWidth={2} />
					) : null}
				</>
			);
		case 'sconce':
			return (
				<>
					<path d="M40 40v100" />
					<path d="M40 90h50" />
					<path d="M80 90l20-34h30l-14 34z" fill={WHITE} />
					<path d="M100 100v14" stroke={ORANGE} />
				</>
			);
		case 'pendant':
			return (
				<>
					<path d="M80 10v70" />
					<circle cx="80" cy="112" r="34" fill={WHITE} />
					<path d="M56 112a24 24 0 0 1 24-24" stroke={ORANGE} />
				</>
			);
		case 'vase':
			return (
				<>
					<path
						d="M66 30h28v14c22 16 26 38 26 60 0 36-18 60-40 60s-40-24-40-60c0-22 4-44 26-60z"
						fill={WHITE}
					/>
					<path
						d="M80 30C78 18 70 10 58 8M80 30c4-12 14-18 24-18"
						stroke={GREEN}
					/>
				</>
			);
		case 'jar':
			return (
				<>
					<path
						d="M58 40h44l-4 16c18 10 22 30 22 52 0 34-18 54-40 54s-40-20-40-54c0-22 4-42 22-52z"
						fill={WHITE}
					/>
					<path d="M100 60c14 0 18 20 4 30" />
					<path d="M50 112c20 6 40 6 60 0" stroke={ORANGE} />
				</>
			);
		case 'chair':
			return (
				<>
					<path d="M50 20h60v74H50z" fill={WHITE} />
					<path d="M40 94h80v14H40z" fill={GREEN} stroke={GREEN} />
					<path d="M48 108l-6 60M112 108l6 60M58 108v44M102 108v44" />
				</>
			);
		case 'bench':
			return (
				<>
					<path d="M20 84h120v16H20z" fill={WHITE} />
					<path d="M32 100l-6 50M128 100l6 50M44 100v36M116 100v36" />
					<path d="M44 124h72" stroke={GREEN} />
				</>
			);
		case 'mug':
			return (
				<>
					<path
						d="M40 60h64v70c0 14-10 24-24 24h-16c-14 0-24-10-24-24z"
						fill={WHITE}
					/>
					<path d="M104 76h10a16 16 0 0 1 0 32h-10" />
					<path
						d="M60 30c-6 8 6 12 0 20M80 26c-6 8 6 12 0 20"
						stroke={ORANGE}
					/>
				</>
			);
		case 'bowl':
			return (
				<>
					<path d="M24 84h112c0 36-24 60-56 60S24 120 24 84z" fill={WHITE} />
					<path d="M64 144h32" />
					<path d="M40 98c24 8 56 8 80 0" stroke={INDIGO} />
				</>
			);
		case 'throw':
			return (
				<>
					<path d="M30 60h100v30H30z" fill={WHITE} />
					<path d="M30 90h100v30H30z" fill={INDIGO} stroke={INDIGO} />
					<path d="M30 120h100v30H30z" fill={WHITE} />
					<path d="M40 150v10M56 150v10M72 150v10M88 150v10M104 150v10M120 150v10" />
				</>
			);
		case 'towel':
			return (
				<>
					<path d="M30 40h100" />
					<path d="M44 40v110h72V40" fill={WHITE} />
					<path d="M44 120h72" stroke={ORANGE} />
					<path d="M44 130h72" stroke={ORANGE} />
				</>
			);
	}
}

export { ProductArt };
