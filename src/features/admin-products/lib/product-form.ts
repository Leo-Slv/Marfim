import { z } from 'zod';

import { isApiError } from '@/lib/http/api-error';

import type {
	AdminProduct,
	ProductStatus,
} from '../schemas/admin-products.schema';

const statusInfo: Record<ProductStatus, { label: string; className: string }> =
	{
		Draft: { label: 'Rascunho', className: 'bg-surface text-ink-soft' },
		Active: { label: 'Publicado', className: 'bg-success-soft text-success' },
		Discontinued: {
			label: 'Descontinuado',
			className: 'bg-clay-soft text-clay',
		},
	};

function productStatusLabel(status: ProductStatus) {
	return statusInfo[status].label;
}

function productStatusClass(status: ProductStatus) {
	return statusInfo[status].className;
}

/** "1.290,00", "1290,5", "1290.50" or "1290" → 1290.5; null if not a price. */
function parseMoney(input: string): number | null {
	const value = input.trim().replace(/^R\$\s*/i, '');
	if (!value) {
		return null;
	}
	const normalized = value.includes(',')
		? value.replace(/\./g, '').replace(',', '.')
		: value;
	if (!/^\d+(\.\d{1,2})?$/.test(normalized)) {
		return null;
	}
	return Math.round(Number(normalized) * 100) / 100;
}

/** 1290.5 → "1290,50" (what the price inputs show). */
function formatMoneyInput(amount: number | null) {
	return amount === null ? '' : amount.toFixed(2).replace('.', ',');
}

/** "−20%" off the "de" price; null when there's no promotion. */
function discountLabel(price: number | null, compareAt: number | null) {
	if (price === null || compareAt === null || compareAt <= price) {
		return null;
	}
	return `−${Math.round((1 - price / compareAt) * 100)}%`;
}

/** `{product SKU}-{n}`, the first n not used yet. */
function nextVariantSku(productSku: string, taken: readonly string[]) {
	const used = new Set(taken.map((sku) => sku.toUpperCase()));
	let index = 1;
	while (used.has(`${productSku}-${index}`.toUpperCase())) {
		index++;
	}
	return `${productSku}-${index}`;
}

const priceField = z.string().refine((value) => (parseMoney(value) ?? 0) > 0, {
	message: 'Informe um preço maior que zero.',
});

const editorFormSchema = z
	.object({
		name: z.string().trim().min(1, 'Informe o nome.').max(200),
		brand: z.string().trim().max(100),
		description: z.string().trim().max(4000),
		price: priceField,
		compareAt: z
			.string()
			.refine((value) => !value.trim() || parseMoney(value) !== null, {
				message: 'Use um valor como 449,00.',
			}),
		newVariants: z.array(
			z.object({ name: z.string().trim().min(1, 'Dê um nome à variante.') }),
		),
	})
	.superRefine((values, context) => {
		const price = parseMoney(values.price);
		const compareAt = parseMoney(values.compareAt);
		if (price !== null && compareAt !== null && compareAt <= price) {
			context.addIssue({
				code: 'custom',
				path: ['compareAt'],
				message: 'O preço “de” precisa ser maior que o preço.',
			});
		}
	});

type EditorForm = z.infer<typeof editorFormSchema>;

const newProductFormSchema = z.object({
	name: z.string().trim().min(1, 'Informe o nome.').max(200),
	sku: z
		.string()
		.trim()
		.min(1, 'Informe o SKU.')
		.max(64)
		.regex(/^[A-Za-z0-9-]+$/, 'Use letras, números e hífen.'),
	categoryId: z.string().min(1, 'Escolha a categoria.'),
	price: priceField,
});

type NewProductForm = z.infer<typeof newProductFormSchema>;

function editorDefaults(product: AdminProduct): EditorForm {
	return {
		name: product.name,
		brand: product.brand ?? '',
		description: product.description ?? '',
		price: formatMoneyInput(product.currentPrice),
		compareAt: formatMoneyInput(product.compareAtPrice),
		newVariants: [],
	};
}

type SaveStep =
	| {
			kind: 'details';
			details: {
				name: string;
				shortDescription: string | null;
				description: string | null;
				brand: string | null;
			};
	  }
	| { kind: 'clearCompareAt' }
	| { kind: 'price'; price: number }
	| { kind: 'compareAt'; compareAt: number }
	| { kind: 'variant'; sku: string; name: string };

const blankToNull = (value: string) => value.trim() || null;

/**
 * The calls Salvar makes, in an order OrderCore accepts at every step: the
 * "de" price must stay above the current price, so it's cleared before a
 * price change that would cross it and set again afterwards.
 */
function savePlan(product: AdminProduct, values: EditorForm): SaveStep[] {
	const steps: SaveStep[] = [];
	const details = {
		name: values.name.trim(),
		shortDescription: product.shortDescription,
		description: blankToNull(values.description),
		brand: blankToNull(values.brand),
	};
	if (
		details.name !== product.name ||
		details.description !== product.description ||
		details.brand !== product.brand
	) {
		steps.push({ kind: 'details', details });
	}

	const price = parseMoney(values.price) ?? product.currentPrice;
	const compareAt = parseMoney(values.compareAt);
	const priceChanged = price !== product.currentPrice;
	const compareChanged = compareAt !== product.compareAtPrice;

	let compareCleared = false;
	if (
		product.compareAtPrice !== null &&
		(compareChanged || (priceChanged && price >= product.compareAtPrice))
	) {
		steps.push({ kind: 'clearCompareAt' });
		compareCleared = true;
	}
	if (priceChanged) {
		steps.push({ kind: 'price', price });
	}
	if (compareAt !== null && (compareChanged || compareCleared)) {
		steps.push({ kind: 'compareAt', compareAt });
	}

	const skus = product.variants.map((variant) => variant.sku);
	for (const variant of values.newVariants) {
		const sku = nextVariantSku(product.sku, skus);
		skus.push(sku);
		steps.push({ kind: 'variant', sku, name: variant.name.trim() });
	}
	return steps;
}

/** pt-BR copy for a failed product action, by OrderCore's error code. */
function productErrorCopy(error: unknown) {
	if (isApiError(error)) {
		switch (error.code) {
			case 'sku_already_exists':
				return 'Já existe um produto com este SKU.';
			case 'slug_already_exists':
				return 'Não foi possível criar o endereço na loja para este nome. Tente outro nome.';
			case 'variant_sku_already_exists':
				return 'Já existe uma variante com este SKU.';
			case 'invalid_compare_at_price':
				return 'O preço “de” precisa ser maior que o preço.';
			case 'invalid_product_state':
			case 'concurrency_conflict':
				return 'Este produto mudou enquanto você editava. Atualizamos os dados — confira e tente de novo.';
			case 'not_found':
				return 'A categoria escolhida não existe mais.';
			case 'validation_error':
				return 'Confira os dados e tente de novo.';
		}
		if (error.status === 503 || error.status === 408) {
			return 'Não conseguimos falar com a loja agora. Tente de novo em instantes.';
		}
	}
	return 'Algo deu errado. Tente de novo em instantes.';
}

export type { EditorForm, NewProductForm, SaveStep };
export {
	discountLabel,
	editorDefaults,
	editorFormSchema,
	formatMoneyInput,
	newProductFormSchema,
	nextVariantSku,
	parseMoney,
	productErrorCopy,
	productStatusClass,
	productStatusLabel,
	savePlan,
};
