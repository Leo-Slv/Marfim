'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { BottomSheet } from '@/components/bottom-sheet';
import { ArrowLeftIcon, XIcon } from '@phosphor-icons/react';
import { useState } from 'react';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';

import { notify } from '@/features/account/components/account-toast';
import { useCategories } from '@/features/catalog/hooks/catalog.queries';
import { formatCurrencyBrlCents } from '@/features/catalog/lib/format-currency-brl';
import { QueryErrorState } from '@/features/errors/components/query-error-state';
import { useMediaQuery } from '@/lib/hooks/use-media-query';
import { cn } from '@/lib/utils';

import {
	SaveStepError,
	useAdminProduct,
	useProductActions,
} from '../hooks/admin-products.queries';
import {
	discountLabel,
	editorDefaults,
	editorFormSchema,
	nextVariantSku,
	parseMoney,
	productErrorCopy,
	productStatusClass,
	productStatusLabel,
	savePlan,
	type EditorForm,
	type SaveStep,
} from '../lib/product-form';
import type { AdminProduct } from '../schemas/admin-products.schema';
import { ProductArtPreview } from './product-art-preview';
import {
	SectionLabel,
	SelectInput,
	TextArea,
	TextInput,
} from './product-fields';

const stepLabels: Record<SaveStep['kind'], string> = {
	details: 'os dados',
	clearCompareAt: 'o preço “de”',
	price: 'o preço',
	compareAt: 'o preço “de”',
	variant: 'uma variante',
};

function saveErrorCopy(error: unknown) {
	if (error instanceof SaveStepError) {
		return `Não foi possível salvar ${stepLabels[error.step]}: ${productErrorCopy(error.failure)} O que veio antes foi salvo.`;
	}
	return productErrorCopy(error);
}

/** The product editor (AdminProdutos.dc.html, right side). */
function ProductEditor({
	productId,
	onClose,
}: {
	productId: string;
	onClose: () => void;
}) {
	const product = useAdminProduct(productId);
	// Lives here so it survives the form remounting after a (partial) save.
	const [error, setError] = useState<string | null>(null);

	return (
		<div className="flex flex-col gap-3.5">
			<button
				type="button"
				onClick={onClose}
				className="flex min-h-8 items-center gap-1.5 self-start text-sm font-medium text-primary hover:text-primary-strong min-[1280px]:hidden"
			>
				<ArrowLeftIcon size={14} />
				Produtos
			</button>
			{product.isPending ? (
				<div className="flex flex-col gap-3.5">
					<div className="skeleton h-8 w-1/2 rounded-lg" />
					<div className="skeleton h-72 rounded-2xl" />
					<div className="skeleton h-40 rounded-2xl" />
				</div>
			) : product.isError ? (
				<QueryErrorState
					key={product.errorUpdatedAt}
					error={product.error}
					onRetry={() => void product.refetch()}
				/>
			) : (
				// A fresh form after every save (the refetched product is the truth).
				<EditorForm
					key={product.dataUpdatedAt}
					product={product.data}
					error={error}
					setError={setError}
				/>
			)}
		</div>
	);
}

