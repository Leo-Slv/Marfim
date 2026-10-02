import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { countdownToEndOfSunday, endOfSunday } from './countdown';

describe('endOfSunday', () => {
	it('is the coming Sunday at 23:59:59 on a weekday', () => {
		// Friday, 2026-10-02.
		const end = endOfSunday(new Date(2026, 9, 2, 10, 0, 0));
		assert.equal(end.getDay(), 0);
		assert.equal(end.getDate(), 4);
		assert.equal(end.getHours(), 23);
		assert.equal(end.getMinutes(), 59);
	});

	it('is the same day on a Sunday', () => {
		const end = endOfSunday(new Date(2026, 9, 4, 8, 0, 0));
		assert.equal(end.getDate(), 4);
	});
});

describe('countdownToEndOfSunday', () => {
	it('splits the remaining time into zero-padded parts', () => {
		// Friday 2026-10-02 10:00:00 → Sunday 23:59:59 = 2d 13h 59m 59s.
		const parts = countdownToEndOfSunday(new Date(2026, 9, 2, 10, 0, 0));
		assert.deepEqual(
			parts.map((part) => part.value),
			['02', '13', '59', '59'],
		);
		assert.deepEqual(
			parts.map((part) => part.label),
			['DIAS', 'HORAS', 'MIN', 'SEG'],
		);
	});

	it('never goes negative', () => {
		const parts = countdownToEndOfSunday(new Date(2026, 9, 4, 23, 59, 59, 500));
		assert.deepEqual(
			parts.map((part) => part.value),
			['00', '00', '00', '00'],
		);
	});
});
