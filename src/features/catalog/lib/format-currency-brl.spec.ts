import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
	formatCurrencyBrl,
	formatCurrencyBrlCents,
} from './format-currency-brl';

describe('formatCurrencyBrl', () => {
	it('drops the cents for whole amounts', () => {
		assert.equal(formatCurrencyBrl(489), 'R$ 489');
	});

	it('groups thousands with a dot', () => {
		assert.equal(formatCurrencyBrl(1290), 'R$ 1.290');
	});

	it('shows two decimals with a comma for fractional amounts', () => {
		assert.equal(formatCurrencyBrl(189.9), 'R$ 189,90');
	});
});

describe('formatCurrencyBrlCents', () => {
	it('always shows two decimals', () => {
		assert.equal(formatCurrencyBrlCents(488), 'R$ 488,00');
		assert.equal(formatCurrencyBrlCents(1290.5), 'R$ 1.290,50');
	});
});
