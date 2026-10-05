'use client';

import { useParams } from 'next/navigation';

import { ProductPage } from '@/features/product/components/product-page';

export default function Page() {
	const { slug } = useParams<{ slug: string }>();
	return <ProductPage slug={slug} />;
}
