'use client';

import { CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react';

import { ComingSoonBadge } from '@/components/coming-soon-badge';
import { formatCurrencyBrlCents } from '@/features/catalog/lib/format-currency-brl';
import { cn } from '@/lib/utils';

import { customerInitials } from '../lib/customers';
import type { AdminCustomer } from '../schemas/admin-customers.schema';

/** The E-MAIL column (EM BREVE) only shows when there is room for it. */
const columns =
	'grid grid-cols-[minmax(0,1fr)_64px_112px_92px] items-center gap-3 min-[1440px]:grid-cols-[minmax(0,1fr)_70px_120px_96px_100px]';

function CustomerAvatar({ name, size }: { name: string; size: 'sm' | 'lg' }) {
	return (
		<span
			className={cn(
				'flex shrink-0 items-center justify-center rounded-full bg-[#E3E1F9] font-medium text-primary',
				size === 'sm' ? 'size-8 text-xs' : 'size-[52px] text-lg',
			)}
			aria-hidden="true"
		>
			{customerInitials(name)}
		</span>
	);
}

function AccountPill({ active }: { active: boolean }) {
	return (
		<span
			className={cn(
				'inline-flex h-[22px] items-center rounded-full px-[9px] text-xs font-medium',
				active ? 'bg-success-soft text-success' : 'bg-surface text-ink-soft',
			)}
		>
			{active ? 'Ativa' : 'Desativada'}
		</span>
	);
}

function CustomersTable({
	customers,
	stats,
	selectedId,
	onOpen,
	page,
	totalPages,
	onPage,
	loading,
	failed,
	onRetry,
	searching,
}: {
	customers: AdminCustomer[] | undefined;
	stats: Record<string, { orders: number; spent: number }> | undefined;
	selectedId: string | null;
	onOpen: (customerId: string) => void;
	page: number;
	totalPages: number;
	onPage: (page: number) => void;
	loading: boolean;
	failed: boolean;
	onRetry: () => void;
	searching: boolean;
}) {
	return (
		<div className="flex flex-col gap-3">
			{/* Below 980 px: one card per customer (MobileAdminClientes.dc.html). */}
			<div className="flex flex-col gap-2 min-[980px]:hidden">
				{failed ? (
					<div
						role="alert"
						className="flex flex-col items-center gap-2 rounded-2xl border bg-card p-8 text-sm text-ink-soft"
					>
						Não foi possível carregar os clientes.
						<button
							type="button"
							onClick={onRetry}
							className="font-medium text-primary"
						>
							Tentar de novo
						</button>
					</div>
				) : !customers ? (
					[0, 1, 2, 3].map((index) => (
						<div key={index} className="skeleton h-[88px] rounded-2xl" />
					))
				) : customers.length === 0 ? (
					<p className="p-8 text-center text-sm text-muted-foreground">
						{searching
							? 'Nenhum cliente com esse nome ou e-mail.'
							: 'Nenhum cliente ainda.'}
					</p>
				) : (
					customers.map((customer) => {
						const stat = stats?.[customer.id];
						return (
							<button
								key={customer.id}
								type="button"
								onClick={() => onOpen(customer.id)}
								className={cn(
									'flex animate-up items-center gap-3 rounded-2xl border bg-card px-3.5 py-3 text-left',
									loading && 'opacity-60 transition-opacity',
								)}
							>
								<span
									aria-hidden="true"
									className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-soft text-[13px] font-medium text-primary"
								>
									{customerInitials(customer.name)}
								</span>
								<span className="flex min-w-0 grow flex-col gap-1">
									<span className="flex items-center justify-between gap-2">
										<span className="truncate text-[15px]">
											{customer.name}
										</span>
										<AccountPill active={customer.active} />
									</span>
									<span className="truncate text-xs text-muted-foreground">
										{customer.email}
									</span>
									<span className="flex items-center justify-between text-xs text-ink-soft">
										<span>
											<span className="font-mono">
												{stat ? stat.orders : '·'}
											</span>{' '}
											pedidos
										</span>
										<span className="font-mono text-[13px] text-foreground">
											{stat ? formatCurrencyBrlCents(stat.spent) : '·'} ›
										</span>
									</span>
								</span>
							</button>
						);
					})
				)}
			</div>
			<div className="hidden overflow-hidden rounded-2xl border bg-card min-[980px]:block">
				{' '}
				<div className="overflow-x-auto">
					<div className="min-w-[460px]">
						<div
							className={cn(
								columns,
								'bg-surface px-[18px] py-2.5 font-mono text-[10px] tracking-[0.12em] text-muted-foreground',
							)}
						>
							<span>CLIENTE</span>
							<span>PEDIDOS</span>
							<span>TOTAL GASTO</span>
							<span className="hidden items-center gap-1.5 min-[1440px]:flex">
								E-MAIL
								<ComingSoonBadge />
							</span>
							<span>CONTA</span>
						</div>
						{failed ? (
							<div
								role="alert"
								className="flex flex-col items-center gap-2 border-t p-10 text-sm text-ink-soft"
							>
								Não foi possível carregar os clientes.
								<button
									type="button"
									onClick={onRetry}
									className="font-medium text-primary hover:text-primary-strong"
								>
									Tentar de novo
								</button>
							</div>
						) : !customers ? (
							<div className="flex flex-col gap-2 border-t p-[18px]">
								{[0, 1, 2, 3, 4].map((index) => (
									<div key={index} className="skeleton h-11 rounded-lg" />
								))}
							</div>
						) : customers.length === 0 ? (
							<p className="border-t p-10 text-center text-sm text-muted-foreground">
								{searching
									? 'Nenhum cliente com esse nome ou e-mail.'
									: 'Nenhum cliente ainda.'}
							</p>
						) : (
							<div className={cn(loading && 'opacity-60 transition-opacity')}>
								{customers.map((customer) => {
									const selected = customer.id === selectedId;
									const stat = stats?.[customer.id];
									return (
										<button
											key={customer.id}
											type="button"
											onClick={() => onOpen(customer.id)}
											aria-pressed={selected}
											className={cn(
												columns,
												'w-full border-t border-l-[3px] px-[18px] py-3 text-left text-sm transition-colors',
												selected
													? 'border-l-primary bg-primary-soft'
													: 'border-l-transparent hover:bg-[#FAFAF8]',
											)}
										>
											<span className="flex min-w-0 items-center gap-2.5">
												<CustomerAvatar name={customer.name} size="sm" />
												<span className="flex min-w-0 flex-col">
													<span className="truncate">{customer.name}</span>
													<span className="truncate text-xs text-muted-foreground">
														{customer.email}
													</span>
												</span>
											</span>
											<span className="font-mono text-[13px]">
												{stat ? stat.orders : '·'}
											</span>
											<span className="font-mono text-[13px]">
												{stat ? formatCurrencyBrlCents(stat.spent) : '·'}
											</span>
											<span className="hidden text-xs text-muted-foreground min-[1440px]:block">
												—
											</span>
											<span>
												<AccountPill active={customer.active} />
											</span>
										</button>
									);
								})}
							</div>
						)}
					</div>
				</div>
			</div>
			{totalPages > 1 ? (
				<nav
					aria-label="Páginas"
					className="flex items-center justify-end gap-2 text-sm text-ink-soft"
				>
					<span className="font-mono text-xs">
						{page} / {totalPages}
					</span>
					<button
						type="button"
						onClick={() => onPage(page - 1)}
						disabled={page <= 1}
						aria-label="Página anterior"
						className="flex size-9 items-center justify-center rounded-lg border bg-card hover:bg-surface-2 disabled:opacity-40"
					>
						<CaretLeftIcon size={14} />
					</button>
					<button
						type="button"
						onClick={() => onPage(page + 1)}
						disabled={page >= totalPages}
						aria-label="Próxima página"
						className="flex size-9 items-center justify-center rounded-lg border bg-card hover:bg-surface-2 disabled:opacity-40"
					>
						<CaretRightIcon size={14} />
					</button>
				</nav>
			) : null}
		</div>
	);
}

export { AccountPill, CustomerAvatar, CustomersTable };
