import type { Metadata } from 'next';

import { ProductsPage } from '@/features/admin-products/components/products-page';

export const metadata: Metadata = {
	title: 'Admin · Produtos · Marfim',
};

export default function Page() {
	return <ProductsPage />;
}
