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
	auth: {
		login: '/login',
	},
	account: {
		orders: '/account/orders',
	},
	content: {
		page: (slug: string) => `/content/${slug}`,
	},
} as const;

export { appRoutes };
