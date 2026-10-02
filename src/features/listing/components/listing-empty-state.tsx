import { MagnifyingGlassMinusIcon } from '@phosphor-icons/react';
import Link from 'next/link';

import type { Category } from '@/features/catalog/model/category';
import { appRoutes } from '@/lib/routes/app-routes';

function ListingEmptyState({
	title,
	text,
	categories,
}: {
	title: string;
	text: string;
	categories: Category[];
}) {
	return (
		<div className="flex animate-up flex-col items-center gap-3.5 rounded-[20px] border bg-card px-8 py-14 text-center">
			<div className="flex size-[72px] animate-floaty items-center justify-center rounded-full bg-surface">
				<MagnifyingGlassMinusIcon size={30} className="text-muted-foreground" />
			</div>
			<div className="text-[26px] font-light tracking-[-0.02em]">{title}</div>
			<p className="max-w-[420px] text-[15px] text-muted-foreground">{text}</p>
			{categories.length > 0 ? (
				<div className="flex flex-wrap justify-center gap-2 pt-1.5">
					{categories.map((category) => (
						<Link
							key={category.id}
							href={appRoutes.products.category(category.slug)}
							className="flex h-10 items-center rounded-full bg-surface px-4 text-sm font-medium text-ink-soft transition-colors hover:bg-surface-2"
						>
							{category.name}
						</Link>
					))}
				</div>
			) : null}
		</div>
	);
}

/** Search mode below the minimum term length. */
function KeepTypingHint() {
	return (
		<div className="flex animate-up flex-col items-center gap-2.5 py-14 text-center">
			<div className="text-2xl font-light">Continue digitando</div>
			<div className="text-[15px] text-muted-foreground">
				A busca começa a partir de 2 letras.
			</div>
		</div>
	);
}

export { KeepTypingHint, ListingEmptyState };
