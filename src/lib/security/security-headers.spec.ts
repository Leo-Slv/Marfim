import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { buildCsp, securityHeaders } from './security-headers';

const prod = { apiUrl: 'https://api.example.com/', isDev: false };

describe('buildCsp', () => {
	it('allows the API origin (without path) and Stripe', () => {
		const csp = buildCsp(prod);
		assert.match(
			csp,
			/connect-src 'self' https:\/\/api\.example\.com https:\/\/api\.stripe\.com/,
		);
		assert.match(csp, /script-src [^;]*https:\/\/js\.stripe\.com/);
		assert.match(
			csp,
			/frame-src https:\/\/js\.stripe\.com https:\/\/hooks\.stripe\.com/,
		);
	});

	it('forbids framing, plugins and foreign base/form targets', () => {
		const csp = buildCsp(prod);
		assert.match(csp, /frame-ancestors 'none'/);
		assert.match(csp, /object-src 'none'/);
		assert.match(csp, /base-uri 'self'/);
		assert.match(csp, /form-action 'self'/);
	});

	it('only upgrades requests and drops eval in production', () => {
		assert.match(buildCsp(prod), /upgrade-insecure-requests/);
		assert.doesNotMatch(buildCsp(prod), /unsafe-eval/);
		const dev = buildCsp({ ...prod, isDev: true });
		assert.match(dev, /'unsafe-eval'/);
		assert.doesNotMatch(dev, /upgrade-insecure-requests/);
	});

	it('survives an unparsable API url', () => {
		assert.doesNotMatch(buildCsp({ apiUrl: 'nope', isDev: false }), /nope/);
	});
});

describe('securityHeaders', () => {
	it('sends HSTS only outside development', () => {
		const keys = (isDev: boolean) =>
			securityHeaders({ ...prod, isDev }).map((header) => header.key);
		assert.ok(keys(false).includes('Strict-Transport-Security'));
		assert.ok(!keys(true).includes('Strict-Transport-Security'));
	});
});
