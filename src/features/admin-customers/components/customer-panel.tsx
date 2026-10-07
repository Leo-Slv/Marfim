'use client';

import { BottomSheet } from '@/components/bottom-sheet';
import { ArrowLeftIcon } from '@phosphor-icons/react';
import Link from 'next/link';
import { useState } from 'react';

import { ComingSoonBadge } from '@/components/coming-soon-badge';
import { notify } from '@/features/account/components/account-toast';
import {
	orderStatusClass,
	orderStatusLabel,
} from '@/features/account/lib/order-status';
import { formatCurrencyBrlCents } from '@/features/catalog/lib/format-currency-brl';
import { addressLines } from '@/features/checkout/lib/format-address';
import { QueryErrorState } from '@/features/errors/components/query-error-state';
import { useMediaQuery } from '@/lib/hooks/use-media-query';
import { appRoutes } from '@/lib/routes/app-routes';
import { cn } from '@/lib/utils';

import {
	useCustomer,
	useCustomerAddresses,
	useCustomerOrders,
	useSetCustomerActive,
} from '../hooks/admin-customers.queries';
import { addressTags, customerSince, orderStats } from '../lib/customers';
import type { AdminCustomer } from '../schemas/admin-customers.schema';
import { CustomerAvatar } from './customers-table';

const RECENT_SHOWN = 5;

function SectionLabel({ children }: { children: React.ReactNode }) {
	return (
		<span className="font-mono text-[10px] tracking-[0.14em] text-muted-foreground">
			{children}
		</span>
	);
}

/** The customer's panel (AdminClientes.dc.html, right side). */
function CustomerPanel({
	customerId,
	onClose,
}: {
	customerId: string;
	onClose: () => void;
}) {
	const customer = useCustomer(customerId);

	return (
		<aside className="flex w-full shrink-0 animate-slide-in flex-col gap-[18px] bg-card px-4 py-4 min-[980px]:border-l min-[980px]:px-6 min-[980px]:py-7 min-[1280px]:sticky min-[1280px]:top-0 min-[1280px]:h-screen min-[1280px]:w-[400px] min-[1280px]:overflow-y-auto">
			<button
				type="button"
				onClick={onClose}
				className="flex min-h-8 items-center gap-1.5 self-start text-sm font-medium text-primary hover:text-primary-strong min-[1280px]:hidden"
			>
				<ArrowLeftIcon size={14} />
				Clientes
			</button>
			{customer.isPending ? (
				<div className="flex flex-col gap-3">
					<div className="skeleton h-14 rounded-xl" />
					<div className="skeleton h-20 rounded-xl" />
					<div className="skeleton h-32 rounded-xl" />
				</div>
			) : customer.isError ? (
				<QueryErrorState
					key={customer.errorUpdatedAt}
					error={customer.error}
					onRetry={() => void customer.refetch()}
				/>
			) : (
				<CustomerDetail customer={customer.data} />
			)}
		</aside>
	);
}

