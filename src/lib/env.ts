import { isDemoStore } from '@/lib/demo/demo-flag';

const env = {
	apiUrl: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080',
	/** Demonstration-store notice (band + test-card hint); on by default. */
	demoStore: isDemoStore(process.env.NEXT_PUBLIC_DEMO_STORE),
};

export { env };