function EditorForm({
	product,
	error,
	setError,
}: {
	product: AdminProduct;
	error: string | null;
	setError: (error: string | null) => void;
}) {
	const categories = useCategories();
	const actions = useProductActions(product.id);
	const [confirmDiscontinue, setConfirmDiscontinue] = useState(false);
	// Below 980 px the confirm is a bottom sheet (MobileAdminProdutos.dc.html).
	const mobile = useMediaQuery('(max-width: 979px)') === true;
	const [removingVariant, setRemovingVariant] = useState<string | null>(null);

	const form = useForm<EditorForm>({
		resolver: zodResolver(editorFormSchema),
		defaultValues: editorDefaults(product),
	});
	const newVariants = useFieldArray({
		control: form.control,
		name: 'newVariants',
	});
	const [name, price, compareAt] = useWatch({
		control: form.control,
		name: ['name', 'price', 'compareAt'],
	});
	const errors = form.formState.errors;
	const dirty = form.formState.isDirty;
	const busy =
		actions.save.isPending ||
		actions.publish.isPending ||
		actions.discontinue.isPending;

	const priceValue = parseMoney(price);
	const compareValue = parseMoney(compareAt);
	const discount = discountLabel(priceValue, compareValue);
	const category = categories.data?.find(
		(item) => item.id === product.categoryId,
	);
	const pendingSkus = [...product.variants.map((variant) => variant.sku)];
	const draftSkus = newVariants.fields.map(() => {
		const sku = nextVariantSku(product.sku, pendingSkus);
		pendingSkus.push(sku);
		return sku;
	});

	async function saveChanges(values: EditorForm) {
		const steps = savePlan(product, values);
		if (steps.length > 0) {
			await actions.save.mutateAsync(steps);
		}
		return steps.length;
	}

	const onSave = form.handleSubmit(async (values) => {
		setError(null);
		try {
			const saved = await saveChanges(values);
			notify(saved > 0 ? 'Produto salvo' : 'Nada para salvar');
		} catch (failure) {
			setError(saveErrorCopy(failure));
		}
	});

	const onPublish = form.handleSubmit(async (values) => {
		setError(null);
		try {
			await saveChanges(values);
			await actions.publish.mutateAsync();
			notify('Publicado na loja');
		} catch (failure) {
			setError(saveErrorCopy(failure));
		}
	});

	function onDiscontinue() {
		setError(null);
		actions.discontinue.mutate(undefined, {
			onSuccess: () => {
				setConfirmDiscontinue(false);
				notify('Produto descontinuado');
			},
			onError: (failure) => setError(productErrorCopy(failure)),
		});
	}

	function onRemoveVariant(variantId: string) {
		setError(null);
		actions.removeVariant.mutate(variantId, {
			onSuccess: () => {
				setRemovingVariant(null);
				notify('Variante removida');
			},
			onError: (failure) => setError(productErrorCopy(failure)),
		});
	}

	return (
		<form
			onSubmit={onSave}
			noValidate
			className="flex animate-fade-in flex-col gap-3.5"
		>
			<div className="flex flex-wrap items-center gap-2.5">
				<h2 className="min-w-0 grow truncate text-[22px] font-medium">
					{name.trim() || 'Produto sem nome'}
				</h2>
				<span
					key={product.status}
					className={cn(
						'inline-flex h-[26px] animate-pop-in items-center rounded-full px-2.5 text-xs font-medium',
						productStatusClass(product.status),
					)}
				>
					{productStatusLabel(product.status)}
				</span>
				{dirty ? (
					<span className="text-xs text-clay">Alterações não salvas</span>
				) : null}
			</div>

			<div className="grid grid-cols-1 gap-3.5 min-[1100px]:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
				<div className="flex flex-col gap-3 rounded-2xl border bg-card p-[18px]">
					<TextInput
						id="product-name"
						label="Nome"
						error={errors.name?.message}
						{...form.register('name')}
					/>
					<div className="flex flex-col gap-[5px] text-xs text-ink-soft">
						<span>Endereço na loja</span>
						<span
							className="flex h-10 items-center overflow-hidden rounded-[10px] border bg-surface font-mono text-xs"
							title="Criado a partir do nome quando o produto foi cadastrado."
						>
							<span className="pr-1 pl-3 text-muted-foreground">
								/products/
							</span>
							<span className="truncate text-foreground">{product.slug}</span>
						</span>
					</div>
					<div className="grid grid-cols-1 gap-2.5 min-[560px]:grid-cols-2">
						<SelectInput
							id="product-category"
							label="Categoria"
							value={product.categoryId}
							disabled
							hint="Definida ao criar o produto."
						>
							<option value={product.categoryId}>
								{category?.name ?? '…'}
							</option>
						</SelectInput>
						<TextInput
							id="product-brand"
							label="Marca (ateliê)"
							error={errors.brand?.message}
							{...form.register('brand')}
						/>
					</div>
					<TextArea
						id="product-description"
						label="Descrição"
						rows={4}
						error={errors.description?.message}
						{...form.register('description')}
					/>
					<span className="font-mono text-[11px] text-muted-foreground">
						SKU {product.sku}
					</span>
				</div>

				<div className="flex flex-col gap-3.5">
					<div className="flex flex-col gap-2.5 rounded-2xl border bg-card p-[18px]">
						<SectionLabel>PREÇO</SectionLabel>
						<div className="grid grid-cols-2 gap-2.5">
							<TextInput
								id="product-price"
								label="Preço (R$)"
								inputMode="decimal"
								className="font-mono"
								error={errors.price?.message}
								{...form.register('price')}
							/>
							<TextInput
								id="product-compare"
								label="Preço “de” (R$)"
								inputMode="decimal"
								placeholder="opcional"
								className="font-mono"
								error={errors.compareAt?.message}
								{...form.register('compareAt')}
							/>
						</div>
						<div className="flex flex-wrap items-baseline gap-2 rounded-[10px] bg-background px-3 py-2.5">
							<span className="font-mono text-[11px] tracking-[0.1em] text-muted-foreground">
								NA LOJA
							</span>
							<span className="font-mono text-[15px] font-medium">
								{priceValue ? formatCurrencyBrlCents(priceValue) : '—'}
							</span>
							{discount && compareValue ? (
								<>
									<span className="font-mono text-xs text-muted-foreground line-through">
										{formatCurrencyBrlCents(compareValue)}
									</span>
									<span className="inline-flex h-5 items-center rounded-full bg-success-soft px-[7px] font-mono text-[11px] text-success">
										{discount}
									</span>
								</>
							) : null}
						</div>
					</div>

					<div className="flex flex-col gap-2.5 rounded-2xl border bg-card p-[18px]">
						<div className="flex items-center">
							<span className="grow">
								<SectionLabel>VARIANTES</SectionLabel>
							</span>
							<button
								type="button"
								onClick={() => newVariants.append({ name: '' })}
								className="min-h-7 text-[13px] font-medium text-primary hover:text-primary-strong"
							>
								+ Variante
							</button>
						</div>
						{product.variants.map((variant) => (
							<div key={variant.id} className="flex flex-col gap-1.5">
								<div className="flex items-center gap-2">
									<span className="flex h-9 min-w-0 grow items-center truncate rounded-[9px] border bg-surface px-2.5 text-[13px]">
										{variant.name}
									</span>
									<span className="w-[100px] truncate font-mono text-[11px] text-muted-foreground">
										{variant.sku}
									</span>
									<button
										type="button"
										onClick={() => setRemovingVariant(variant.id)}
										aria-label={`Remover a variante ${variant.name}`}
										className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-surface hover:text-foreground"
									>
										<XIcon size={14} />
									</button>
								</div>
								{removingVariant === variant.id ? (
									<div className="flex animate-pop-in flex-wrap items-center gap-2 rounded-[10px] bg-clay-soft p-2.5 text-[13px]">
										<span className="grow">Remover “{variant.name}”?</span>
										<button
											type="button"
											disabled={actions.removeVariant.isPending}
											onClick={() => onRemoveVariant(variant.id)}
											className="h-8 rounded-lg bg-clay px-3 text-xs font-medium text-white disabled:opacity-55"
										>
											Remover
										</button>
										<button
											type="button"
											onClick={() => setRemovingVariant(null)}
											className="h-8 rounded-lg border bg-card px-3 text-xs"
										>
											Voltar
										</button>
									</div>
								) : null}
							</div>
						))}
						{newVariants.fields.map((field, index) => (
							<div key={field.id} className="flex animate-up flex-col gap-1">
								<div className="flex items-center gap-2">
									<input
										aria-label="Nome da nova variante"
										placeholder="Ex.: Latão escovado"
										aria-invalid={
											errors.newVariants?.[index]?.name ? true : undefined
										}
										className="h-9 min-w-0 grow rounded-[9px] border bg-card px-2.5 text-[13px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary aria-invalid:border-clay"
										{...form.register(`newVariants.${index}.name`)}
									/>
									<span className="w-[100px] truncate font-mono text-[11px] text-muted-foreground">
										{draftSkus[index]}
									</span>
									<button
										type="button"
										onClick={() => newVariants.remove(index)}
										aria-label="Descartar a nova variante"
										className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-surface hover:text-foreground"
									>
										<XIcon size={14} />
									</button>
								</div>
								{errors.newVariants?.[index]?.name ? (
									<span className="text-xs text-clay">
										{errors.newVariants[index]?.name?.message}
									</span>
								) : null}
							</div>
						))}
						{product.variants.length === 0 &&
						newVariants.fields.length === 0 ? (
							<span className="text-[13px] text-muted-foreground">
								Sem variantes.
							</span>
						) : null}
						{newVariants.fields.length > 0 ? (
							<span className="text-xs text-muted-foreground">
								As novas variantes são criadas ao salvar. Depois disso, o nome
								não pode ser trocado.
							</span>
						) : null}
					</div>
				</div>
			</div>

			<ProductArtPreview slug={product.slug} />

			{error ? (
				<p role="alert" className="text-[13px] text-clay">
					{error}
				</p>
			) : null}

			{confirmDiscontinue && !mobile ? (
				<div className="flex animate-pop-in flex-wrap items-center gap-2.5 rounded-[14px] bg-clay-soft p-3.5 text-[13px]">
					<span className="grow">
						Descontinuar “{product.name}”? Ele sai da loja e não pode voltar a
						ser publicado.
					</span>
					<button
						type="button"
						disabled={busy}
						onClick={onDiscontinue}
						className="h-9 rounded-[9px] bg-clay px-3 text-[13px] font-medium text-white disabled:opacity-55"
					>
						{actions.discontinue.isPending ? 'Descontinuando…' : 'Descontinuar'}
					</button>
					<button
						type="button"
						onClick={() => setConfirmDiscontinue(false)}
						className="h-9 rounded-[9px] border bg-card px-3 text-[13px]"
					>
						Voltar
					</button>
				</div>
			) : null}

			{/* Below 980 px: Descontinuar in the page, Salvar and Publicar in the
			    fixed bar (MobileAdminProdutos.dc.html). */}
			{product.status !== 'Discontinued' ? (
				<button
					type="button"
					onClick={() => setConfirmDiscontinue(true)}
					className="h-12 rounded-xl border bg-card text-[15px] font-medium text-clay min-[980px]:hidden"
				>
					Descontinuar
				</button>
			) : null}
			<div aria-hidden="true" className="h-20 min-[980px]:hidden" />
			<div className="fixed inset-x-0 bottom-0 z-30 flex gap-2 border-t bg-card px-4 pt-3 pb-[max(16px,env(safe-area-inset-bottom))] min-[980px]:static min-[980px]:z-auto min-[980px]:flex-wrap min-[980px]:items-center min-[980px]:gap-2.5 min-[980px]:border-0 min-[980px]:bg-transparent min-[980px]:p-0 min-[980px]:pt-1">
				{product.status === 'Draft' ? (
					<button
						type="button"
						disabled={busy}
						onClick={() => void onPublish()}
						className="h-[50px] flex-1 rounded-xl border border-success bg-card px-[18px] text-sm font-medium text-success transition-colors hover:bg-success-soft disabled:opacity-55 min-[980px]:order-2 min-[980px]:h-11 min-[980px]:flex-none"
					>
						{actions.publish.isPending ? 'Publicando…' : 'Publicar na loja'}
					</button>
				) : null}
				<button
					type="submit"
					disabled={busy}
					className="h-[50px] flex-1 rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-strong disabled:opacity-55 min-[980px]:order-1 min-[980px]:h-11 min-[980px]:flex-none"
				>
					{actions.save.isPending && !actions.publish.isPending
						? 'Salvando…'
						: 'Salvar'}
				</button>
				<span className="hidden grow min-[980px]:order-3 min-[980px]:block" />
				{product.status !== 'Discontinued' && !confirmDiscontinue ? (
					<button
						type="button"
						onClick={() => setConfirmDiscontinue(true)}
						className="hidden min-h-8 text-[13px] font-medium text-clay hover:underline min-[980px]:order-4 min-[980px]:block"
					>
						Descontinuar
					</button>
				) : null}
			</div>

			<BottomSheet
				open={confirmDiscontinue && mobile}
				onOpenChange={setConfirmDiscontinue}
				title={`Descontinuar ${product.name}?`}
				description="Ele sai da loja e não pode voltar a ser publicado."
			>
				<button
					type="button"
					disabled={busy}
					onClick={onDiscontinue}
					className="h-[50px] rounded-xl bg-clay text-[15px] font-medium text-white disabled:opacity-55"
				>
					{actions.discontinue.isPending
						? 'Descontinuando…'
						: 'Sim, descontinuar'}
				</button>
				<button
					type="button"
					onClick={() => setConfirmDiscontinue(false)}
					className="h-12 rounded-xl border bg-card text-[15px] font-medium"
				>
					Manter produto
				</button>
			</BottomSheet>
		</form>
	);
}

export { ProductEditor };
