const appRoutes = {
	system: {
		home: '/',
	},
	products: {
		/** Listing in category mode — "Tudo". */
		list: '/products',
		category: (categorySlug: string) => `/products?categoria=${categorySlug}`,
		newest: '/products?categoria=novidades',
		search: (term?: string) =>
			term ? `/search?q=${encodeURIComponent(term)}` : '/search',
		promotions: '/promotions',
		detail: (slug: string) => `/products/${slug}`,
	},
	cart: {
		index: '/cart',
	},
	checkout: {
		delivery: '/checkout/delivery',
		/** Back from the payment step, keeping the chosen addresses. */
		deliveryWith: (shippingAddressId: string, billingAddressId: string) =>
			`/checkout/delivery?entrega=${shippingAddressId}&cobranca=${billingAddressId}`,
		payment: '/checkout/payment',
		paymentWith: (shippingAddressId: string, billingAddressId: string) =>
			`/checkout/payment?entrega=${shippingAddressId}&cobranca=${billingAddressId}`,
	},
	auth: {
		login: '/login',
		/** `next` = where to return after signing in (same-origin path). */
		loginThen: (next: string) => `/login?next=${encodeURIComponent(next)}`,
		register: '/register',
		forgotPassword: '/forgot-password',
		// Deliberate pt-BR paths: OrderCore's e-mails link here
		// (`Identity:Links` in the backend's appsettings.json).
		confirmEmail: '/confirmar-email',
		resetPassword: '/redefinir-senha',
	},
	account: {
		index: '/account',
		orders: '/account/orders',
	},
	content: {
		page: (slug: string) => `/content/${slug}`,
	},
} as const;

export { appRoutes };
