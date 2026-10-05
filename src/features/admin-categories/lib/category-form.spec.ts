import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { ApiError } from '@/lib/http/api-error';

import {
	categoryErrorCopy,
	categorySlug,
	findDuplicate,
	newCategoryFormSchema,
} from './category-form';

const categories = [
	{ id: 'c1', name: 'Iluminação', slug: 'iluminacao' },
	{ id: 'c2', name: 'Têxteis', slug: 'texteis' },
];

describe('category form', () => {
	it('previews the address OrderCore will create', () => {
		assert.equal(categorySlug('Banho & Spa'), 'banho-spa');
		assert.equal(categorySlug('  Mesa Posta '), 'mesa-posta');
	});

	it('finds a duplicate by address, ignoring accents and case', () => {
		assert.equal(findDuplicate('iluminacao', categories)?.id, 'c1');
		assert.equal(findDuplicate('TÊXTEIS', categories)?.id, 'c2');
		assert.equal(findDuplicate('Banho', categories), null);
		assert.equal(findDuplicate('', categories), null);
	});

	it('needs a name with letters or numbers', () => {
		assert.equal(
			newCategoryFormSchema.safeParse({ name: 'Banho' }).success,
			true,
		);
		assert.equal(
			newCategoryFormSchema.safeParse({ name: '  ' }).success,
			false,
		);
		assert.equal(
			newCategoryFormSchema.safeParse({ name: '!!!' }).success,
			false,
		);
	});

	it('explains a server-side duplicate', () => {
		assert.match(
			categoryErrorCopy(new ApiError('x', 500, { code: 'internal_error' })),
			/Talvez já exista/,
		);
	});
});
