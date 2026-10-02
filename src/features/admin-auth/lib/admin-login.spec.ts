import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { ApiError } from '@/lib/http/api-error';

import {
	adminDestination,
	adminLoginErrorCopy,
	adminSection,
	isNotAdmin,
} from './admin-login';

describe('adminLoginErrorCopy', () => {
	it('maps OrderCore codes to the mockup copy', () => {
		assert.equal(
			adminLoginErrorCopy(
				new ApiError('x', 400, { code: 'invalid_credentials' }),
			).text,
			'E-mail ou senha incorretos.',
		);
		assert.equal(
			adminLoginErrorCopy(new ApiError('x', 400, { code: 'account_inactive' }))
				.text,
			'Esta conta foi desativada. Fale com quem gerencia a loja.',
		);
	});

	it('locks the form on 429, with the server wait when known', () => {
		assert.equal(
			adminLoginErrorCopy(new ApiError('x', 429, { retryAfterSeconds: 42 }))
				.lockSeconds,
			42,
		);
		assert.equal(adminLoginErrorCopy(new ApiError('x', 429)).lockSeconds, 30);
	});

	it('tells an unreachable API apart', () => {
		assert.match(
			adminLoginErrorCopy(new ApiError('x', 503)).text,
			/Não conseguimos falar com a loja/,
		);
		assert.match(adminLoginErrorCopy(new Error('x')).text, /Algo deu errado/);
	});
});

describe('isNotAdmin', () => {
	it('spots the BFF answer for a non-admin account', () => {
		assert.equal(
			isNotAdmin(new ApiError('x', 403, { code: 'not_admin' })),
			true,
		);
		assert.equal(
			isNotAdmin(new ApiError('x', 403, { code: 'forbidden' })),
			false,
		);
	});
});

describe('adminDestination', () => {
	it('only returns to paths inside the panel', () => {
		assert.equal(
			adminDestination('/admin/orders?page=2'),
			'/admin/orders?page=2',
		);
		assert.equal(adminDestination('/admin'), '/admin');
		assert.equal(adminDestination('/cart'), '/admin');
		assert.equal(adminDestination('/administrator'), '/admin');
		assert.equal(adminDestination('/admin/login'), '/admin');
		assert.equal(adminDestination('//evil.example/admin'), '/admin');
		assert.equal(adminDestination(null), '/admin');
	});
});

describe('adminSection', () => {
	it('names the section the admin goes back to', () => {
		assert.deepEqual(adminSection('/admin'), {
			preposition: 'ao',
			label: 'Dashboard',
		});
		assert.equal(adminSection('/admin/orders/123').label, 'Pedidos');
		assert.equal(adminSection('/admin/orders/123').preposition, 'a');
		assert.equal(adminSection('/admin/whatever').label, 'painel');
	});
});
