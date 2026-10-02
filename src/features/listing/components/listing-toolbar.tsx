import Link from 'next/link';

import { cn } from '@/lib/utils';

import { sortOptions, type SortOption } from '../lib/listing-sort';

type CategoryChipLink = {
	key: string;
	label: string;
	href: string;
	active: boolean;
};

type ListingToolbarProps = {
	/** Category mode shows chips; the other modes show the count instead. */
	chips: CategoryChipLink[] | null;
	countLabel: string | null;
	sort: SortOption;
	onSortChange: (value: string) => void;
};

function ListingToolbar({
	chips,
	countLabel,
	sort,
	onSortChange,
}: ListingToolbarProps) {
	return (
		<section className="pt-5">
			<div className="mx-auto flex max-w-[1280px] flex-wrap items-center gap-3 px-5 sm:px-10">
				<div className="flex w-full flex-wrap items-center gap-3 border-b pb-5">
					{chips ? (
						<nav aria-label="Categorias" className="flex flex-wrap gap-2">
							{chips.map((chip) => (
								<Link
									key={chip.key}
									href={chip.href}
									scroll={false}
									aria-current={chip.active ? 'page' : undefined}
									className={cn(
										'flex h-10 items-center rounded-full px-4 text-sm font-medium transition-colors duration-200',
										chip.active
											? 'bg-primary text-primary-foreground'
											: 'bg-surface text-ink-soft hover:bg-surface-2',
									)}
								>
									{chip.label}
								</Link>
							))}
						</nav>
					) : (
						<span className="text-sm text-ink-soft">{countLabel}</span>
					)}
					<div className="grow" />
					<label className="flex items-center gap-2.5 text-[13px] text-muted-foreground">
						Ordenar por
						<select
							value={sort.value}
							onChange={(event) => onSortChange(event.target.value)}
							className="h-10 rounded-xl border bg-card px-3 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
						>
							{sortOptions.map((option) => (
								<option key={option.value} value={option.value}>
									{option.label}
								</option>
							))}
						</select>
					</label>
				</div>
			</div>
		</section>
	);
}

export type { CategoryChipLink };
export { ListingToolbar };
