'use client';

import { ArrowsDownUpIcon } from '@phosphor-icons/react';
import Link from 'next/link';
import { useState } from 'react';

import { BottomSheet } from '@/components/bottom-sheet';
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
	const [sheetOpen, setSheetOpen] = useState(false);

	return (
		<section className="pt-3 min-[980px]:pt-5">
			<div className="mx-auto flex max-w-[1280px] flex-wrap items-center gap-3 px-4 sm:px-10">
				<div className="flex w-full flex-col gap-3 min-[980px]:flex-row min-[980px]:flex-wrap min-[980px]:items-center min-[980px]:border-b min-[980px]:pb-5">
					{chips ? (
						<nav
							aria-label="Categorias"
							className="-mx-4 flex [scrollbar-width:none] gap-2 overflow-x-auto px-4 min-[980px]:mx-0 min-[980px]:flex-wrap min-[980px]:overflow-visible min-[980px]:px-0 [&::-webkit-scrollbar]:hidden"
						>
							{chips.map((chip) => (
								<Link
									key={chip.key}
									href={chip.href}
									scroll={false}
									aria-current={chip.active ? 'page' : undefined}
									className={cn(
										'flex h-[38px] shrink-0 items-center rounded-full px-3.5 text-sm font-medium transition-colors duration-200 min-[980px]:h-10 min-[980px]:px-4',
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
						<span className="hidden text-sm text-ink-soft min-[980px]:inline">
							{countLabel}
						</span>
					)}
					<div className="grow max-[979px]:hidden" />

					{/* Below 980 px: one button that opens the options in a sheet. */}
					<button
						type="button"
						onClick={() => setSheetOpen(true)}
						className="flex h-11 items-center justify-center gap-2 rounded-xl border bg-card text-sm min-[980px]:hidden"
					>
						<ArrowsDownUpIcon size={16} />
						Ordenar: {sort.label}
					</button>
					<BottomSheet
						open={sheetOpen}
						onOpenChange={setSheetOpen}
						title="Ordenar por"
					>
						<div
							role="radiogroup"
							aria-label="Ordenar por"
							className="flex flex-col"
						>
							{sortOptions.map((option) => (
								<label
									key={option.value}
									className="flex min-h-[52px] cursor-pointer items-center gap-3 border-t text-base"
								>
									<input
										type="radio"
										name="sort-sheet"
										checked={option.value === sort.value}
										onChange={() => {
											onSortChange(option.value);
											setSheetOpen(false);
										}}
										className="size-[18px] accent-primary"
									/>
									{option.label}
								</label>
							))}
						</div>
					</BottomSheet>

					<label className="hidden items-center gap-2.5 text-[13px] text-muted-foreground min-[980px]:flex">
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
