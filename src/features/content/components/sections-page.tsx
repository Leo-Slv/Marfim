import { CaretDownIcon } from '@phosphor-icons/react/dist/ssr';

import type { ContentSection, SectionsPage } from '../model/content';
import { Lead, PageHeading, SoonNote } from './content-ui';

/**
 * "Modelo B" (Prazos, Cuidados, Privacidade, Termos): sections with an
 * "on this page" index on desktop, open accordions on mobile.
 */
function SectionsPageBody({ page }: { page: SectionsPage }) {
	return (
		<>
			<PageHeading eyebrow={page.eyebrow} title={page.title} />
			<Lead>{page.intro}</Lead>
			{page.soon ? <SoonNote className="mt-5">{page.soon}</SoonNote> : null}
			<SectionsWithIndex sections={page.sections} />
		</>
	);
}

function SectionsWithIndex({
	sections,
}: {
	sections: readonly ContentSection[];
}) {
	return (
		<>
			<div className="mt-8 hidden grid-cols-[200px_minmax(0,1fr)] items-start gap-8 min-[980px]:grid">
				<OnThisPage
					links={sections.map((section) => ({
						id: section.id,
						label: section.heading,
					}))}
				/>
				<div className="flex max-w-[680px] flex-col gap-7 text-base leading-[1.7] text-ink-soft">
					{sections.map((section) => (
						<div
							key={section.id}
							id={section.id}
							className="flex scroll-mt-6 flex-col gap-2"
						>
							<h2 className="text-[22px] font-medium text-foreground">
								{section.heading}
							</h2>
							<p>{section.text}</p>
						</div>
					))}
				</div>
			</div>
			<div className="mt-5 rounded-2xl border bg-card px-3.5 min-[980px]:hidden">
				{sections.map((section) => (
					<details
						key={section.id}
						open
						className="group border-b border-surface last:border-b-0"
					>
						<summary className="flex min-h-[52px] cursor-pointer list-none items-center justify-between text-base font-medium [&::-webkit-details-marker]:hidden">
							{section.heading}
							<CaretDownIcon
								size={16}
								className="text-muted-foreground transition-transform duration-200 group-open:rotate-180"
							/>
						</summary>
						<p className="pb-3.5 text-sm leading-[1.6] text-ink-soft">
							{section.text}
						</p>
					</details>
				))}
			</div>
		</>
	);
}

/** Desktop "NESTA PÁGINA" index of anchors. */
function OnThisPage({ links }: { links: { id: string; label: string }[] }) {
	return (
		<nav
			aria-label="Nesta página"
			className="sticky top-6 flex flex-col gap-2.5 border-l-2 pl-3.5 text-sm"
		>
			<span className="font-mono text-[10px] tracking-[0.14em] text-muted-foreground">
				NESTA PÁGINA
			</span>
			{links.map((link) => (
				<a
					key={link.id}
					href={`#${link.id}`}
					className="text-ink-soft transition-colors hover:text-primary"
				>
					{link.label}
				</a>
			))}
		</nav>
	);
}

export { OnThisPage, SectionsPageBody };
