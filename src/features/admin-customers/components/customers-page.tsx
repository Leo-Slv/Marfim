'use client';

import { MagnifyingGlassIcon } from '@phosphor-icons/react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

import { Eyebrow } from '@/components/eyebrow';
import { parsePage } from '@/features/admin-orders/lib/order-tabs';
import { useDebouncedValue } from '@/lib/hooks/use-debounced-value';
import { cn } from '@/lib/utils';

import {
	useCustomers,
	useCustomerStats,
} from '../hooks/admin-customers.queries';
import { CustomerPanel } from './customer-panel';
import { CustomersTable } from './customers-table';

/** Admin · Clientes (AdminClientes.dc.html). */
function CustomersPage() {
	return (
		// Search, page and open customer live in the URL (Suspense).
		<Suspense fallback={null}>
			<CustomersContent />
		</Suspense>
	);
}

function CustomersContent() {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const searchTerm = searchParams.get('q') ?? '';
	const page = parsePage(searchParams.get('pagina'));
	const customerId = searchParams.get('cliente');

	const [term, setTerm] = useState(searchTerm);
	const debounced = useDebouncedValue(term.trim(), 300);
	const customers = useCustomers(searchTerm, page);
	const ids = customers.data?.items.map((customer) => customer.id) ?? [];
	const stats = useCustomerStats(ids);

	function update(changes: Record<string, string | null>) {
		const params = new URLSearchParams(searchParams);
		for (const [key, value] of Object.entries(changes)) {
			if (value === null) {
				params.delete(key);
			} else {
				params.set(key, value);
			}
		}
		const query = params.toString();
		router.replace(query ? `${pathname}?${query}` : pathname, {
			scroll: false,
		});
	}

	// The typed search reaches the URL once the admin pauses.
	useEffect(() => {
		if (debounced !== searchTerm) {
			const params = new URLSearchParams(searchParams);
			if (debounced) {
				params.set('q', debounced);
			} else {
				params.delete('q');
			}
			params.delete('pagina');
			const query = params.toString();
			router.replace(query ? `${pathname}?${query}` : pathname, {
				scroll: false,
			});
		}
	}, [debounced, searchTerm, searchParams, pathname, router]);

	return (
		<div className="flex min-h-full grow">
			<section
				className={cn(
					'min-w-0 grow flex-col gap-3 px-4 py-3.5 min-[980px]:gap-4 min-[980px]:py-7 min-[980px]:pr-6 min-[980px]:pl-8',
					customerId ? 'hidden min-[1280px]:flex' : 'flex',
				)}
			>
				<div className="flex flex-wrap items-end gap-4">
					<div className="flex grow flex-col gap-1 max-[979px]:sr-only">
						{' '}
						<Eyebrow className="tracking-[0.16em]">CLIENTES E FINANÇAS</Eyebrow>
						<h1 className="text-[34px] font-light tracking-[-0.025em]">
							Clientes
						</h1>
					</div>
					<label className="flex h-[46px] w-full items-center gap-2 rounded-xl border bg-card px-3 text-muted-foreground focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary min-[720px]:w-[260px] min-[980px]:h-10">
						<MagnifyingGlassIcon size={16} />
						<input
							type="search"
							aria-label="Buscar cliente"
							placeholder="Nome ou e-mail"
							value={term}
							onChange={(event) => setTerm(event.target.value)}
							className="w-full bg-transparent text-base text-foreground outline-none min-[980px]:text-sm"
						/>
					</label>
				</div>
				<CustomersTable
					customers={customers.data?.items}
					stats={stats.data}
					selectedId={customerId}
					onOpen={(id) => update({ cliente: id })}
					page={page}
					totalPages={customers.data?.totalPages ?? 1}
					onPage={(next) => update({ pagina: next > 1 ? String(next) : null })}
					loading={customers.isPlaceholderData}
					failed={customers.isError && !customers.data}
					onRetry={() => void customers.refetch()}
					searching={searchTerm !== ''}
				/>
			</section>
			{customerId ? (
				<CustomerPanel
					key={customerId}
					customerId={customerId}
					onClose={() => update({ cliente: null })}
				/>
			) : (
				<aside className="hidden w-[400px] shrink-0 items-center justify-center border-l bg-card px-10 text-center text-sm text-muted-foreground min-[1280px]:sticky min-[1280px]:top-0 min-[1280px]:flex min-[1280px]:h-screen">
					Escolha um cliente para ver dados, endereços, pedidos e a conta.
				</aside>
			)}
		</div>
	);
}

export { CustomersPage };
