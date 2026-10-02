import type { Metadata } from 'next';

import { ErrorPage } from '@/features/errors/components/error-page';
import { ErrorState } from '@/features/errors/components/error-state';

export const metadata: Metadata = {
	title: 'Página não encontrada · Marfim',
};

export default function NotFound() {
	return (
		<ErrorPage>
			<ErrorState kind="not-found" />
		</ErrorPage>
	);
}
