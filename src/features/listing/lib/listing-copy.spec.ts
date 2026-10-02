import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { formatPieceCount } from '@/features/catalog/lib/format-piece-count';

import {
	categoryBlurb,
	emptyStateCopy,
	formatResultCount,
	isSearchable,
} from './listing-copy';

describe('categoryBlurb', () => {
	it('has copy for Tudo, Novidades and each mockup category', () => {
		assert.match(categoryBlurb(null), /quatro ateliês/);
		assert.match(categoryBlurb('novidades'), /bancadas/);
		assert.match(categoryBlurb('iluminacao'), /latão/);
	});

	it('falls back for a category the mockup does not know', () => {
		assert.equal(
			categoryBlurb('jardim'),
			'Peças feitas à mão pelos nossos ateliês.',
		);
	});
});

describe('counts', () => {
	it('pluralizes pieces', () => {
		assert.equal(formatPieceCount(1), '1 peça');
		assert.equal(formatPieceCount(8), '8 peças');
	});

	it('pluralizes results and quotes the term', () => {
		assert.equal(formatResultCount(1, 'lumin'), '1 resultado para “lumin”');
		assert.equal(formatResultCount(0, 'x y'), '0 resultados para “x y”');
	});
});

describe('isSearchable', () => {
	it('needs at least 2 non-blank characters', () => {
		assert.equal(isSearchable(' a '), false);
		assert.equal(isSearchable('lu'), true);
	});
});

describe('emptyStateCopy', () => {
	it('quotes the trimmed term in search mode', () => {
		assert.equal(
			emptyStateCopy('search', ' xyz ').title,
			'Nada encontrado para “xyz”',
		);
	});

	it('has its own copy for promotions and categories', () => {
		assert.equal(
			emptyStateCopy('promotions', '').title,
			'Nenhuma promoção no momento',
		);
		assert.equal(
			emptyStateCopy('category', '').title,
			'Nenhuma peça nesta categoria ainda',
		);
	});
});
