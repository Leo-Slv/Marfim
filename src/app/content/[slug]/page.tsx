import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { ContentPage } from '@/features/content/components/content-page';
import {
	getContentPage,
	isContentSlug,
} from '@/features/content/lib/content-pages';
import { contentSlugs } from '@/features/content/model/content';

/** Only the registered pages exist; any other slug is the 404 page. */
export const dynamicParams = false;

export function generateStaticParams() {
	return contentSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ slug: string }>;
}): Promise<Metadata> {
	const { slug } = await params;
	return isContentSlug(slug)
		? { title: `${getContentPage(slug).label} · Marfim` }
		: {};
}

export default async function Page({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;
	if (!isContentSlug(slug)) {
		notFound();
	}
	return <ContentPage slug={slug} />;
}
