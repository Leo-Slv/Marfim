import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { ApiError } from '@/lib/http/api-error';

import {
	attemptsLabel,
	consequenceOf,
	failureErrorCopy,
	messageTitle,
	parseFailureTab,
	prettyBody,
} from './failed-messages';

describe('failed messages', () => {
	it('names the event and its consumer in pt-BR', () => {
		assert.equal(
			messageTitle('orders.order-cancelled', 'notifications.order-emails'),
			'Pedido cancelado → E-mails de pedido',
		);
		assert.equal(
			messageTitle('custom.event', 'some.queue'),
			'custom.event → some.queue',
		);
		assert.match(consequenceOf('notifications.order-emails'), /e-mail/);
		assert.match(consequenceOf('some.queue'), /não a recebe/);
	});

	it('maps the tabs and the attempts', () => {
		assert.equal(parseFailureTab('descartadas').status, 'Discarded');
		assert.equal(parseFailureTab(null).status, 'Pending');
		assert.equal(attemptsLabel(1), '1 TENTATIVA');
		assert.equal(attemptsLabel(5), '5 TENTATIVAS');
	});

	it('indents a JSON body and keeps anything else', () => {
		assert.equal(prettyBody('{"a":1}'), '{\n  "a": 1\n}');
		assert.equal(prettyBody('not json'), 'not json');
	});

	it('explains an already resolved message', () => {
		assert.match(
			failureErrorCopy(
				new ApiError('x', 400, { code: 'invalid_failed_message_state' }),
			),
			/já foi resolvida/,
		);
	});
});
