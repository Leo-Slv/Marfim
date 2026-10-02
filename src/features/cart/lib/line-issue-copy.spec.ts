import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { lineNotice, unavailableCopy } from './line-issue-copy';

describe('lineNotice', () => {
	it('explains a price change and lets the shopper accept it', () => {
		assert.deepEqual(
			lineNotice('PriceChanged', {
				previousUnitPrice: 339,
				unitPrice: 359,
				quantity: 1,
			}),
			{
				text: 'O preço mudou de R$ 339 para R$ 359 desde que você adicionou.',
				action: 'acknowledge',
				actionLabel: 'Entendi',
			},
		);
	});

	it('offers to decrease when there is not enough stock for the quantity', () => {
		assert.equal(
			lineNotice('InsufficientStock', {
				previousUnitPrice: null,
				unitPrice: 89,
				quantity: 3,
			})?.action,
			'decrease',
		);
	});

	it('offers to remove when even one unit is not available', () => {
		assert.equal(
			lineNotice('InsufficientStock', {
				previousUnitPrice: null,
				unitPrice: 89,
				quantity: 1,
			})?.action,
			'remove',
		);
	});

	it('has no notice for a line without issues', () => {
		assert.equal(
			lineNotice(null, { previousUnitPrice: null, unitPrice: 89, quantity: 1 }),
			null,
		);
	});
});

describe('unavailableCopy', () => {
	it('labels missing and unavailable products differently', () => {
		assert.equal(unavailableCopy('NotFound').code, 'NÃO ENCONTRADA');
		assert.equal(unavailableCopy('Unavailable').code, 'INDISPONÍVEL');
	});
});
