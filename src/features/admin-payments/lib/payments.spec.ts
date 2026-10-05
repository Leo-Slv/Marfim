import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { ApiError } from '@/lib/http/api-error';

import type { Payment } from '../schemas/admin-payments.schema';
import {
	canRefund,
	declineExplanation,
	parsePaymentTab,
	paymentErrorCopy,
	paymentEvents,
	paymentStatusView,
	reconciliationMessage,
	refundableBalance,
	validateRefund,
} from './payments';

const payment = (overrides: Partial<Payment> = {}): Payment => ({
	id: 'p1',
	orderId: 'o1',
	amount: 924,
	method: 'Card',
	status: 'Captured',
	provider: 'Stripe',
	providerReference: 'pi_123',
	failureReason: null,
	createdAt: '2026-10-02T16:15:00Z',
	authorizedAt: '2026-10-02T16:22:00Z',
	capturedAt: '2026-10-02T18:30:00Z',
	voidedAt: null,
	lastDeclineReason: null,
	lastDeclinedAt: null,
	disputedAt: null,
	refunds: [],
	...overrides,
});

describe('payments', () => {
	it('maps ?status= and the pills', () => {
		assert.equal(parsePaymentTab('recusados').status, 'Failed');
		assert.equal(parsePaymentTab(null).status, null);
		assert.equal(paymentStatusView('Captured', 0).label, 'Capturado');
		assert.equal(paymentStatusView('Captured', 10).label, 'Estorno parcial');
		assert.equal(paymentStatusView('Voided', 0).label, 'Liberado');
	});

	it('explains Stripe decline codes', () => {
		assert.equal(
			declineExplanation('insufficient_funds'),
			'Saldo ou limite insuficiente.',
		);
		assert.equal(declineExplanation('weird_code'), 'Recusado pelo banco.');
	});

	it('computes the refundable balance, ignoring failed refunds', () => {
		const refunded = payment({
			refunds: [
				{
					id: 'r1',
					amount: 100,
					reason: 'x',
					status: 'Completed',
					requestedAt: '2026-10-03T10:00:00Z',
					processedAt: '2026-10-03T10:01:00Z',
				},
				{
					id: 'r2',
					amount: 50,
					reason: 'x',
					status: 'Failed',
					requestedAt: '2026-10-03T11:00:00Z',
					processedAt: null,
				},
			],
		});
		assert.equal(refundableBalance(refunded), 824);
		assert.equal(canRefund(refunded), true);
		assert.equal(canRefund(payment({ status: 'Authorized' })), false);
		assert.equal(validateRefund('10,00', 824), null);
		assert.match(validateRefund('0', 824) ?? '', /entre R\$ 0,01 e R\$ 824,00/);
		assert.match(validateRefund('900', 824) ?? '', /entre/);
	});

	it('lists the events oldest first', () => {
		const events = paymentEvents(
			payment({
				lastDeclineReason: 'card_declined',
				lastDeclinedAt: '2026-10-02T16:20:00Z',
				refunds: [
					{
						id: 'r1',
						amount: 10,
						reason: 'x',
						status: 'Pending',
						requestedAt: '2026-10-05T10:00:00Z',
						processedAt: null,
					},
				],
			}),
		);
		assert.deepEqual(
			events.map((event) => event.label),
			[
				'Pagamento criado',
				'Recusado pelo banco · card_declined',
				'Autorizado',
				'Capturado',
				'Estorno de R$ 10,00 · aguardando o Stripe',
			],
		);
	});

	it('describes a reconciliation', () => {
		assert.equal(
			reconciliationMessage({
				statusBefore: 'Captured',
				statusAfter: 'Captured',
				providerStatus: 'succeeded',
				changed: false,
			}).text,
			'Status no Stripe igual ao da loja: capturado.',
		);
		assert.equal(
			reconciliationMessage({
				statusBefore: 'Pending',
				statusAfter: 'Authorized',
				providerStatus: 'requires_capture',
				changed: true,
			}).text,
			'Corrigido: estava aguardando, agora autorizado.',
		);
	});

	it('maps refund errors', () => {
		assert.match(
			paymentErrorCopy(
				new ApiError('x', 400, { code: 'refund_exceeds_balance' }),
			),
			/passa do que/,
		);
	});
});
