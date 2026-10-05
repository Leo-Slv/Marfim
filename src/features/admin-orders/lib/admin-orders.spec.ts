import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { ApiError } from '@/lib/http/api-error';

import type { TimelineEntry } from '../schemas/admin-orders.schema';
import {
	appendNote,
	charactersLeft,
	MAX_NOTES_LENGTH,
	parseNotes,
} from './internal-notes';
import {
	actionErrorCopy,
	canCancel,
	cancelToast,
	nextAction,
	paymentSummary,
	shipFormSchema,
	statusNote,
} from './order-actions';
import { parsePage, parseTab } from './order-tabs';
import { timelineItems } from './order-timeline-labels';

describe('tabs', () => {
	it('maps ?status= to a single OrderCore status', () => {
		assert.equal(parseTab('a-preparar').status, 'Confirmed');
		assert.equal(parseTab('cancelados').status, 'Cancelled');
		assert.equal(parseTab(null).status, null);
		assert.equal(parseTab('qualquer').id, 'todos');
		assert.equal(parsePage('3'), 3);
		assert.equal(parsePage('-1'), 1);
		assert.equal(parsePage('abc'), 1);
	});
});

describe('internal notes', () => {
	const now = new Date('2026-10-02T13:21:00.000Z');

	it('appends notes and reads them back as a list', () => {
		const first = appendNote(null, 'Embalar separado.', 'ana@marfim.com', now);
		const second = appendNote(
			first,
			'Cliente ligou.\nConfirmou o endereço.',
			'leo@marfim.com',
			now,
		);
		assert.deepEqual(parseNotes(second), [
			{
				text: 'Embalar separado.',
				author: 'ana@marfim.com',
				at: '2026-10-02T13:21:00.000Z',
			},
			{
				text: 'Cliente ligou.\nConfirmou o endereço.',
				author: 'leo@marfim.com',
				at: '2026-10-02T13:21:00.000Z',
			},
		]);
	});

	it('keeps text written elsewhere as its own note', () => {
		const notes = appendNote('Texto antigo da API', 'Nova', 'a@b.c', now);
		assert.deepEqual(
			parseNotes(notes).map((note) => [note.text, note.author]),
			[
				['Texto antigo da API', null],
				['Nova', 'a@b.c'],
			],
		);
		assert.deepEqual(parseNotes('  '), []);
	});

	it('counts what is left of the 2000 characters', () => {
		const left = charactersLeft(null, 'a@b.c', now);
		assert.equal(
			left,
			MAX_NOTES_LENGTH - appendNote(null, '', 'a@b.c', now).length,
		);
		assert.ok(left < MAX_NOTES_LENGTH);
	});
});

describe('order actions', () => {
	it('picks the next fulfilment step', () => {
		assert.equal(nextAction('Confirmed'), 'start');
		assert.equal(nextAction('Processing'), 'ship');
		assert.equal(nextAction('Shipped'), 'deliver');
		assert.equal(nextAction('Delivered'), 'none');
		assert.equal(canCancel('Processing'), true);
		assert.equal(canCancel('Shipped'), false);
	});

	it('explains the end states', () => {
		assert.match(statusNote('Cancelled', 'Voided'), /não foi cobrado/);
		assert.match(statusNote('Cancelled', 'Refunded'), /estornado/);
		assert.equal(statusNote('Delivered', null), 'Pedido concluído.');
		assert.equal(
			paymentSummary({ method: 'Card', status: 'Authorized' }),
			'Cartão · pagamento autorizado',
		);
		assert.equal(
			cancelToast('Voided'),
			'Pedido cancelado e autorização liberada',
		);
	});

	it('maps action errors by code', () => {
		assert.match(
			actionErrorCopy(
				new ApiError('x', 409, { code: 'payment_capture_failed' }),
			),
			/captura/,
		);
		assert.match(
			actionErrorCopy(new ApiError('x', 400, { code: 'invalid_order_state' })),
			/mudou/,
		);
	});

	it('validates the shipping form', () => {
		assert.equal(
			shipFormSchema.safeParse({
				carrier: 'Correios',
				trackingCode: 'BR123',
				trackingUrl: '',
			}).success,
			true,
		);
		assert.equal(
			shipFormSchema.safeParse({
				carrier: ' ',
				trackingCode: 'BR123',
				trackingUrl: '',
			}).success,
			false,
		);
		assert.equal(
			shipFormSchema.safeParse({
				carrier: 'Correios',
				trackingCode: 'BR123',
				trackingUrl: 'rastreio.com',
			}).success,
			false,
		);
	});
});

const entry = (
	type: string,
	occurredAt: string,
	details: Record<string, string | null> = {},
): TimelineEntry => ({
	eventId: `${type}-${occurredAt}`,
	type,
	source: type.split('.')[0],
	occurredAt,
	details,
});

describe('timelineItems', () => {
	it('labels events in pt-BR and groups stock movements', () => {
		const items = timelineItems(
			[
				entry('orders.order-created', '2026-10-02T16:15:11Z'),
				entry('inventory.stock-reserved', '2026-10-02T16:15:12Z', {
					quantity: '3',
				}),
				entry('inventory.stock-reserved', '2026-10-02T16:15:12Z', {
					quantity: '2',
				}),
				entry('payments.payment-authorized', '2026-10-02T16:22:33Z'),
				entry('orders.order-shipped', '2026-10-03T10:00:00Z'),
				entry('orders.order-cancelled', '2026-10-03T11:00:00Z', {
					reason: 'Cancelled by the customer',
				}),
			],
			'Correios',
		);
		assert.deepEqual(
			items.map((item) => item.label),
			[
				'Pedido criado',
				'Estoque reservado · 5 un.',
				'Pagamento aprovado',
				'Enviado · Correios',
				'Pedido cancelado',
			],
		);
	});
});
