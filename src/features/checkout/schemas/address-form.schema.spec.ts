import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { addressFormSchema, emptyAddressForm } from './address-form.schema';

const valid = {
	...emptyAddressForm,
	recipientName: 'Ana',
	postalCode: '05416-000',
	street: 'Rua A',
	number: '1',
	neighborhood: 'Centro',
	city: 'São Paulo',
};

const invalidFields = (form: unknown) =>
	addressFormSchema
		.safeParse(form)
		.error?.issues.map((issue) => issue.path[0]) ?? [];

describe('addressFormSchema', () => {
	it('accepts a complete address with an empty label and complement', () => {
		assert.equal(addressFormSchema.safeParse(valid).success, true);
	});

	it('flags the fields the backend requires', () => {
		assert.deepEqual(invalidFields(emptyAddressForm).sort(), [
			'city',
			'neighborhood',
			'number',
			'postalCode',
			'recipientName',
			'street',
		]);
	});

	it('needs 8 CEP digits and a known UF', () => {
		assert.deepEqual(invalidFields({ ...valid, postalCode: '0541-000' }), [
			'postalCode',
		]);
		assert.deepEqual(invalidFields({ ...valid, state: 'XX' }), ['state']);
	});
});
