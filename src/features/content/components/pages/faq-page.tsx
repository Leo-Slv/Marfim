'use client';

import { MagnifyingGlassIcon, PlusIcon } from '@phosphor-icons/react';
import { useState } from 'react';

import { ComingSoonBadge } from '@/components/coming-soon-badge';
import { cn } from '@/lib/utils';

import { faqEntries } from '../../lib/content-copy';
import { filterFaqs } from '../../lib/filter-faqs';
import { faqCategories, type FaqCategory } from '../../model/content';
import { PageHeading } from '../content-ui';

/** 32 · Perguntas frequentes: search + categories + accordion. */
function FaqPage() {
	const [term, setTerm] = useState('');
	const [category, setCategory] = useState<FaqCategory>('Todas');
	const faqs = filterFaqs(faqEntries, category, term);

	return (
		<>
			<PageHeading eyebrow="AJUDA" title="Perguntas" accent="frequentes" />
			<label className="mt-5 flex h-12 max-w-[640px] animate-up items-center gap-2 rounded-xl border bg-card px-3 [animation-delay:.12s] min-[980px]:mt-6 min-[980px]:h-14 min-[980px]:gap-3 min-[980px]:rounded-[14px] min-[980px]:px-[18px]">
				<MagnifyingGlassIcon size={18} className="text-muted-foreground" />
				<input
					type="search"
					aria-label="Buscar nas perguntas"
					placeholder="Buscar: troca, prazo, senha…"
					value={term}
					onChange={(event) => setTerm(event.target.value)}
					className="min-w-0 grow bg-transparent text-base outline-none min-[980px]:text-[17px]"
				/>
			</label>
			<div className="-mx-4 mt-4 flex [scrollbar-width:none] gap-1.5 overflow-x-auto px-4 min-[980px]:mx-0 min-[980px]:flex-wrap min-[980px]:gap-2 min-[980px]:px-0 [&::-webkit-scrollbar]:hidden">
				{faqCategories.map((item) => (
					<button
						key={item}
						type="button"
						onClick={() => setCategory(item)}
						aria-pressed={item === category}
						className={cn(
							'h-9 shrink-0 rounded-full px-3.5 text-[13px] font-medium transition-colors min-[980px]:h-[38px] min-[980px]:text-sm',
							item === category
								? 'bg-primary text-primary-foreground'
								: 'bg-surface text-ink-soft hover:bg-surface-2',
						)}
					>
						{item}
					</button>
				))}
			</div>
			<div className="mt-4 rounded-2xl border bg-card px-3.5 min-[980px]:mt-6 min-[980px]:rounded-none min-[980px]:border-x-0 min-[980px]:border-b-0 min-[980px]:bg-transparent min-[980px]:px-0">
				{faqs.map((faq) => (
					<details
						key={`${category}-${term}-${faq.question}`}
						className="group animate-up border-b border-surface transition-colors last:border-b-0 min-[980px]:rounded-xl min-[980px]:border-border min-[980px]:last:border-b min-[980px]:open:bg-card"
					>
						<summary className="flex min-h-14 cursor-pointer list-none items-center gap-2.5 py-2.5 min-[980px]:gap-4 min-[980px]:px-4 min-[980px]:py-5 [&::-webkit-details-marker]:hidden">
							<span className="flex grow flex-col gap-1 min-[980px]:flex-row min-[980px]:items-center min-[980px]:gap-4">
								<span className="font-mono text-[9px] tracking-[0.12em] text-muted-foreground min-[980px]:w-[90px] min-[980px]:shrink-0 min-[980px]:text-[10px]">
									{faq.category.toUpperCase()}
								</span>
								<span className="text-[15px] leading-[1.35] font-medium min-[980px]:text-[17px]">
									{faq.question}
								</span>
							</span>
							<PlusIcon
								size={18}
								className="shrink-0 text-primary transition-transform duration-200 group-open:rotate-45"
							/>
						</summary>
						<div className="max-w-[720px] pb-3.5 text-sm leading-[1.55] text-ink-soft min-[980px]:pr-4 min-[980px]:pb-5 min-[980px]:pl-[122px] min-[980px]:text-[15px] min-[980px]:leading-[1.65]">
							{faq.answer}
							{faq.soon ? (
								<>
									{' '}
									<ComingSoonBadge />
								</>
							) : null}
						</div>
					</details>
				))}
				{faqs.length === 0 ? (
					<div className="py-5 text-sm text-muted-foreground min-[980px]:py-10 min-[980px]:text-center min-[980px]:text-[15px]">
						Nenhuma pergunta encontrada para “{term.trim()}”. Fale com o
						atendimento abaixo.
					</div>
				) : null}
			</div>
		</>
	);
}

export { FaqPage };
