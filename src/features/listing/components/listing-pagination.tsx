import { CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react';
import Link from 'next/link';

import { cn } from '@/lib/utils';

import { formatRange, pageNumbers } from '../lib/pagination';

type ListingPaginationProps = {
	page: number;
	pageSize: number;
	totalPages: number;
	totalItems: number;
	hrefForPage: (page: number) => string;
};

const arrowClassName =
	'flex size-11 items-center justify-center rounded-xl border bg-card transition-colors';

function ListingPagination({
	page,
	pageSize,
	totalPages,
	totalItems,
	hrefForPage,
}: ListingPaginationProps) {
	const isFirst = page <= 1;
	const isLast = page >= totalPages;

	return (
		<nav
			aria-label="Paginação"
			className="flex flex-wrap items-center justify-center gap-1.5"
		>
			{isFirst ? (
				<span
					aria-disabled="true"
					className={cn(arrowClassName, 'text-[#C4C3C8]')}
				>
					<CaretLeftIcon size={16} />
				</span>
			) : (
				<Link
					href={hrefForPage(page - 1)}
					aria-label="Página anterior"
					className={cn(arrowClassName, 'text-foreground hover:bg-surface-2')}
				>
					<CaretLeftIcon size={16} />
				</Link>
			)}
			{pageNumbers(totalPages).map((number) => {
				const current = number === page;
				return (
					<Link
						key={number}
						href={hrefForPage(number)}
						aria-current={current ? 'page' : undefined}
						aria-label={`Página ${number}`}
						className={cn(
							'flex size-11 items-center justify-center rounded-xl border font-mono text-sm transition-colors',
							current
								? 'border-foreground bg-foreground text-background'
								: 'bg-card text-foreground hover:bg-surface-2',
						)}
					>
						{number}
					</Link>
				);
			})}
			{isLast ? (
				<span
					aria-disabled="true"
					className={cn(arrowClassName, 'text-[#C4C3C8]')}
				>
					<CaretRightIcon size={16} />
				</span>
			) : (
				<Link
					href={hrefForPage(page + 1)}
					aria-label="Próxima página"
					className={cn(arrowClassName, 'text-foreground hover:bg-surface-2')}
				>
					<CaretRightIcon size={16} />
				</Link>
			)}
			<span className="ml-3 font-mono text-xs text-muted-foreground">
				{formatRange(page, pageSize, totalItems)}
			</span>
		</nav>
	);
}

export { ListingPagination };