function CustomerDetail({ customer }: { customer: AdminCustomer }) {
	const addresses = useCustomerAddresses(customer.id);
	const orders = useCustomerOrders(customer.id);
	const status = useSetCustomerActive(customer.id);
	const [asking, setAsking] = useState(false);
	// Below 980 px the confirm is a bottom sheet (MobileAdminClientes.dc.html).
	const mobile = useMediaQuery('(max-width: 979px)') === true;
	const stats = orders.data
		? orderStats(orders.data.items, orders.data.totalItems)
		: null;
	const active = customer.active;

	function confirm() {
		status.mutate(!active, {
			onSuccess: () => {
				setAsking(false);
				notify(active ? 'Conta desativada' : 'Conta reativada');
			},
		});
	}

	return (
		<>
			<div className="flex items-center gap-3">
				<CustomerAvatar name={customer.name} size="lg" />
				<span className="flex min-w-0 grow flex-col">
					<span className="truncate text-lg font-medium">{customer.name}</span>
					<span className="truncate text-[13px] text-muted-foreground">
						{customer.email}
					</span>
				</span>
			</div>

			<div className="grid grid-cols-3 gap-2">
				<div className="rounded-xl bg-background p-3">
					<div className="text-[11px] text-muted-foreground">Pedidos</div>
					<div className="text-[22px] font-light">{stats?.orders ?? '·'}</div>
				</div>
				<div className="rounded-xl bg-background p-3">
					<div className="text-[11px] text-muted-foreground">Total gasto</div>
					<div className="pt-[3px] text-lg font-light">
						{stats ? formatCurrencyBrlCents(stats.spent) : '·'}
					</div>
				</div>
				<div className="rounded-xl bg-background p-3">
					<div className="text-[11px] text-muted-foreground">Cliente desde</div>
					<div className="pt-[3px] text-lg font-light">
						{customerSince(customer.createdAt)}
					</div>
				</div>
			</div>

			<div className="flex flex-col gap-1.5 text-sm">
				<SectionLabel>DADOS</SectionLabel>
				<div className="flex justify-between gap-3">
					<span className="text-muted-foreground">Telefone</span>
					<span>{customer.phone || 'Não informado'}</span>
				</div>
				<div className="flex justify-between gap-3">
					<span className="text-muted-foreground">E-mail</span>
					<span className="flex items-center gap-1.5 text-muted-foreground">
						confirmação
						<ComingSoonBadge />
					</span>
				</div>
			</div>

			<div className="flex flex-col gap-1.5">
				<SectionLabel>ENDEREÇOS</SectionLabel>
				{addresses.isPending ? (
					<div className="skeleton h-14 rounded-[10px]" />
				) : addresses.isError ? (
					<span className="text-[13px] text-clay">
						Não foi possível carregar os endereços.
					</span>
				) : addresses.data.length === 0 ? (
					<span className="text-[13px] text-muted-foreground">
						Nenhum endereço salvo.
					</span>
				) : (
					addresses.data.map((address) => {
						const lines = addressLines(address);
						return (
							<div
								key={address.id}
								className="rounded-[10px] border px-3 py-2.5 text-[13px] leading-normal"
							>
								<b className="font-medium">{address.label}</b> ·{' '}
								{addressTags(address)}
								<br />
								<span className="text-ink-soft">
									{lines.streetLine} · {lines.placeLine}
								</span>
							</div>
						);
					})
				)}
			</div>

			<div className="flex flex-col gap-1.5">
				<div className="flex items-center">
					<span className="grow">
						<SectionLabel>PEDIDOS RECENTES</SectionLabel>
					</span>
					{orders.data && orders.data.totalItems > 0 ? (
						<Link
							href={appRoutes.admin.ordersOfCustomer(customer.id)}
							className="text-[13px] font-medium text-primary hover:text-primary-strong"
						>
							Ver todos
						</Link>
					) : null}
				</div>
				{orders.isPending ? (
					<div className="skeleton h-20 rounded-[10px]" />
				) : orders.isError ? (
					<span className="text-[13px] text-clay">
						Não foi possível carregar os pedidos.
					</span>
				) : orders.data.items.length === 0 ? (
					<span className="text-[13px] text-muted-foreground">
						Ainda não comprou.
					</span>
				) : (
					orders.data.items.slice(0, RECENT_SHOWN).map((order) => (
						<Link
							key={order.id}
							href={appRoutes.admin.order(order.id)}
							className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3 border-t py-2 text-[13px] text-foreground hover:bg-[#FAFAF8]"
						>
							<span className="truncate font-mono">{order.orderNumber}</span>
							<span className="font-mono">
								{formatCurrencyBrlCents(order.totalAmount)}
							</span>
							<span
								className={cn(
									'inline-flex h-[22px] items-center rounded-full px-2 text-[11px] font-medium whitespace-nowrap',
									orderStatusClass(order.status),
								)}
							>
								{orderStatusLabel(order.status)}
							</span>
						</Link>
					))
				)}
			</div>

			<div
				className={cn(
					'mt-auto flex flex-col gap-2.5 rounded-[14px] p-4',
					active ? 'bg-clay-soft' : 'bg-success-soft',
				)}
			>
				<span className="text-sm font-medium">
					{active ? 'Desativar conta' : 'Conta desativada'}
				</span>
				<span className="text-[13px] leading-normal text-ink-soft">
					{active
						? 'A pessoa não consegue mais entrar nem comprar. Pedidos e histórico continuam guardados.'
						: 'Ao reativar, a pessoa volta a entrar com a mesma senha.'}
				</span>
				{asking && !mobile ? (
					<div className="flex animate-pop-in gap-2">
						<button
							type="button"
							disabled={status.isPending}
							onClick={confirm}
							className={cn(
								'h-[38px] rounded-[10px] px-3.5 text-[13px] font-medium text-white disabled:opacity-55',
								active ? 'bg-clay' : 'bg-success',
							)}
						>
							{status.isPending
								? 'Salvando…'
								: active
									? 'Sim, desativar'
									: 'Sim, reativar'}
						</button>
						<button
							type="button"
							onClick={() => setAsking(false)}
							className="h-[38px] rounded-[10px] border bg-card px-3 text-[13px]"
						>
							Voltar
						</button>
					</div>
				) : (
					<button
						type="button"
						onClick={() => setAsking(true)}
						className={cn(
							'h-[38px] self-start rounded-[10px] border bg-card px-3.5 text-[13px] font-medium',
							active ? 'border-clay text-clay' : 'border-success text-success',
						)}
					>
						{active ? 'Desativar' : 'Reativar'}
					</button>
				)}
				{status.isError ? (
					<span role="alert" className="text-xs text-clay">
						Não foi possível mudar a conta agora. Tente de novo.
					</span>
				) : null}
			</div>
			<BottomSheet
				open={asking && mobile}
				onOpenChange={setAsking}
				title={`${active ? 'Desativar' : 'Reativar'} ${customer.name}?`}
				description={
					active
						? 'A pessoa não consegue mais entrar nem comprar. Pedidos e histórico continuam guardados.'
						: 'Ao reativar, a pessoa volta a entrar com a mesma senha.'
				}
			>
				<button
					type="button"
					disabled={status.isPending}
					onClick={confirm}
					className={cn(
						'h-[50px] rounded-xl text-[15px] font-medium text-white disabled:opacity-55',
						active ? 'bg-clay' : 'bg-success',
					)}
				>
					{status.isPending
						? 'Salvando…'
						: active
							? 'Sim, desativar'
							: 'Sim, reativar'}
				</button>
				<button
					type="button"
					onClick={() => setAsking(false)}
					className="h-12 rounded-xl border bg-card text-[15px] font-medium"
				>
					Voltar
				</button>
			</BottomSheet>
		</>
	);
}

export { CustomerPanel };
