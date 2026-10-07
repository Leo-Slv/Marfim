'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowDownIcon, ArrowUpIcon, InfoIcon } from '@phosphor-icons/react';
import { useForm, useWatch } from 'react-hook-form';

import { ComingSoonBadge } from '@/components/coming-soon-badge';
import { Eyebrow } from '@/components/eyebrow';
import { notify } from '@/features/account/components/account-toast';
import { useCategories } from '@/features/catalog/hooks/catalog.queries';
import type { Category } from '@/features/catalog/model/category';
import { cn } from '@/lib/utils';

import {
	useCategoryCounts,
	useCreateCategory,
} from '../hooks/admin-categories.queries';
import {
	categoryErrorCopy,
	categorySlug,
	findDuplicate,
	newCategoryFormSchema,
	type NewCategoryForm,
} from '../lib/category-form';

const columns =
	'grid grid-cols-[64px_minmax(140px,1fr)_220px_90px_100px_200px] items-center gap-3';

/** Admin · Categorias (AdminCategorias.dc.html). */
function CategoriesPage() {
	const categories = useCategories();
	const counts = useCategoryCounts(categories.data);

	return (
		<div className="flex flex-col gap-3 px-4 py-3.5 min-[980px]:gap-[18px] min-[980px]:px-8 min-[980px]:py-7">
			<div className="flex flex-wrap items-end gap-4">
				<div className="flex grow flex-col gap-1 max-[979px]:sr-only">
					{' '}
					<Eyebrow className="tracking-[0.16em]">CATÁLOGO</Eyebrow>
					<h1 className="text-[34px] font-light tracking-[-0.025em]">
						Categorias
					</h1>
				</div>
				<span className="text-[13px] text-muted-foreground max-[979px]:order-last max-[979px]:px-0.5">
					{' '}
					A ordem aqui é a ordem do menu da loja.
				</span>
			</div>

			<NewCategoryCard categories={categories.data ?? []} />

			<div className="flex flex-col gap-2 min-[980px]:hidden">
				{categories.isError && !categories.data ? (
					<div
						role="alert"
						className="flex flex-col items-center gap-2 rounded-2xl border bg-card p-8 text-sm text-ink-soft"
					>
						Não foi possível carregar as categorias.
						<button
							type="button"
							onClick={() => void categories.refetch()}
							className="font-medium text-primary"
						>
							Tentar de novo
						</button>
					</div>
				) : !categories.data ? (
					[0, 1, 2, 3].map((index) => (
						<div key={index} className="skeleton h-[112px] rounded-2xl" />
					))
				) : (
					<>
						<span className="px-0.5 font-mono text-[10px] tracking-[0.14em] text-muted-foreground">
							{categories.data.length} CATEGORIAS · {categories.data.length} NO
							MENU
						</span>
						{categories.data.map((category, index) => (
							<CategoryCard
								key={category.id}
								category={category}
								position={index + 1}
								first={index === 0}
								last={index === categories.data.length - 1}
								count={counts.data?.[category.id]}
							/>
						))}
					</>
				)}
			</div>
			<div className="hidden overflow-hidden rounded-2xl border bg-card min-[980px]:block">
				{' '}
				<div className="overflow-x-auto">
					<div className="min-w-[860px]">
						<div
							className={cn(
								columns,
								'bg-surface px-[18px] py-2.5 font-mono text-[10px] tracking-[0.12em] text-muted-foreground',
							)}
						>
							<span>ORDEM</span>
							<span>NOME</span>
							<span>ENDEREÇO</span>
							<span>PRODUTOS</span>
							<span>NO MENU</span>
							<span className="flex justify-end">
								<ComingSoonBadge />
							</span>
						</div>
						{categories.isError && !categories.data ? (
							<div
								role="alert"
								className="flex flex-col items-center gap-2 border-t p-10 text-sm text-ink-soft"
							>
								Não foi possível carregar as categorias.
								<button
									type="button"
									onClick={() => void categories.refetch()}
									className="font-medium text-primary hover:text-primary-strong"
								>
									Tentar de novo
								</button>
							</div>
						) : !categories.data ? (
							<div className="flex flex-col gap-2 border-t p-[18px]">
								{[0, 1, 2, 3].map((index) => (
									<div key={index} className="skeleton h-10 rounded-lg" />
								))}
							</div>
						) : (
							categories.data.map((category, index) => (
								<CategoryRow
									key={category.id}
									category={category}
									first={index === 0}
									last={index === categories.data.length - 1}
									count={counts.data?.[category.id]}
									delay={index * 0.04}
								/>
							))
						)}
					</div>
				</div>
			</div>
			<p className="text-xs text-muted-foreground">
				Só é possível excluir categorias sem produtos. Mova os produtos antes,
				na tela Produtos. Reordenar, renomear, tirar do menu e excluir ainda não
				estão disponíveis no sistema da loja.
			</p>
		</div>
	);
}

