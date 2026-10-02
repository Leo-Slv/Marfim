import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
	resetPasswordFormSchema,
	signInFormSchema,
	signUpFormSchema,
} from './auth-forms.schema';

const firstMessage = (result: {
	success: boolean;
	error?: { issues: { message: string }[] };
}) => result.error?.issues[0]?.message;

describe('signInFormSchema', () => {
	it('trims the e-mail and requires a password', () => {
		const result = signInFormSchema.safeParse({
			email: '  ana@email.com ',
			password: 'x',
		});
		assert.equal(result.success, true);
		assert.equal(result.data?.email, 'ana@email.com');
	});

	it('rejects an invalid e-mail with the mockup copy', () => {
		assert.equal(
			firstMessage(signInFormSchema.safeParse({ email: 'ana', password: 'x' })),
			'Digite um e-mail válido.',
		);
	});
});

describe('signUpFormSchema', () => {
	const valid = {
		name: 'Ana',
		email: 'ana@email.com',
		password: 'senha1234',
		terms: true,
	};

	it('accepts a complete form', () => {
		assert.equal(signUpFormSchema.safeParse(valid).success, true);
	});

	it('enforces the backend password policy and the terms', () => {
		assert.match(
			firstMessage(
				signUpFormSchema.safeParse({ ...valid, password: 'senhafraca' }),
			) ?? '',
			/letra e um número/,
		);
		assert.equal(
			firstMessage(signUpFormSchema.safeParse({ ...valid, terms: false })),
			'Aceite os termos para continuar.',
		);
	});
});

describe('resetPasswordFormSchema', () => {
	it('requires the repeated password to match', () => {
		const result = resetPasswordFormSchema.safeParse({
			password: 'senha1234',
			confirmation: 'senha12345',
		});
		assert.equal(result.success, false);
		assert.deepEqual(result.error?.issues[0]?.path, ['confirmation']);
	});
});
