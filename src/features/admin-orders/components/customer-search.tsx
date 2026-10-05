'use client';

import { MagnifyingGlassIcon, XIcon } from '@phosphor-icons/react';
import { useId, useState } from 'react';

import { ComingSoonBadge } from '@/components/coming-soon-badge';
import { useDebouncedValue } from '@/lib/hooks/use-debounced-value';

import {
	useCustomerSearch,
	useFilterCustomer,
} from '../hooks/admin-orders.queries';

/**
 * "Número ou cliente": suggests customers by name or e-mail and filters the
 * list by the chosen one (the API has no order search — pendency #1).
 */
function CustomerSearch({
	customerId,
	onPick,
}: {
	customerId: string | null;
	onPick: (customerId: string | null) => void;
}) {
	const listId = useId();
	const [term, setTerm] = useState('');
	const [open, setOpen] = useState(false);
	const debounced = useDebouncedValue(term, 250);
	const looksLikeNumber = /^ord-?\d*/i.test(term.trim());
	const matches = useCustomerSearch(looksLikeNumber ? '' : debounced);
	const filterCustomer = useFilterCustomer(customerId);

	if (customerId) {
		return (
			<span className="flex h-10 max-w-full items-center gap-2 rounded-xl border bg-card pr-1.5 pl-3 text-sm">
				<span className="text-muted-foreground">Cliente:</span>
				<span className="truncate font-medium">
					{filterCustomer.data?.name ?? '…'}
				</span>
				<button
					type="button"
					onClick={() => onPick(null)}
					aria-label="Remover filtro de cliente"
					className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-surface hover:text-foreground"
				>
					<XIcon size={14} />
				</button>
			</span>
		);
	}

	const showList = open && term.trim().length >= 2;

	return (
		<div className="relative w-full min-[720px]:w-[280px]">
			<label className="flex h-10 items-center gap-2 rounded-xl border bg-card px-3 text-muted-foreground focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary">
				<MagnifyingGlassIcon size={16} />
				<input
					type="search"
					role="combobox"
					aria-expanded={showList}
					aria-controls={listId}
					aria-label="Buscar pedidos de um cliente"
					placeholder="Cliente (nome ou e-mail)"
					value={term}
					onChange={(event) => {
						setTerm(event.target.value);
						setOpen(true);
					}}
					onFocus={() => setOpen(true)}
					onBlur={() => setTimeout(() => setOpen(false), 150)}
					className="w-full bg-transparent text-sm text-foreground outline-none"
				/>
			</label>
			{showList ? (
				<div
					id={listId}
					role="listbox"
					className="absolute top-12 right-0 left-0 z-20 flex animate-fade-in flex-col overflow-hidden rounded-xl border bg-card py-1 shadow-[0_16px_32px_-16px_rgba(24,24,27,.3)]"
				>
					{looksLikeNumber ? (
						<span className="flex items-center gap-2 px-3 py-2.5 text-sm text-muted-foreground">
							Busca por número do pedido
							<ComingSoonBadge />
						</span>
					) : matches.isPending ? (
						<span className="px-3 py-2.5 text-sm text-muted-foreground">
							Buscando…
						</span>
					) : matches.isError ? (
						<span className="px-3 py-2.5 text-sm text-clay">
							Não foi possível buscar agora.
						</span>
					) : matches.data.length === 0 ? (
						<span className="px-3 py-2.5 text-sm text-muted-foreground">
							Nenhum cliente encontrado.
						</span>
					) : (
						matches.data.map((customer) => (
							<button
								key={customer.id}
								type="button"
								role="option"
								aria-selected="false"
								onMouseDown={(event) => event.preventDefault()}
								onClick={() => {
									setTerm('');
									setOpen(false);
									onPick(customer.id);
								}}
								className="flex flex-col px-3 py-2 text-left hover:bg-surface"
							>
								<span className="truncate text-sm">{customer.name}</span>
								<span className="truncate text-xs text-muted-foreground">
									{customer.email}
								</span>
							</button>
						))
					)}
				</div>
			) : null}
		</div>
	);
}

export { CustomerSearch };
