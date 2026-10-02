'use client';

import { MapPinIcon } from '@phosphor-icons/react';
import { useState } from 'react';

import { AddressFormCard } from '@/features/checkout/components/address-form';
import {
	useAddAddress,
	useAddresses,
} from '@/features/checkout/hooks/checkout.queries';
import { addressToForm } from '@/features/checkout/lib/address-to-form';
import { addressLines } from '@/features/checkout/lib/format-address';
import type { CustomerAddress } from '@/features/checkout/model/address';
import type { AddressForm } from '@/features/checkout/schemas/address-form.schema';

import { useAddressMutations } from '../hooks/account.queries';
import { notify } from './account-toast';

type FormMode = { kind: 'new' } | { kind: 'edit'; address: CustomerAddress };

/** 21 · Endereços. */
function AddressesSection() {
	const addresses = useAddresses();
	const add = useAddAddress();
	const { update, makeDefault, remove } = useAddressMutations();
	const [mode, setMode] = useState<FormMode | null>(null);
	const [confirmingId, setConfirmingId] = useState<string | null>(null);

	const saved = addresses.data ?? [];

	function save(form: AddressForm) {
		if (mode?.kind === 'edit') {
			const position = saved.findIndex((item) => item.id === mode.address.id);
			update.mutate(
				{ addressId: mode.address.id, form, position },
				{
					onSuccess: () => {
						setMode(null);
						notify('Endereço atualizado');
					},
				},
			);
			return;
		}
		add.mutate(
			{ form, existing: saved },
			{
				onSuccess: () => {
					setMode(null);
					notify('Endereço adicionado');
				},
			},
		);
	}

	return (
		<>
			<div className="flex items-center gap-3">
				<h2 className="grow text-2xl font-medium tracking-[-0.01em]">
					Endereços
				</h2>
				{saved.length > 0 && !mode ? (
					<button
						type="button"
						onClick={() => setMode({ kind: 'new' })}
						className="h-11 rounded-xl border bg-card px-4 text-sm font-medium transition-colors hover:bg-surface-2"
					>
						+ Novo endereço
					</button>
				) : null}
			</div>

			{addresses.isPending ? (
				<div className="skeleton h-[200px] rounded-[20px]" />
			) : addresses.isError ? (
				<p role="alert" className="rounded-2xl bg-clay-soft px-5 py-4 text-sm">
					Não foi possível carregar seus endereços.
				</p>
			) : saved.length === 0 && !mode ? (
				<div className="flex flex-col items-center gap-3 rounded-[20px] border bg-card px-8 py-12 text-center">
					<div className="flex size-16 animate-floaty items-center justify-center rounded-full bg-surface">
						<MapPinIcon size={28} className="text-muted-foreground" />
					</div>
					<div className="text-[22px] font-light">Nenhum endereço salvo</div>
					<p className="max-w-[360px] text-sm text-muted-foreground">
						Cadastre um endereço para agilizar o checkout. O primeiro vira o
						padrão de entrega e de cobrança.
					</p>
					<button
						type="button"
						onClick={() => setMode({ kind: 'new' })}
						className="mt-1.5 h-12 rounded-xl bg-primary px-[22px] text-[15px] font-medium text-primary-foreground transition-colors hover:bg-primary-strong"
					>
						Adicionar endereço
					</button>
				</div>
			) : null}

			{mode ? (
				<div className="rounded-[20px] border border-primary bg-card p-6">
					<AddressFormCard
						key={mode.kind === 'edit' ? mode.address.id : 'new'}
						standalone
						title={mode.kind === 'edit' ? 'Editar endereço' : 'Novo endereço'}
						initialValues={
							mode.kind === 'edit' ? addressToForm(mode.address) : undefined
						}
						isFirst={mode.kind === 'edit' || saved.length === 0}
						saving={add.isPending || update.isPending}
						saveError={add.error ?? update.error}
						onSave={save}
						onCancel={() => setMode(null)}
					/>
				</div>
			) : null}

			{saved.length > 0 ? (
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
					{saved.map((address) => (
						<AddressItem
							key={address.id}
							address={address}
							confirming={confirmingId === address.id}
							busy={makeDefault.isPending || remove.isPending}
							onEdit={() => {
								setConfirmingId(null);
								setMode({ kind: 'edit', address });
							}}
							onMakeDefault={(kind) =>
								makeDefault.mutate(
									{ addressId: address.id, kind },
									{
										onSuccess: () =>
											notify(
												kind === 'shipping'
													? 'Entrega padrão atualizada'
													: 'Cobrança padrão atualizada',
											),
									},
								)
							}
							onAskDelete={() => setConfirmingId(address.id)}
							onCancelDelete={() => setConfirmingId(null)}
							onDelete={() =>
								remove.mutate(address.id, {
									onSuccess: () => {
										setConfirmingId(null);
										notify('Endereço excluído');
									},
								})
							}
						/>
					))}
				</div>
			) : null}
		</>
	);
}

