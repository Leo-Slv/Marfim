const appRoutes = {
	system: {
		home: '/',
	},
	storefront: {
		// The home's products grid filters by `?categoria=` until the product
		// listing screen exists (Docs/specs/storefront/home.md).
		homeCategory: (categorySlug: string) =>
			`/?categoria=${categorySlug}#produtos`,
		productsAnchor: '/#produtos',
	},
	products: {
		list: '/products',
		newest: '/products?sort=newest',
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
