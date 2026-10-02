import { StoreFooter } from '@/components/store-footer';
import { StoreHeader } from '@/components/store-header';

/** An error state inside the store chrome (Erro.dc.html). */
function ErrorPage({ children }: { children: React.ReactNode }) {
	return (
		<div className="flex min-h-screen min-w-[360px] flex-col overflow-hidden bg-background">
			<StoreHeader />
			<main className="flex grow flex-col">{children}</main>
			<StoreFooter />
		</div>
	);
}

export { ErrorPage };
