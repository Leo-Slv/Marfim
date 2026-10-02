import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { emptyAddressForm } from '../schemas/address-form.schema';
import {
	addressLines,
	maskPostalCode,
	toAddressRequest,
} from './format-address';

const address = {
	id: 'a1',
	label: 'Casa',
	recipientName: 'Ana Ribeiro',
	phone: null,
	street: 'Rua Fradique Coutinho',
	number: '120',
	complement: 'apto 42',
	neighborhood: 'Pinheiros',
	city: 'São Paulo',
	state: 'SP',
	postalCode: '05416000',
	country: 'BR',
	isDefaultShipping: true,
	isDefaultBilling: true,
};

describe('maskPostalCode', () => {
	it('keeps digits only and adds the hyphen after five', () => {
		assert.equal(maskPostalCode('05416'), '05416');
		assert.equal(maskPostalCode('05416000'), '05416-000');
		assert.equal(maskPostalCode('05.416-000 extra 99'), '05416-000');
	});
});

describe('addressLines', () => {
	it('formats the card lines like the mockup', () => {
		assert.deepEqual(addressLines(address), {
			streetLine: 'Rua Fradique Coutinho, 120 · apto 42',
			placeLine: 'Pinheiros · São Paulo, SP · 05416-000',
		});
	});

	it('omits a missing complement', () => {
		assert.equal(
			addressLines({ ...address, complement: null }).streetLine,
			'Rua Fradique Coutinho, 120',
		);
	});
});

describe('toAddressRequest', () => {
	const form = {
		...emptyAddressForm,
		recipientName: ' Ana Ribeiro ',
		postalCode: '05416000',
		street: 'Rua A',
		number: '1',
		neighborhood: 'Centro',
		city: 'São Paulo',
	};

	it('fills the label, country and masked CEP', () => {
		const request = toAddressRequest(form, 2);
		assert.equal(request.label, 'Endereço 3');
		assert.equal(request.country, 'BR');
		assert.equal(request.postalCode, '05416-000');
		assert.equal(request.recipientName, 'Ana Ribeiro');
		assert.equal(request.complement, null);
	});

	it('keeps a label the shopper typed', () => {
		assert.equal(
			toAddressRequest({ ...form, label: 'Trabalho' }, 0).label,
			'Trabalho',
		);
	});
});