function AddressItem({
	address,
	confirming,
	busy,
	onEdit,
	onMakeDefault,
	onAskDelete,
	onCancelDelete,
	onDelete,
}: {
	address: CustomerAddress;
	confirming: boolean;
	busy: boolean;
	onEdit: () => void;
	onMakeDefault: (kind: 'shipping' | 'billing') => void;
	onAskDelete: () => void;
	onCancelDelete: () => void;
	onDelete: () => void;
}) {
	const { streetLine, placeLine } = addressLines(address);
	const link =
		'min-h-8 text-sm font-medium text-primary hover:text-primary-strong disabled:opacity-55';

	return (
		<article className="flex animate-up flex-col gap-3 rounded-2xl border bg-card p-5">
			<div className="flex flex-wrap items-center gap-2">
				<b className="grow text-base font-medium">{address.label}</b>
				{address.isDefaultShipping ? (
					<span className="inline-flex h-[22px] items-center rounded-full bg-primary-soft px-2 font-mono text-[10px] tracking-[0.08em] text-primary">
						ENTREGA PADRÃO
					</span>
				) : null}
				{address.isDefaultBilling ? (
					<span className="inline-flex h-[22px] items-center rounded-full bg-surface px-2 font-mono text-[10px] tracking-[0.08em] text-ink-soft">
						COBRANÇA PADRÃO
					</span>
				) : null}
			</div>
			<div className="text-sm leading-[1.55] text-ink-soft">
				{address.recipientName}
				<br />
				{streetLine}
				<br />
				{placeLine}
			</div>
			{confirming ? (
				<div
					role="alertdialog"
					aria-label="Confirmar exclusão"
					className="flex animate-pop-in flex-wrap items-center gap-2.5 rounded-xl bg-clay-soft px-3.5 py-3 text-sm"
				>
					<span className="grow">Excluir “{address.label}”?</span>
					<button
						type="button"
						onClick={onDelete}
						disabled={busy}
						className="h-9 rounded-[10px] bg-clay px-3.5 text-[13px] font-medium text-white disabled:opacity-55"
					>
						Excluir
					</button>
					<button
						type="button"
						onClick={onCancelDelete}
						className="h-9 rounded-[10px] border bg-card px-3 text-[13px]"
					>
						Manter
					</button>
				</div>
			) : (
				<div className="flex flex-wrap gap-4 border-t pt-2.5">
					<button type="button" onClick={onEdit} className={link}>
						Editar
					</button>
					{address.isDefaultShipping ? null : (
						<button
							type="button"
							onClick={() => onMakeDefault('shipping')}
							disabled={busy}
							className={link}
						>
							Tornar entrega padrão
						</button>
					)}
					{address.isDefaultBilling ? null : (
						<button
							type="button"
							onClick={() => onMakeDefault('billing')}
							disabled={busy}
							className={link}
						>
							Tornar cobrança padrão
						</button>
					)}
					<span className="grow" />
					<button
						type="button"
						onClick={onAskDelete}
						className="min-h-8 text-sm text-muted-foreground hover:text-clay"
					>
						Excluir
					</button>
				</div>
			)}
		</article>
	);
}

export { AddressesSection };
