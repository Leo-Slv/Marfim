import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { FaqEntry } from '../model/content';
import { filterFaqs } from './filter-faqs';

const entries: FaqEntry[] = [
	{
		category: 'Trocas',
		question: 'Qual o prazo?',
		answer: 'Devolução em 30 dias.',
	},
	{
		category: 'Conta',
		question: 'Esqueci minha senha.',
		answer: 'Use o link.',
	},
	{ category: 'Pagamento', question: 'Tem Pix?', answer: 'Em breve.' },
];

describe('filterFaqs', () => {
	it('keeps everything for Todas without a term', () => {
		assert.equal(filterFaqs(entries, 'Todas', '').length, 3);
	});

	it('filters by category', () => {
		assert.deepEqual(
			filterFaqs(entries, 'Conta', '').map((entry) => entry.category),
			['Conta'],
		);
	});

	it('matches the term in questions and answers ignoring accents and case', () => {
		assert.equal(filterFaqs(entries, 'Todas', 'DEVOLUCAO').length, 1);
		assert.equal(filterFaqs(entries, 'Todas', '  senha ').length, 1);
	});

	it('combines category and term', () => {
		assert.equal(filterFaqs(entries, 'Conta', 'pix').length, 0);
	});
});
