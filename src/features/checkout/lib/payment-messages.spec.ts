import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { ApiError } from '@/lib/http/api-error';

import { checkoutAlert, paymentFailureReason } from './payment-messages';

const error = (
	status: number,
	code: string | null,
	retryAfterSeconds?: number,
) => new ApiError('x', status, { code, retryAfterSeconds });

describe('checkoutAlert', () => {
	it('maps the checkout conflicts to their notices', () => {
		assert.equal(checkoutAlert(error(409, 'price_changed')).kind, 'price');
		assert.equal(checkoutAlert(error(409, 'insufficient_stock')).kind, 'stock');
		assert.equal(
			checkoutAlert(error(409, 'product_unavailable')).kind,
			'stock',
		);
		assert.equal(
			checkoutAlert(error(403, 'email_not_confirmed')).kind,
			'email',
		);
	});

	it('locks after too many attempts', () => {
		assert.deepEqual(
			[checkoutAlert(error(429, 'too_many_requests', 20)).lockSeconds],
			[20],
		);
		assert.equal(checkoutAlert(error(429, null)).lockSeconds, 60);
	});

	it('falls back to a generic notice', () => {
		assert.equal(checkoutAlert(new Error('x')).kind, 'generic');
		assert.equal(checkoutAlert(error(400, 'validation_error')).kind, 'generic');
	});
});

describe('paymentFailureReason', () => {
	it('explains known reasons and defaults to the bank refusal', () => {
		assert.match(paymentFailureReason('payment_window_expired'), /30 minutos/);
		assert.match(paymentFailureReason('card_declined'), /não autorizou/);
		assert.match(paymentFailureReason(null), /Nenhum valor foi cobrado/);
	});
});