function NewCategoryCard({ categories }: { categories: Category[] }) {
	const create = useCreateCategory();
	const form = useForm<NewCategoryForm>({
		resolver: zodResolver(newCategoryFormSchema),
		defaultValues: { name: '' },
	});
	const name = useWatch({ control: form.control, name: 'name' });
	const duplicate = findDuplicate(name, categories);
	const slug = categorySlug(name);
	const fieldError = form.formState.errors.name?.message;

	const onSubmit = form.handleSubmit((values) => {
		if (findDuplicate(values.name, categories)) {
			return;
		}
		create.mutate(values.name.trim(), {
			onSuccess: (category) => {
				form.reset({ name: '' });
				notify(`Categoria “${category.name}” criada`);
			},
		});
	});

	return (
		<div className="flex flex-col gap-2">
			<form
				onSubmit={onSubmit}
				noValidate
				className="flex flex-col gap-2.5 rounded-2xl border bg-card px-[18px] py-4 min-[720px]:flex-row min-[720px]:items-end"
			>
				<div className="flex grow flex-col gap-[5px] text-xs text-ink-soft">
					<label htmlFor="new-category-name">Nova categoria</label>
					<input
						id="new-category-name"
						placeholder="Ex.: Banho"
						aria-invalid={fieldError || duplicate ? true : undefined}
						aria-describedby="new-category-help"
						className="h-[42px] rounded-[10px] border bg-card px-3 text-[15px] text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary aria-invalid:border-clay"
						{...form.register('name')}
					/>
				</div>
				<span className="truncate font-mono text-xs text-muted-foreground min-[720px]:w-[260px] min-[720px]:pb-3">
					/products?categoria={slug || '…'}
				</span>
				<button
					type="submit"
					disabled={create.isPending || duplicate !== null}
					className="h-[42px] rounded-xl bg-primary px-[18px] text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-strong disabled:opacity-55"
				>
					{create.isPending ? 'Adicionando…' : 'Adicionar'}
				</button>
			</form>
			<div id="new-category-help" className="flex flex-col gap-1 text-[13px]">
				{duplicate ? (
					<span role="alert" className="text-clay">
						Já existe uma categoria com esse nome.
					</span>
				) : fieldError ? (
					<span role="alert" className="text-clay">
						{fieldError}
					</span>
				) : create.isError ? (
					<span role="alert" className="text-clay">
						{categoryErrorCopy(create.error)}
					</span>
				) : (
					<span className="flex items-start gap-1.5 text-muted-foreground">
						<InfoIcon size={15} className="mt-px shrink-0" />A nova categoria
						entra no menu da loja assim que é criada, mesmo sem produtos.
					</span>
				)}
			</div>
		</div>
	);
}

