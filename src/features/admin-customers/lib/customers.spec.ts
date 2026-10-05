import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { CustomerAddress } from '@/features/checkout/model/address';

import {
	addressTags,
	customerInitials,
	customerSince,
	orderStats,
} from './customers';

describe('customers', () => {
	it('makes initials from the first and last names', () => {
		assert.equal(customerInitials('Ana Teste Ribeiro'), 'AR');
		assert.equal(customerInitials('Ana'), 'AN');
		assert.equal(customerInitials('[CLIENTE 2]'), 'C2');
		assert.equal(customerInitials(''), '?');
	});

	it('says since when, in store time', () => {
		assert.equal(customerSince('2026-07-01T12:00:00Z'), 'jul 2026');
		// 02:00 UTC on 1 Aug is still July in São Paulo.
		assert.equal(customerSince('2026-08-01T02:00:00Z'), 'jul 2026');
	});

	it('counts only paid orders as money spent', () => {
		const order = (
			status: 'Confirmed' | 'Cancelled' | 'Delivered' | 'PendingPayment',
			totalAmount: number,
		) => ({
			id: status,
			orderNumber: 'ORD',
			status,
			createdAt: '',
			totalAmount,
		});
		assert.deepEqual(
			orderStats(
				[
					order('Confirmed', 100),
					order('Delivered', 50),
					order('Cancelled', 999),
					order('PendingPayment', 999),
				],
				4,
			),
			{ orders: 4, spent: 150 },
		);
	});

	it('labels the default addresses', () => {
		const address = (shipping: boolean, billing: boolean) =>
			({
				isDefaultShipping: shipping,
				isDefaultBilling: billing,
			}) as CustomerAddress;
		assert.equal(addressTags(address(true, true)), 'entrega e cobrança padrão');
		assert.equal(addressTags(address(false, true)), 'cobrança padrão');
		assert.equal(addressTags(address(false, false)), 'sem padrão');
	});
});
