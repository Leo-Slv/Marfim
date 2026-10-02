import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
	formatOrderDate,
	formatTimelineMoment,
	isValidPhone,
	joinName,
	maskPhone,
	orderItemsSummary,
	splitName,
} from './account-format';

describe('orderItemsSummary', () => {
	it('names the first piece and counts the rest', () => {
		assert.equal(orderItemsSummary(['Pendente Orbe']), 'Pendente Orbe');
		assert.equal(
			orderItemsSummary(['Manta Trama', 'Almofada Linho']),
			'Manta Trama + 1 peça',
		);
		assert.equal(
			orderItemsSummary(['Pendente Orbe', 'Vaso Duna', 'Grão']),
			'Pendente Orbe + 2 peças',
		);
	});
});

describe('name split/join', () => {
	it('splits on the first space and joins back', () => {
		assert.deepEqual(splitName('Ana Ribeiro da Silva'), {
			first: 'Ana',
			last: 'Ribeiro da Silva',
		});
		assert.deepEqual(splitName('Ana'), { first: 'Ana', last: '' });
		assert.equal(joinName(' Ana ', ' Ribeiro '), 'Ana Ribeiro');
		assert.equal(joinName('Ana', ''), 'Ana');
	});
});

describe('phone', () => {
	it('masks mobile and landline numbers', () => {
		assert.equal(maskPhone('11980000000'), '(11) 98000-0000');
		assert.equal(maskPhone('1130000000'), '(11) 3000-0000');
		assert.equal(maskPhone('11'), '(11');
	});

	it('accepts 10 or 11 digits, or nothing', () => {
		assert.equal(isValidPhone('(11) 98000-0000'), true);
		assert.equal(isValidPhone('(11) 3000-0000'), true);
		assert.equal(isValidPhone(''), true);
		assert.equal(isValidPhone('(11) 9800'), false);
	});
});

describe('dates', () => {
	it('formats the order date and the timeline moment in São Paulo time', () => {
		assert.equal(formatOrderDate('2026-10-02T16:21:00Z'), '02 out 2026');
		assert.equal(
			formatTimelineMoment('2026-10-02T16:21:00Z'),
			'02 OUT · 13:21',
		);
	});
});
