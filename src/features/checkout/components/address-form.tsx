'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type FieldPath } from 'react-hook-form';

import { authErrorCopy } from '@/features/auth/lib/auth-messages';
import { cn } from '@/lib/utils';

import { brazilianStates } from '../lib/brazilian-states';
import { maskPostalCode } from '../lib/format-address';
import {
	addressFormSchema,
	emptyAddressForm,
	type AddressForm,
} from '../schemas/address-form.schema';

const fieldClassName =
	'h-11 w-full rounded-xl border bg-card px-3 text-[15px] text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary aria-invalid:border-clay';

type AddressFormProps = {
	/**
	 * Hides "Usar como padrão de entrega": the first address always becomes
	 * the default, and when editing defaults are set from the card.
	 */
	isFirst: boolean;
	saving: boolean;
	saveError: unknown;
	onSave: (form: AddressForm) => void;
	onCancel: (() => void) | null;
	/** Editing an existing address (Minha conta). */
	initialValues?: AddressForm;
	title?: string;
	/** Drops the top divider when the form stands alone in a card. */
	standalone?: boolean;
};

/** "Novo endereço" (Entrega.dc.html) / "Editar endereço" (Conta.dc.html). */
function AddressFormCard({
	isFirst,
	saving,
	saveError,
	onSave,
	onCancel,
	initialValues,
	title = 'Novo endereço',
	standalone = false,
}: AddressFormProps) {
	const form = useForm<AddressForm>({
		resolver: zodResolver(addressFormSchema),
		defaultValues: initialValues ?? emptyAddressForm,
	});
	const errors = form.formState.errors;
	const invalid = (name: FieldPath<AddressForm>) =>
		errors[name] ? true : undefined;

	const postalCode = form.register('postalCode');

	return (
		<form
			onSubmit={form.handleSubmit(onSave)}
			noValidate
			className={cn(
				'flex animate-up flex-col gap-3.5',
				!standalone && 'border-t pt-4',
			)}
		>
			<div className="text-[15px] font-medium">{title}</div>
			<div className="grid grid-cols-1 gap-3 sm:grid-cols-6">
				<Field
					htmlFor="address-label"
					label="Nome do endereço"
					className="sm:col-span-2"
				>
					<input
						placeholder="Casa, Trabalho…"
						className={fieldClassName}
						id="address-label"
						{...form.register('label')}
					/>
				</Field>
				<Field
					htmlFor="address-recipientName"
					label="Quem recebe"
					className="sm:col-span-4"
				>
					<input
						autoComplete="name"
						aria-invalid={invalid('recipientName')}
						className={fieldClassName}
						id="address-recipientName"
						{...form.register('recipientName')}
					/>
				</Field>
				<Field
					htmlFor="address-postalCode"
					label="CEP"
					className="sm:col-span-2"
				>
					<input
						inputMode="numeric"
						autoComplete="postal-code"
						placeholder="00000-000"
						aria-invalid={invalid('postalCode')}
						className={cn(fieldClassName, 'font-mono text-sm')}
						id="address-postalCode"
						{...postalCode}
						onChange={(event) => {
							event.target.value = maskPostalCode(event.target.value);
							void postalCode.onChange(event);
						}}
					/>
				</Field>
				<Field htmlFor="address-street" label="Rua" className="sm:col-span-4">
					<input
						autoComplete="address-line1"
						aria-invalid={invalid('street')}
						className={fieldClassName}
						id="address-street"
						{...form.register('street')}
					/>
				</Field>
				<Field
					htmlFor="address-number"
					label="Número"
					className="sm:col-span-2"
				>
					<input
						aria-invalid={invalid('number')}
						className={fieldClassName}
						id="address-number"
						{...form.register('number')}
					/>
				</Field>
				<Field
					htmlFor="address-complement"
					label={
						<>
							Complemento{' '}
							<span className="text-muted-foreground">(opcional)</span>
						</>
					}
					className="sm:col-span-4"
				>
					<input
						autoComplete="address-line2"
						className={fieldClassName}
						id="address-complement"
						{...form.register('complement')}
					/>
				</Field>
				<Field
					htmlFor="address-neighborhood"
					label="Bairro"
					className="sm:col-span-2"
				>
					<input
						aria-invalid={invalid('neighborhood')}
						className={fieldClassName}
						id="address-neighborhood"
						{...form.register('neighborhood')}
					/>
				</Field>
				<Field htmlFor="address-city" label="Cidade" className="sm:col-span-3">
					<input
						autoComplete="address-level2"
						aria-invalid={invalid('city')}
						className={fieldClassName}
						id="address-city"
						{...form.register('city')}
					/>
				</Field>
				<Field htmlFor="address-state" label="UF" className="sm:col-span-1">
					<select
						autoComplete="address-level1"
						className={cn(fieldClassName, 'px-2')}
						id="address-state"
						{...form.register('state')}
					>
						{brazilianStates.map((state) => (
							<option key={state} value={state}>
								{state}
							</option>
						))}
					</select>
				</Field>
			</div>
			{Object.keys(errors).length > 0 ? (
				<div role="alert" className="text-[13px] text-clay">
					Preencha os campos destacados. O CEP tem 8 números.
				</div>
			) : saveError ? (
				<div role="alert" className="text-[13px] text-clay">
					{authErrorCopy(saveError).text}
				</div>
			) : null}
			{isFirst ? null : (
				<label className="flex cursor-pointer items-center gap-2.5 text-sm text-ink-soft">
					<input
						type="checkbox"
						className="size-[18px] accent-primary"
						id="address-makeDefault"
						{...form.register('makeDefault')}
					/>
					Usar como padrão de entrega
				</label>
			)}
			<div className="flex gap-2.5">
				<button
					type="submit"
					disabled={saving}
					className="h-11 rounded-xl bg-primary px-5 text-[15px] font-medium text-primary-foreground transition-[background-color,transform] duration-200 enabled:hover:-translate-y-px enabled:hover:bg-primary-strong disabled:opacity-55"
				>
					{saving ? 'Salvando…' : 'Salvar endereço'}
				</button>
				{onCancel ? (
					<button
						type="button"
						onClick={onCancel}
						className="h-11 rounded-xl border bg-card px-[18px] text-[15px] font-medium transition-colors hover:bg-surface-2"
					>
						Cancelar
					</button>
				) : null}
			</div>
		</form>
	);
}

function Field({
	htmlFor,
	label,
	className,
	children,
}: {
	/** The control's id — an explicit association every AT reads. */
	htmlFor: string;
	label: React.ReactNode;
	className?: string;
	children: React.ReactNode;
}) {
	return (
		<div
			className={cn(
				'flex flex-col gap-1.5 text-[13px] text-ink-soft',
				className,
			)}
		>
			<label htmlFor={htmlFor}>{label}</label>
			{children}
		</div>
	);
}

export { AddressFormCard };