/** Below 980 px: one card per category (MobileAdminCategorias.dc.html). */
function CategoryCard({
	category,
	position,
	first,
	last,
	count,
}: {
	category: Category;
	position: number;
	first: boolean;
	last: boolean;
	count: number | undefined;
}) {
	const soon = 'Em breve';
	const disabledAction =
		'min-h-11 px-1.5 text-sm font-medium disabled:opacity-40';
	return (
		<div className="flex animate-up flex-col gap-2.5 rounded-2xl border bg-card px-3.5 py-3">
			<div className="flex items-center gap-2.5">
				<span className="w-5 font-mono text-xs text-muted-foreground">
					{position}
				</span>
				<span className="flex min-w-0 grow flex-col gap-0.5">
					<span className="text-base font-medium">{category.name}</span>
					<span className="truncate font-mono text-[11px] text-muted-foreground">
						/products?categoria={category.slug}
					</span>
				</span>
				<button
					type="button"
					role="switch"
					aria-checked="true"
					disabled
					title={soon}
					aria-label={`${category.name} no menu (em breve)`}
					className="flex h-11 w-[52px] shrink-0 items-center opacity-60"
				>
					<span className="flex h-[30px] w-[52px] justify-end rounded-full bg-primary p-[3px]">
						<span className="size-6 rounded-full bg-white" />
					</span>
				</button>
			</div>
			<div className="flex items-center gap-2 pl-[30px]">
				<span className="inline-flex h-6 items-center rounded-full bg-surface px-[9px] font-mono text-[11px] font-medium text-ink-soft">
					{count === undefined
						? '…'
						: `${count} ${count === 1 ? 'produto' : 'produtos'}`}
				</span>
				<span className="inline-flex h-6 items-center rounded-full bg-success-soft px-[9px] text-[11px] font-medium text-success">
					No menu
				</span>
			</div>
			<div className="flex items-center gap-1.5 border-t pt-2">
				<button
					type="button"
					disabled
					title={soon}
					aria-label={`Subir ${category.name} (em breve)`}
					className="flex size-11 items-center justify-center rounded-xl border text-muted-foreground disabled:opacity-40"
				>
					<ArrowUpIcon size={15} />
				</button>
				<button
					type="button"
					disabled
					title={soon}
					aria-label={`Descer ${category.name} (em breve)`}
					className={cn(
						'flex size-11 items-center justify-center rounded-xl border text-muted-foreground disabled:opacity-40',
						(first || last) && 'opacity-40',
					)}
				>
					<ArrowDownIcon size={15} />
				</button>
				<span className="grow" />
				<button
					type="button"
					disabled
					title={soon}
					className={cn(disabledAction, 'text-primary')}
				>
					Renomear
				</button>
				<button
					type="button"
					disabled
					title={count ? 'Tem produtos: mova-os antes' : soon}
					className={cn(disabledAction, 'text-clay')}
				>
					Excluir
				</button>
			</div>
		</div>
	);
}

function CategoryRow({
	category,
	first,
	last,
	count,
	delay,
}: {
	category: Category;
	first: boolean;
	last: boolean;
	count: number | undefined;
	delay: number;
}) {
	const soon = 'Em breve';

	return (
		<div
			className={cn(columns, 'animate-up border-t px-[18px] py-3 text-sm')}
			style={{ animationDelay: `${delay}s` }}
		>
			<span className="flex gap-0.5">
				<button
					type="button"
					disabled
					title={soon}
					aria-label={`Subir ${category.name} (em breve)`}
					className="flex h-8 w-[26px] items-center justify-center rounded-[7px] text-muted-foreground disabled:opacity-40"
				>
					<ArrowUpIcon size={13} />
				</button>
				<button
					type="button"
					disabled
					title={soon}
					aria-label={`Descer ${category.name} (em breve)`}
					className={cn(
						'flex h-8 w-[26px] items-center justify-center rounded-[7px] text-muted-foreground disabled:opacity-40',
						(first || last) && 'opacity-40',
					)}
				>
					<ArrowDownIcon size={13} />
				</button>
			</span>
			<span className="truncate font-medium">{category.name}</span>
			<span className="truncate font-mono text-xs text-muted-foreground">
				/products?categoria={category.slug}
			</span>
			<span className="font-mono text-[13px]">
				{count === undefined ? (
					<span className="skeleton inline-block h-4 w-6 rounded" />
				) : (
					count
				)}
			</span>
			<span>
				{/* Every category is in the menu today; hiding one is EM BREVE. */}
				<button
					type="button"
					role="switch"
					aria-checked="true"
					disabled
					title={soon}
					aria-label={`${category.name} no menu (em breve)`}
					className="flex h-[26px] w-11 justify-end rounded-full bg-primary p-[3px] opacity-60"
				>
					<span className="size-5 rounded-full bg-white" />
				</button>
			</span>
			<span className="flex items-center justify-end gap-3">
				<button
					type="button"
					disabled
					title={soon}
					className="min-h-8 text-[13px] font-medium text-primary disabled:opacity-40"
				>
					Renomear
				</button>
				<button
					type="button"
					disabled
					title={count ? 'Tem produtos: mova-os antes' : soon}
					className="min-h-8 text-[13px] font-medium text-clay disabled:opacity-40"
				>
					Excluir
				</button>
			</span>
		</div>
	);
}

export { CategoriesPage };
