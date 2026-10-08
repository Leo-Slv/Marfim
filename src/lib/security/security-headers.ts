/**
 * Security headers applied to every response (next.config.ts). Pure so it
 * can be tested; see Docs/specs/infra/deploy.md for why the CSP has no
 * nonces.
 */
type HeaderOptions = {
	/** NEXT_PUBLIC_API_URL: the origin the browser talks to. */
	apiUrl: string;
	isDev: boolean;
};

type Header = { key: string; value: string };

/** Hosts Stripe.js / the Payment Element need (docs.stripe.com/security/guide). */
const STRIPE_SCRIPT = ['https://js.stripe.com'];
const STRIPE_FRAME = [
	'https://js.stripe.com',
	'https://hooks.stripe.com',
	'https://checkout.stripe.com',
];
const STRIPE_CONNECT = [
	'https://api.stripe.com',
	'https://r.stripe.com',
	'https://m.stripe.com',
	'https://m.stripe.network',
];

function originOf(url: string): string | null {
	try {
		return new URL(url).origin;
	} catch {
		return null;
	}
}

function buildCsp({ apiUrl, isDev }: HeaderOptions): string {
	const api = originOf(apiUrl);
	const directives: Array<[string, string[]]> = [
		['default-src', ["'self'"]],
		[
			'script-src',
			[
				"'self'",
				"'unsafe-inline'",
				...(isDev ? ["'unsafe-eval'"] : []),
				...STRIPE_SCRIPT,
			],
		],
		['style-src', ["'self'", "'unsafe-inline'"]],
		['img-src', ["'self'", 'data:', 'blob:', 'https://*.stripe.com']],
		['font-src', ["'self'", 'data:']],
		['connect-src', ["'self'", ...(api ? [api] : []), ...STRIPE_CONNECT]],
		['frame-src', STRIPE_FRAME],
		['object-src', ["'none'"]],
		['base-uri', ["'self'"]],
		['form-action', ["'self'"]],
		['frame-ancestors', ["'none'"]],
	];
	const parts = directives.map(
		([name, values]) => `${name} ${values.join(' ')}`,
	);
	if (!isDev) {
		parts.push('upgrade-insecure-requests');
	}
	return parts.join('; ');
}

function securityHeaders(options: HeaderOptions): Header[] {
	return [
		{ key: 'Content-Security-Policy', value: buildCsp(options) },
		{ key: 'X-Content-Type-Options', value: 'nosniff' },
		{ key: 'X-Frame-Options', value: 'DENY' },
		{ key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
		{
			key: 'Permissions-Policy',
			value: 'camera=(), microphone=(), geolocation=(), payment=(self)',
		},
		...(options.isDev
			? []
			: [
					{
						key: 'Strict-Transport-Security',
						value: 'max-age=63072000; includeSubDomains',
					},
				]),
	];
}

export { buildCsp, securityHeaders };
export type { Header, HeaderOptions };
