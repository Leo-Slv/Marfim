import type { Metadata } from 'next';

import { CategoriesPage } from '@/features/admin-categories/components/categories-page';

export const metadata: Metadata = {
	title: 'Admin · Categorias · Marfim',
};

export default function Page() {
	return <CategoriesPage />;
}
