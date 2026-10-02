'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { signOut } from '@/lib/auth/session-client';
import { getSessionSnapshot } from '@/lib/auth/session-store';
import { appRoutes } from '@/lib/routes/app-routes';

import { useResetPassword } from '../hooks/auth.queries';
import { authErrorCopy, hasErrorCode } from '../lib/auth-messages';
import {
	resetPasswordFormSchema,
	type ResetPasswordForm,
} from '../schemas/auth-forms.schema';
import { AuthLayout } from './auth-layout';
import {
	AuthHeading,
	AuthScreen,
	FormAlert,
	PasswordField,
	PasswordStrengthMeter,
	PrimaryButton,
	StatusIcon,
} from './auth-ui';

/** 13 · Nova senha — `/redefinir-senha?token=` (the backend e-mail's link). */
function ResetPasswordPage() {
	return (
		<AuthLayout>
			<ResetPasswordContent />
		</AuthLayout>
	);
}

function ResetPasswordContent() {
	const router = useRouter();
	const token = useSearchParams().get('token');
	const reset = useResetPassword();
	const [errorCount, setErrorCount] = useState(0);
	const form = useForm<ResetPasswordForm>({
		resolver: zodResolver(resetPasswordFormSchema),
		defaultValues: { password: '', confirmation: '' },
		mode: 'onTouched',
	});
	const password = useWatch({ control: form.control, name: 'password' });

	const expired =
		!token || hasErrorCode(reset.error, 'invalid_or_expired_token');

	if (expired) {
		return (
			<AuthScreen>
				<StatusIcon tone="expired" />
				<AuthHeading description="Links de nova senha valem 30 minutos e só funcionam uma vez.">
					Esse link expirou
				</AuthHeading>
				<PrimaryButton
					size="md"
					className="self-start"
					onClick={() => router.push(appRoutes.auth.forgotPassword)}
				>
					Pedir novo link
				</PrimaryButton>
			</AuthScreen>
		);
	}

	if (reset.isSuccess) {
		return (
			<AuthScreen>
				<StatusIcon tone="success" />
				<AuthHeading description="Por segurança, encerramos todas as sessões abertas. Entre de novo com a senha nova.">
					Senha alterada
				</AuthHeading>
				<PrimaryButton
					size="md"
					className="self-start"
					onClick={() => router.push(appRoutes.auth.login)}
				>
					Entrar
				</PrimaryButton>
			</AuthScreen>
		);
	}

	const onSubmit = form.handleSubmit((values) => {
		reset.mutate(
			{ token, password: values.password },
			{
				// Every session ended on the server; drop this browser's too.
				onSuccess: () => {
					if (getSessionSnapshot()) {
						void signOut().catch(() => undefined);
					}
				},
				onError: () => setErrorCount((count) => count + 1),
			},
		);
	});

	const confirmationError = form.formState.errors.confirmation?.message;

	return (
		<AuthScreen>
			<AuthHeading eyebrow="NOVA SENHA">Crie uma senha nova</AuthHeading>
			{reset.error ? (
				<FormAlert key={errorCount}>
					{authErrorCopy(reset.error).text}
				</FormAlert>
			) : form.formState.errors.password ? (
				<FormAlert key={`weak-${form.formState.submitCount}`}>
					{form.formState.errors.password.message}
				</FormAlert>
			) : null}
			<form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
				<PasswordField
					id="reset-password"
					label="Nova senha"
					autoComplete="new-password"
					aria-invalid={form.formState.errors.password ? true : undefined}
					{...form.register('password')}
				/>
				<PasswordStrengthMeter password={password} />
				<PasswordField
					id="reset-confirmation"
					label="Repita a nova senha"
					autoComplete="new-password"
					error={confirmationError}
					{...form.register('confirmation')}
				/>
				<PrimaryButton type="submit" disabled={reset.isPending}>
					{reset.isPending ? 'Salvando…' : 'Salvar nova senha'}
				</PrimaryButton>
			</form>
		</AuthScreen>
	);
}

export { ResetPasswordPage };
