'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { cn } from '@/lib/utils';

import { shipFormSchema, type ShipForm } from '../lib/order-actions';

const inputClass =
	'h-10 w-full rounded-[10px] border bg-card px-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary aria-invalid:border-clay';

/** Carrier + tracking code (required) + link → "Marcar como enviado". */
function ShipFormCard({
	pending,
	onShip,
}: {
	pending: boolean;
	onShip: (shipment: ShipForm) => void;
}) {
	const form = useForm<ShipForm>({
		resolver: zodResolver(shipFormSchema),
		defaultValues: { carrier: '', trackingCode: '', trackingUrl: '' },
	});
	const errors = form.formState.errors;
	const firstError =
		errors.carrier?.message ??
		errors.trackingCode?.message ??
		errors.trackingUrl?.message;

	return (
		<form
			onSubmit={form.handleSubmit(onShip)}
			noValidate
			className="flex flex-col gap-2"
		>
			<input
				aria-label="Transportadora"
				placeholder="Transportadora"
				aria-invalid={errors.carrier ? true : undefined}
				className={inputClass}
				{...form.register('carrier')}
			/>
			<input
				aria-label="Código de rastreio"
				placeholder="Código de rastreio"
				aria-invalid={errors.trackingCode ? true : undefined}
				className={cn(inputClass, 'font-mono text-[13px]')}
				{...form.register('trackingCode')}
			/>
			<input
				aria-label="Link de rastreio"
				placeholder="Link de rastreio (opcional)"
				inputMode="url"
				aria-invalid={errors.trackingUrl ? true : undefined}
				className={cn(inputClass, 'text-[13px]')}
				{...form.register('trackingUrl')}
			/>
			{firstError ? (
				<span role="alert" className="text-xs text-clay">
					{firstError}
				</span>
			) : null}
			<button
				type="submit"
				disabled={pending}
				className="h-11 rounded-xl bg-primary text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-strong disabled:opacity-55"
			>
				{pending ? 'Enviando…' : 'Marcar como enviado'}
			</button>
			<span className="text-xs text-muted-foreground">
				Captura o pagamento no Stripe e avisa o cliente por e-mail.
			</span>
		</form>
	);
}

export { ShipFormCard };
