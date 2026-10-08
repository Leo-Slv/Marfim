import type { NextConfig } from 'next';

// Relative import: the config file cannot use the `@/` alias.
import { securityHeaders } from './src/lib/security/security-headers';

const nextConfig: NextConfig = {
	async headers() {
		return [
			{
				source: '/(.*)',
				headers: securityHeaders({
					apiUrl: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080',
					isDev: process.env.NODE_ENV === 'development',
				}),
			},
		];
	},
};

export default nextConfig;
