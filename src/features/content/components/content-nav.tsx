import Link from 'next/link';

import { appRoutes } from '@/lib/routes/app-routes';
import { cn } from '@/lib/utils';

import { contentGroups } from '../lib/content-pages';
import type { ContentSlug } from '../model/content';

/** Desktop: sticky index by group. */
function ContentSideNav({ current }: { current: ContentSlug }) {
	return (
		<nav
			aria-label="Institucional e ajuda"
			className="sticky top-6 hidden flex-col gap-[18px] min-[980px]:col-span-3 min-[980px]:flex"
		>
			{contentGroups.map((group) => (
				<div key={group.title} className="flex flex-col gap-0.5">
					<div className="px-3 pb-1.5 font-mono text-[11px] tracking-[0.16em] text-muted-foreground">
						{group.title}
					</div>
					{group.pages.map((page) => {
						const active = page.slug === current;
						return (
							<Link
								key={page.slug}
								href={appRoutes.content.page(page.slug)}
								aria-current={active ? 'page' : undefined}
								className={cn(
									'flex h-10 items-center rounded-[10px] px-3 text-sm transition-colors',
									active
										? 'bg-card font-medium text-primary'
										: 'text-foreground hover:bg-surface-2',
								)}
							>
								{page.label}
							</Link>
						);
					})}
				</div>
			))}
		</nav>
	);
}

/** Mobile: the same pages as a row of chips. */
function ContentChipNav({ current }: { current: ContentSlug }) {
	return (
		<nav
			aria-label="Institucional e ajuda"
			className="flex [scrollbar-width:none] gap-1.5 overflow-x-auto border-b px-4 py-3 min-[980px]:hidden [&::-webkit-scrollbar]:hidden"
		>
			{contentGroups
				.flatMap((group) => group.pages)
				.map((page) => {
					const active = page.slug === current;
					return (
						<Link
							key={page.slug}
							href={appRoutes.content.page(page.slug)}
							aria-current={active ? 'page' : undefined}
							className={cn(
								'flex h-[38px] shrink-0 items-center rounded-full border px-3.5 text-sm whitespace-nowrap',
								active
									? 'border-primary bg-primary font-medium text-primary-foreground'
									: 'bg-card text-foreground',
							)}
						>
							{page.label}
						</Link>
					);
				})}
		</nav>
	);
}

export { ContentChipNav, ContentSideNav };
