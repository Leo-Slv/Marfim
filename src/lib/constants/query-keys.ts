/**
 * Central registry of React Query keys, grouped by feature.
 * Add one namespace per feature under src/features/<feature> as it's built
 * (see CLAUDE.md).
 */
const queryKeys = {
	catalog: {
		products: (params: {
			page: number;
			pageSize: number;
			categoryId?: string;
			sort?: string;
			searchTerm?: string;
			onSale?: boolean;
		}) =>
			[
				'catalog',
				'products',
				params.page,
				params.pageSize,
				params.categoryId ?? 'all',
				params.sort ?? 'default',
				params.searchTerm ?? '',
				params.onSale ?? false,
			] as const,
		product: (slug: string) => ['catalog', 'product', slug] as const,
		categories: ['catalog', 'categories'] as const,
	},
	auth: {
		/** Single-use: one confirmation per link token. */
		confirmEmail: (token: string) => ['auth', 'confirm-email', token] as const,
	},
	checkout: {
		addresses: (userId: string) => ['checkout', 'addresses', userId] as const,
		paymentMethods: ['checkout', 'payment-methods'] as const,
		order: (orderId: string) => ['checkout', 'order', orderId] as const,
		profile: (userId: string) => ['checkout', 'profile', userId] as const,
	},
	account: {
		profile: (userId: string) => ['account', 'profile', userId] as const,
		orders: (userId: string, page: number) =>
			['account', 'orders', userId, page] as const,
		order: (orderId: string) => ['account', 'order', orderId] as const,
		history: (orderId: string) => ['account', 'history', orderId] as const,
	},
	admin: {
		/** Side-menu counters (orders to prepare, stock alerts, failures). */
		counts: ['admin', 'counts'] as const,
		dashboard: (from: string, to: string) =>
			['admin', 'dashboard', from, to] as const,
		revenue: (from: string, to: string) =>
			['admin', 'revenue', from, to] as const,
		preparation: ['admin', 'preparation'] as const,
		lowStock: ['admin', 'low-stock'] as const,
		/** Everything order-related, invalidated after each admin action. */
		ordersRoot: ['admin', 'orders'] as const,
		orders: (status: string | null, customerId: string | null, page: number) =>
			[
				'admin',
				'orders',
				'list',
				status ?? 'all',
				customerId ?? 'all',
				page,
			] as const,
		orderCounts: (customerId: string | null) =>
			['admin', 'orders', 'counts', customerId ?? 'all'] as const,
		order: (orderId: string) => ['admin', 'orders', 'detail', orderId] as const,
		orderTimeline: (orderId: string) =>
			['admin', 'orders', 'timeline', orderId] as const,
		/** Everything product-related, invalidated after each product change. */
		productsRoot: ['admin', 'products'] as const,
		products: (searchTerm: string, page: number) =>
			['admin', 'products', 'list', searchTerm, page] as const,
		product: (productId: string) =>
			['admin', 'products', 'detail', productId] as const,
		/** Everything stock-related, invalidated after each stock action. */
		inventoryRoot: ['admin', 'inventory'] as const,
		inventory: (filter: string, page: number) =>
			['admin', 'inventory', 'list', filter, page] as const,
		inventorySummary: ['admin', 'inventory', 'summary'] as const,
		stockItem: (productId: string) =>
			['admin', 'inventory', 'item', productId] as const,
		stockMovements: (productId: string) =>
			['admin', 'inventory', 'movements', productId] as const,
		stockReservations: (productId: string) =>
			['admin', 'inventory', 'reservations', productId] as const,
		/** Everything customer-related, invalidated after a status change. */
		customersRoot: ['admin', 'customers'] as const,
		customers: (searchTerm: string, page: number) =>
			['admin', 'customers', 'list', searchTerm, page] as const,
		customerStats: (customerIds: readonly string[]) =>
			['admin', 'customers', 'stats', ...customerIds] as const,
		customerDetail: (customerId: string) =>
			['admin', 'customers', 'detail', customerId] as const,
		customerAddresses: (customerId: string) =>
			['admin', 'customers', 'addresses', customerId] as const,
		customerOrders: (customerId: string) =>
			['admin', 'customers', 'orders', customerId] as const,
		/** Product count of each category, keyed by the category ids. */
		categoryCounts: (categoryIds: readonly string[]) =>
			['admin', 'category-counts', ...categoryIds] as const,
		customer: (customerId: string) =>
			['admin', 'customer', customerId] as const,
		customerSearch: (term: string) =>
			['admin', 'customer-search', term] as const,
	},
	cart: {
		/** `signature` = the bag's `productId:quantity:unitPrice` lines. */
		quote: (signature: string) => ['cart', 'quote', signature] as const,
	},
} as const;

export { queryKeys };
