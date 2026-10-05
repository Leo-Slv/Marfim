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
		order: (orderId: string) => `/account/orders/${orderId}`,
		profile: '/account/profile',
		addresses: '/account/addresses',
		password: '/account/password',
	},
	admin: {
		/** The dashboard (a protected placeholder until AdminDashboard). */
		index: '/admin',
		login: '/admin/login',
		orders: '/admin/orders',
		products: '/admin/products',
		categories: '/admin/categories',
		/** Opens one order in the list's detail panel. */
		order: (orderId: string) =>
			`/admin/orders?pedido=${encodeURIComponent(orderId)}`,
		/** The list on one status tab (`?status=` of `admin-orders/lib/order-tabs`). */
		ordersWithStatus: (tab: string) =>
			`/admin/orders?status=${encodeURIComponent(tab)}`,
		/** `next` = the admin page to return to after signing in. */
		loginThen: (next: string) =>
			`/admin/login?next=${encodeURIComponent(next)}`,
	},
	content: {
		page: (slug: string) => `/content/${slug}`,
	},
} as const;

export { appRoutes };
