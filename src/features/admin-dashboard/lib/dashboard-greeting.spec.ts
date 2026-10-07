import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { greeting, greetingDate } from './dashboard-greeting';

describe('greeting', () => {
	it('follows the hour of the day', () => {
		assert.equal(greeting(new Date(2026, 9, 1, 9)), 'Bom dia');
		assert.equal(greeting(new Date(2026, 9, 1, 14)), 'Boa tarde');
		assert.equal(greeting(new Date(2026, 9, 1, 21)), 'Boa noite');
		assert.equal(greeting(new Date(2026, 9, 1, 3)), 'Boa noite');
	});
});

describe('greetingDate', () => {
	it('writes the weekday, day, month and year', () => {
		assert.equal(greetingDate(new Date(2026, 9, 1)), 'QUI · 01 OUT 2026');
	});
});
