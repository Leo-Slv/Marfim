import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { AuditLog } from '../schemas/admin-audit.schema';
import {
	actionLabel,
	actorOf,
	auditDetails,
	auditLinks,
	isUuid,
	parseEntityTab,
	shortId,
} from './audit';

const log = (overrides: Partial<AuditLog>): AuditLog => ({
	id: 'l1',
	userId: null,
	action: 'OrderCancelled',
	entityName: 'Order',
	entityId: '619bb23b-4869-4319-95dd-2515c83170be',
	metadata: {},
	createdAt: '2026-10-05T12:12:52Z',
	...overrides,
});

describe('audit', () => {
	it('maps tabs, actions and ids', () => {
		assert.equal(parseEntityTab('pagamento').entityName, 'Payment');
		assert.equal(parseEntityTab(null).entityName, null);
		assert.equal(actionLabel('OrderProcessingStarted'), 'Iniciou o preparo');
		assert.equal(actionLabel('SomethingNew'), 'SomethingNew');
		assert.equal(isUuid(' 619bb23b-4869-4319-95dd-2515c83170be '), true);
		assert.equal(isUuid('ORD-2026-000001'), false);
		assert.equal(shortId('619bb23b-4869-4319-95dd-2515c83170be'), '619bb23b');
	});

	it('labels the details and drops empty values', () => {
		assert.deepEqual(
			auditDetails(
				log({
					metadata: {
						reason: 'Cancelled by the store',
						payment: 'Voided',
						note: '',
					},
				}),
			).map((detail) => `${detail.label}: ${detail.value}`),
			['Motivo: Cancelled by the store', 'Pagamento: Voided'],
		);
	});

	it('links the record and the related ones', () => {
		assert.deepEqual(
			auditLinks(
				log({
					entityName: 'InventoryReservation',
					entityId: 'r1',
					metadata: { productId: 'p1', quantity: '2' },
				}),
			),
			[
				{
					label: 'Ver estoque do produto',
					href: '/admin/inventory?produto=p1',
				},
			],
		);
		assert.deepEqual(
			auditLinks(
				log({
					entityName: 'Payment',
					entityId: 'pay1',
					metadata: { orderId: 'o1' },
				}),
			).map((link) => link.href),
			['/admin/payments?pagamento=pay1', '/admin/orders?pedido=o1'],
		);
	});

	it('names the actor', () => {
		assert.deepEqual(actorOf(null, 'me', undefined), {
			name: 'Sistema',
			kind: 'system',
		});
		assert.deepEqual(actorOf('me', 'me', undefined), {
			name: 'Você',
			kind: 'admin',
		});
		assert.deepEqual(
			actorOf('u1', 'me', { role: 'Customer', customerName: 'Ana Ribeiro' }),
			{ name: 'Ana Ribeiro', kind: 'customer' },
		);
		assert.deepEqual(actorOf('u2', 'me', { role: null, customerName: null }), {
			name: 'Administrador',
			kind: 'admin',
		});
		assert.equal(
			actorOf('abcdef12-0000', 'me', undefined).name,
			'Usuário abcdef12',
		);
	});
});
