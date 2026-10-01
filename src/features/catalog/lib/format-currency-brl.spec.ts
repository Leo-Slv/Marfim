import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { formatCurrencyBrl } from './format-currency-brl';

// Intl separates the symbol from the amount with a non-breaking space.
const normalize = (value: string) => value.replace(/\s/g, ' ');

describe('formatCurrencyBrl', () => {
	it('formats with the R$ symbol and a comma decimal separator', () => {
		assert.equal(normalize(formatCurrencyBrl(189.9)), 'R$ 189,90');
	});

	it('groups thousands with a dot', () => {
		assert.equal(normalize(formatCurrencyBrl(1299)), 'R$ 1.299,00');
	});
});
