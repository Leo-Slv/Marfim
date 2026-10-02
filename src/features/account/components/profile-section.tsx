'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { useSession } from '@/lib/auth/use-session';

import { useProfile, useUpdateProfile } from '../hooks/account.queries';
import {
	joinName,
	maskPhone,
	phoneDigits,
	splitName,
} from '../lib/account-format';
import {
	profileFormSchema,
	type Profile,
	type ProfileForm,
} from '../schemas/account.schema';
import { notify } from './account-toast';

const fieldClassName =
	'h-12 w-full rounded-xl border bg-card px-3.5 text-[15px] text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary aria-invalid:border-clay';

/** 20 · Meus dados. */
function ProfileSection() {
	const profile = useProfile();
	if (profile.isPending) {
		return <div className="skeleton h-[320px] rounded-[20px]" />;
	}
	if (profile.isError) {
		return (
			<p role="alert" className="rounded-2xl bg-clay-soft px-5 py-4 text-sm">
				Não foi possível carregar seus dados.
			</p>
		);
	}
	// Keyed so the form restarts from the saved data after each save.
	return <ProfileForm key={profile.dataUpdatedAt} profile={profile.data} />;
}

function ProfileForm({ profile }: { profile: Profile }) {
	const session = useSession();
	const update = useUpdateProfile();
	const { first, last } = splitName(profile.name);
	const form = useForm<ProfileForm>({
		resolver: zodResolver(profileFormSchema),
		defaultValues: { first, last, phone: maskPhone(profile.phone ?? '') },
	});
	const errors = form.formState.errors;
	const phone = form.register('phone');

	const onSubmit = form.handleSubmit((values) => {
		update.mutate(
			{
				name: joinName(values.first, values.last),
				phone: phoneDigits(values.phone) ? maskPhone(values.phone) : null,
			},
			{ onSuccess: () => notify('Dados salvos') },
		);
	});

	return (
		<form
			onSubmit={onSubmit}
			noValidate
			className="flex flex-col gap-[18px] rounded-[20px] border bg-card p-7"
		>
			<h2 className="text-2xl font-medium tracking-[-0.01em]">Meus dados</h2>
			<div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
				<Field label="Nome" htmlFor="profile-first">
					<input
						id="profile-first"
						autoComplete="given-name"
						aria-invalid={errors.first ? true : undefined}
						className={fieldClassName}
						{...form.register('first')}
					/>
				</Field>
				<Field label="Sobrenome" htmlFor="profile-last">
					<input
						id="profile-last"
						autoComplete="family-name"
						className={fieldClassName}
						{...form.register('last')}
					/>
				</Field>
				<Field
					label="E-mail"
					htmlFor="profile-email"
					hint="Para trocar o e-mail, fale com o atendimento."
				>
					<span className="relative flex">
						<input
							id="profile-email"
							value={profile.email}
							readOnly
							className={`${fieldClassName} bg-background pr-28 text-ink-soft`}
						/>
						{session?.emailConfirmed ? (
							<span className="absolute top-[15px] right-3 font-mono text-[10px] tracking-[0.1em] text-success">
								CONFIRMADO
							</span>
						) : null}
					</span>
				</Field>
				<Field
					label="Telefone"
					htmlFor="profile-phone"
					error={errors.phone?.message}
				>
					<input
						id="profile-phone"
						inputMode="tel"
						autoComplete="tel"
						placeholder="(11) 90000-0000"
						aria-invalid={errors.phone ? true : undefined}
						className={`${fieldClassName} font-mono text-sm`}
						{...phone}
						onChange={(event) => {
							event.target.value = maskPhone(event.target.value);
							void phone.onChange(event);
						}}
					/>
				</Field>
			</div>
			{errors.first ? (
				<span role="alert" className="text-[13px] text-clay">
					{errors.first.message}
				</span>
			) : null}
			{update.isError ? (
				<span role="alert" className="text-[13px] text-clay">
					Não foi possível salvar agora. Tente de novo em instantes.
				</span>
			) : null}
			<div className="flex items-center gap-2.5 border-t pt-1.5">
				<button
					type="submit"
					disabled={update.isPending}
					className="mt-1.5 h-12 rounded-xl bg-primary px-[22px] text-[15px] font-medium text-primary-foreground transition-[background-color,transform] duration-200 enabled:hover:-translate-y-px enabled:hover:bg-primary-strong disabled:opacity-55"
				>
					{update.isPending ? 'Salvando…' : 'Salvar alterações'}
				</button>
				{form.formState.isDirty ? (
					<span className="mt-1.5 text-[13px] text-muted-foreground">
						Alterações não salvas
					</span>
				) : null}
			</div>
		</form>
	);
}

function Field({
	label,
	htmlFor,
	hint,
	error,
	children,
}: {
	label: string;
	htmlFor: string;
	hint?: string;
	error?: string;
	children: React.ReactNode;
}) {
	return (
		<div className="flex flex-col gap-1.5 text-[13px] text-ink-soft">
			<label htmlFor={htmlFor}>{label}</label>
			{children}
			{error ? (
				<span className="text-xs text-clay">{error}</span>
			) : hint ? (
				<span className="text-xs text-muted-foreground">{hint}</span>
			) : null}
		</div>
	);
}

export { ProfileSection };
