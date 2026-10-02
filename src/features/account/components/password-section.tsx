'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import {
	PasswordField,
	PasswordStrengthMeter,
	StatusIcon,
} from '@/features/auth/components/auth-ui';
import { authErrorCopy, hasErrorCode } from '@/features/auth/lib/auth-messages';

import { useChangePassword } from '../hooks/account.queries';
import {
	changePasswordFormSchema,
	type ChangePasswordForm,
} from '../schemas/account.schema';

/** 24 · Trocar senha (this session stays; the others end). */
function PasswordSection() {
	const change = useChangePassword();
	const [errorCount, setErrorCount] = useState(0);
	const form = useForm<ChangePasswordForm>({
		resolver: zodResolver(changePasswordFormSchema),
		defaultValues: { currentPassword: '', newPassword: '' },
	});
	const newPassword = useWatch({ control: form.control, name: 'newPassword' });

	if (change.isSuccess) {
		return (
			<div className="flex animate-pop-in flex-col gap-3 rounded-[20px] border bg-card p-8">
				<StatusIcon tone="success" />
				<b className="text-[22px] font-medium">Senha alterada</b>
				<span className="text-[15px] leading-[1.55] text-ink-soft">
					Encerramos as sessões abertas em outros aparelhos. Este continua
					conectado.
				</span>
				<button
					type="button"
					onClick={() => {
						change.reset();
						form.reset();
					}}
					className="min-h-8 self-start text-sm font-medium text-primary hover:text-primary-strong"
				>
					Voltar
				</button>
			</div>
		);
	}

	const wrongCurrent = hasErrorCode(change.error, 'invalid_current_password');

	const onSubmit = form.handleSubmit((values) => {
		change.mutate(values, {
			onError: () => setErrorCount((count) => count + 1),
		});
	});

	return (
		<form
			onSubmit={onSubmit}
			noValidate
			className="flex max-w-[520px] flex-col gap-4 rounded-[20px] border bg-card p-7"
		>
			<h2 className="text-2xl font-medium tracking-[-0.01em]">Trocar senha</h2>
			<div
				key={wrongCurrent ? errorCount : 'current'}
				className={wrongCurrent ? 'animate-shake' : undefined}
			>
				<PasswordField
					id="current-password"
					label="Senha atual"
					autoComplete="current-password"
					error={
						wrongCurrent
							? 'A senha atual está incorreta.'
							: form.formState.errors.currentPassword?.message
					}
					{...form.register('currentPassword')}
				/>
			</div>
			<PasswordField
				id="new-password"
				label="Nova senha"
				autoComplete="new-password"
				error={form.formState.errors.newPassword?.message}
				{...form.register('newPassword')}
			/>
			<PasswordStrengthMeter password={newPassword} />
			<p className="text-[13px] leading-normal text-muted-foreground">
				Ao trocar a senha, as sessões em outros aparelhos são encerradas.
			</p>
			{change.isError && !wrongCurrent ? (
				<span role="alert" className="text-[13px] text-clay">
					{authErrorCopy(change.error).text}
				</span>
			) : null}
			<button
				type="submit"
				disabled={change.isPending}
				className="h-12 self-start rounded-xl bg-primary px-[22px] text-[15px] font-medium text-primary-foreground transition-[background-color,transform] duration-200 enabled:hover:-translate-y-px enabled:hover:bg-primary-strong disabled:opacity-55"
			>
				{change.isPending ? 'Trocando…' : 'Trocar senha'}
			</button>
		</form>
	);
}

export { PasswordSection };
