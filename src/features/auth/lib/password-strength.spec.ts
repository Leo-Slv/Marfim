import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
	isStrongPassword,
	passwordRules,
	passwordScore,
} from './password-strength';

describe('password strength', () => {
	it('scores each rule the backend checks', () => {
		assert.equal(passwordScore(''), 0);
		assert.equal(passwordScore('abc'), 1);
		assert.equal(passwordScore('abcdefgh'), 2);
		assert.equal(passwordScore('abcdefg1'), 3);
	});

	it('counts non-ASCII letters as letters', () => {
		assert.equal(isStrongPassword('çãéíóú12'), true);
	});

	it('rejects passwords over 128 characters', () => {
		assert.equal(isStrongPassword(`a1${'x'.repeat(127)}`), false);
	});

	it('labels the rules in pt-BR', () => {
		assert.deepEqual(
			passwordRules('a1').map((rule) => [rule.label, rule.ok]),
			[
				['8 a 128 caracteres', false],
				['Uma letra', true],
				['Um número', true],
			],
		);
	});
});
