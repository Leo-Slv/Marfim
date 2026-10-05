'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { notify } from '@/features/account/components/account-toast';
import { useCategories } from '@/features/catalog/hooks/catalog.queries';

import { useCreateProduct } from '../hooks/admin-products.queries';
import {
	newProductFormSchema,
	parseMoney,
	productErrorCopy,
	type NewProductForm,
} from '../lib/product-form';
import { SelectInput, TextInput } from './product-fields';

/** "+ Novo": what OrderCore needs to create a draft (SKU included). */
function NewProductFormCard({
	onCreated,
	onCancel,
}: {
	onCreated: (productId: string) => void;
	onCancel: () => void;
}) {
	const categories = useCategories();
	const create = useCreateProduct();
	const form = useForm<NewProductForm>({
		resolver: zodResolver(newProductFormSchema),
		defaultValues: { name: '', sku: '', categoryId: '', price: '' },
	});
	const errors = form.formState.errors;

	const onSubmit = form.handleSubmit((values) =>
		create.mutate(
			{
				name: values.name.trim(),
				sku: values.sku.trim().toUpperCase(),
				categoryId: values.categoryId,
				currentPrice: parseMoney(values.price) ?? 0,
			},
			{
				onSuccess: (product) => {
					notify('Rascunho criado');
					onCreated(product.id);
				},
			},
		),
	);

	return (
		<section className="flex animate-up flex-col gap-3.5">
			<div className="flex items-center gap-2.5">
				<h2 className="grow text-[22px] font-medium">Novo produto</h2>
				<span className="inline-flex h-[26px] items-center rounded-full bg-surface px-2.5 text-xs font-medium text-ink-soft">
					Rascunho
				</span>
			</div>
			<form
				onSubmit={onSubmit}
				noValidate
				className="flex max-w-[560px] flex-col gap-3 rounded-2xl border bg-card p-[18px]"
			>
				<TextInput
					id="new-product-name"
					label="Nome"
					error={errors.name?.message}
					hint="O endereço na loja é criado a partir do nome."
					{...form.register('name')}
				/>
				<div className="grid grid-cols-1 gap-2.5 min-[560px]:grid-cols-2">
					<TextInput
						id="new-product-sku"
						label="SKU"
						placeholder="MF-NOME"
						className="font-mono uppercase"
						error={errors.sku?.message}
						{...form.register('sku')}
					/>
					<TextInput
						id="new-product-price"
						label="Preço (R$)"
						inputMode="decimal"
						placeholder="0,00"
						className="font-mono"
						error={errors.price?.message}
						{...form.register('price')}
					/>
				</div>
				<SelectInput
					id="new-product-category"
					label="Categoria"
					error={errors.categoryId?.message}
					hint="Não dá para trocar depois."
					{...form.register('categoryId')}
				>
					<option value="">Escolha…</option>
					{(categories.data ?? []).map((category) => (
						<option key={category.id} value={category.id}>
							{category.name}
						</option>
					))}
				</SelectInput>
				{create.isError ? (
					<p role="alert" className="text-[13px] text-clay">
						{productErrorCopy(create.error)}
					</p>
				) : null}
				<div className="flex gap-2.5 pt-1">
					<button
						type="submit"
						disabled={create.isPending}
						className="h-11 rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-strong disabled:opacity-55"
					>
						{create.isPending ? 'Criando…' : 'Criar rascunho'}
					</button>
					<button
						type="button"
						onClick={onCancel}
						className="h-11 rounded-xl border bg-card px-4 text-sm font-medium transition-colors hover:bg-surface-2"
					>
						Cancelar
					</button>
				</div>
			</form>
		</section>
	);
}

export { NewProductFormCard };
