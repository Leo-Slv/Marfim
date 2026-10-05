import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { ApiError } from '@/lib/http/api-error';

import type { AdminProduct } from '../schemas/admin-products.schema';
import {
	discountLabel,
	editorDefaults,
	editorFormSchema,
	formatMoneyInput,
	newProductFormSchema,
	nextVariantSku,
	parseMoney,
	productErrorCopy,
	savePlan,
} from './product-form';

const product: AdminProduct = {
	id: 'p1',
	sku: 'MF-ORBE',
	slug: 'pendente-orbe',
	name: 'Pendente Orbe',
	shortDescription: 'Resumo',
	description: null,
	brand: 'Oficina Faísca',
	categoryId: 'c1',
	currentPrice: 359,
	compareAtPrice: 449,
	currency: 'BRL',
	status: 'Active',
	variants: [{ id: 'v1', sku: 'MF-ORBE-1', name: 'Latão', additionalPrice: 0 }],
};

describe('money', () => {
	it('reads pt-BR prices', () => {
		assert.equal(parseMoney('1.290,00'), 1290);
		assert.equal(parseMoney('R$ 359,9'), 359.9);
		assert.equal(parseMoney('1290.5'), 1290.5);
		assert.equal(parseMoney('12,345'), null);
		assert.equal(parseMoney('abc'), null);
		assert.equal(parseMoney(''), null);
		assert.equal(formatMoneyInput(1290.5), '1290,50');
		assert.equal(discountLabel(359, 449), '−20%');
		assert.equal(discountLabel(359, null), null);
	});

	it('generates the next free variant SKU', () => {
		assert.equal(nextVariantSku('MF-ORBE', ['MF-ORBE-1']), 'MF-ORBE-2');
		assert.equal(nextVariantSku('MF-ORBE', []), 'MF-ORBE-1');
	});
});

describe('forms', () => {
	it('requires a "de" price above the price', () => {
		const values = { ...editorDefaults(product), compareAt: '300,00' };
		const result = editorFormSchema.safeParse(values);
		assert.equal(result.success, false);
		assert.equal(
			result.error?.issues[0].message,
			'O preço “de” precisa ser maior que o preço.',
		);
		assert.equal(
			editorFormSchema.safeParse(editorDefaults(product)).success,
			true,
		);
	});

	it('validates a new product', () => {
		assert.equal(
			newProductFormSchema.safeParse({
				name: 'Banco Tora',
				sku: 'MF-TORA',
				categoryId: 'c1',
				price: '690',
			}).success,
			true,
		);
		assert.equal(
			newProductFormSchema.safeParse({
				name: 'Banco',
				sku: 'MF TORA',
				categoryId: 'c1',
				price: '0',
			}).success,
			false,
		);
	});
});

describe('savePlan', () => {
	it('does nothing when nothing changed', () => {
		assert.deepEqual(savePlan(product, editorDefaults(product)), []);
	});

	it('clears the "de" price before a price that crosses it', () => {
		const steps = savePlan(product, {
			...editorDefaults(product),
			price: '500,00',
			compareAt: '599,00',
		});
		assert.deepEqual(
			steps.map((step) => step.kind),
			['clearCompareAt', 'price', 'compareAt'],
		);
	});

	it('ends a promotion and keeps the short description', () => {
		const steps = savePlan(product, {
			...editorDefaults(product),
			brand: '',
			compareAt: '',
		});
		assert.deepEqual(steps, [
			{
				kind: 'details',
				details: {
					name: 'Pendente Orbe',
					shortDescription: 'Resumo',
					description: null,
					brand: null,
				},
			},
			{ kind: 'clearCompareAt' },
		]);
	});

	it('adds new variants with generated SKUs', () => {
		const steps = savePlan(product, {
			...editorDefaults(product),
			newVariants: [{ name: 'Preto fosco' }, { name: 'Cobre' }],
		});
		assert.deepEqual(steps, [
			{ kind: 'variant', sku: 'MF-ORBE-2', name: 'Preto fosco' },
			{ kind: 'variant', sku: 'MF-ORBE-3', name: 'Cobre' },
		]);
	});
});

describe('productErrorCopy', () => {
	it('maps OrderCore codes', () => {
		assert.equal(
			productErrorCopy(new ApiError('x', 409, { code: 'sku_already_exists' })),
			'Já existe um produto com este SKU.',
		);
	});
});
