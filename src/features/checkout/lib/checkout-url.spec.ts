import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { CustomerAddress } from '../model/address';
import { initialAddressId } from './checkout-url';

const address = (
	id: string,
	isDefaultShipping = false,
	isDefaultBilling = false,
): CustomerAddress => ({
	id,
	label: id,
	recipientName: 'Ana',
	phone: null,
	street: 'Rua',
	number: '1',
	complement: null,
	neighborhood: 'Centro',
	city: 'São Paulo',
	state: 'SP',
	postalCode: '01000-000',
	country: 'BR',
	isDefaultShipping,
	isDefaultBilling,
});

const addresses = [address('a'), address('b', true), address('c', false, true)];

describe('initialAddressId', () => {
	it('prefers the address in the URL when it still exists', () => {
		assert.equal(initialAddressId(addresses, 'c', 'shipping'), 'c');
	});

	it('falls back to the default of that kind', () => {
		assert.equal(initialAddressId(addresses, 'gone', 'shipping'), 'b');
		assert.equal(initialAddressId(addresses, null, 'billing'), 'c');
	});

	it('falls back to the first, or null without addresses', () => {
		assert.equal(
			initialAddressId([address('x'), address('y')], null, 'shipping'),
			'x',
		);
		assert.equal(initialAddressId([], null, 'shipping'), null);
	});
});
