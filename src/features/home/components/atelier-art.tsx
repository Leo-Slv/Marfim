import type { AtelierArtKind } from '../lib/ateliers';

/** The four atelier drawings from Docs/design/mockups/Main.dc.html. */
function AtelierArt({ kind }: { kind: AtelierArtKind }) {
	return (
		<svg
			className="line-draw"
			width="176"
			height="200"
			viewBox="0 0 160 180"
			fill="none"
			stroke="#18181B"
			strokeWidth="1.5"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
		>
			{kind === 'clay' ? (
				<>
					<path
						d="M66 30h28v14c22 16 26 38 26 60 0 36-18 60-40 60s-40-24-40-60c0-22 4-44 26-60z"
						fill="#FFFFFF"
					/>
					<path d="M50 96c20 6 40 6 60 0" stroke="#E8793A" />
					<path d="M44 118c24 8 48 8 72 0" stroke="#E8793A" />
				</>
			) : kind === 'wood' ? (
				<>
					<path d="M50 20h60v74H50z" fill="#FFFFFF" />
					<path d="M40 94h80v14H40z" fill="#15803D" stroke="#15803D" />
					<path d="M48 108l-6 60M112 108l6 60M58 108v44M102 108v44" />
				</>
			) : kind === 'light' ? (
				<>
					<path d="M80 10v70" />
					<circle cx="80" cy="112" r="34" fill="#FFFFFF" />
					<path
						d="M56 112a24 24 0 0 1 24-24"
						stroke="#3B3FD9"
						strokeWidth="2"
					/>
				</>
			) : (
				<>
					<path d="M30 60h100v30H30z" fill="#FFFFFF" />
					<path d="M30 90h100v30H30z" fill="#3B3FD9" stroke="#3B3FD9" />
					<path d="M30 120h100v30H30z" fill="#FFFFFF" />
					<path d="M40 150v10M56 150v10M72 150v10M88 150v10M104 150v10M120 150v10" />
				</>
			)}
		</svg>
	);
}

export { AtelierArt };
