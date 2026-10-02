import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { paymentStage, processingStep } from './order-stage';

describe('paymentStage', () => {
	it('reviews before an order exists', () => {
		assert.equal(paymentStage(null, false), 'review');
	});

	it('asks for the card while pending, then waits once it was sent', () => {
		assert.equal(paymentStage('PendingPayment', false), 'card');
		assert.equal(paymentStage('PendingPayment', true), 'processing');
	});

	it('shows the outcome', () => {
		assert.equal(paymentStage('Confirmed', true), 'confirmed');
		assert.equal(paymentStage('Shipped', false), 'confirmed');
		assert.equal(paymentStage('PaymentFailed', true), 'failed');
		assert.equal(paymentStage('Cancelled', false), 'failed');
	});
});

describe('processingStep', () => {
	it('moves from waiting for the bank to confirming stock', () => {
		assert.equal(processingStep(0), 2);
		assert.equal(processingStep(5), 3);
	});
});
