import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { buildTimeline } from './order-timeline';

const created = '2026-10-02T16:21:00Z';

describe('buildTimeline', () => {
	it('shows done steps, the current one and what is ahead', () => {
		const steps = buildTimeline(
			[
				{
					fromStatus: null,
					toStatus: 'PendingPayment',
					reason: null,
					changedAt: created,
				},
				{
					fromStatus: 'PendingPayment',
					toStatus: 'Confirmed',
					reason: null,
					changedAt: '2026-10-02T16:22:31Z',
				},
			],
			'Confirmed',
			created,
		);
		assert.deepEqual(
			steps.map((step) => [step.label, step.state]),
			[
				['Aguardando pagamento', 'done'],
				['Confirmado', 'current'],
				['Em preparo', 'ahead'],
				['Enviado', 'ahead'],
				['Entregue', 'ahead'],
			],
		);
		assert.equal(steps[1].note, 'Pagamento aprovado no cartão.');
		assert.equal(steps[2].at, null);
	});

	it('always shows the current status, even when the history lags', () => {
		const steps = buildTimeline([], 'Confirmed', created);
		assert.deepEqual(
			steps.map((step) => [step.label, step.state]),
			[
				['Aguardando pagamento', 'done'],
				['Confirmado', 'current'],
				['Em preparo', 'ahead'],
				['Enviado', 'ahead'],
				['Entregue', 'ahead'],
			],
		);
		assert.equal(steps[1].at, null);
	});

	it('adds the creation step when the history starts later', () => {
		const steps = buildTimeline([], 'PendingPayment', created);
		assert.equal(steps[0].label, 'Aguardando pagamento');
		assert.equal(steps[0].state, 'current');
		assert.equal(steps[0].at, created);
	});

	it('ends the line at a cancellation, with the pt-BR note (never the raw reason)', () => {
		const steps = buildTimeline(
			[
				{
					fromStatus: 'PendingPayment',
					toStatus: 'Confirmed',
					reason: null,
					changedAt: '2026-10-02T16:22:00Z',
				},
				{
					fromStatus: 'Confirmed',
					toStatus: 'Cancelled',
					reason: 'Cancelled by the customer',
					changedAt: '2026-10-02T17:00:00Z',
				},
			],
			'Cancelled',
			created,
		);
		assert.deepEqual(
			steps.map((step) => [step.label, step.state]),
			[
				['Aguardando pagamento', 'done'],
				['Confirmado', 'done'],
				['Cancelado', 'stopped'],
			],
		);
		assert.equal(steps[2].note, 'As peças voltaram ao estoque.');
	});

	it('replaces a code reason with the editorial note', () => {
		const steps = buildTimeline(
			[
				{
					fromStatus: 'PendingPayment',
					toStatus: 'PaymentFailed',
					reason: 'payment_window_expired',
					changedAt: '2026-10-02T17:00:00Z',
				},
			],
			'PaymentFailed',
			created,
		);
		assert.equal(steps.at(-1)?.note, 'O banco não autorizou a transação.');
	});
});
