'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { appRoutes } from '@/lib/routes/app-routes';

import { useRequestPasswordReset } from '../hooks/auth.queries';
import { useCountdown } from '../hooks/use-countdown';
import { authErrorCopy } from '../lib/auth-messages';
import {
	forgotPasswordFormSchema,
	type ForgotPasswordForm,
} from '../schemas/auth-forms.schema';
import { AuthLayout } from './auth-layout';
import {
	AuthHeading,
	AuthScreen,
	FormAlert,
	PrimaryButton,
	StatusNotice,
	TextField,
	TextLink,
} from './auth-ui';

/** 12 · Esqueci minha senha. */
function ForgotPasswordPage() {
	return (
		<AuthLayout>
			<ForgotPasswordContent />
		</AuthLayout>
	);
}

function ForgotPasswordContent() {
	const request = useRequestPasswordReset();
	const countdown = useCountdown();
	const [errorCount, setErrorCount] = useState(0);
	const form = useForm<ForgotPasswordForm>({
		resolver: zodResolver(forgotPasswordFormSchema),
		defaultValues: { email: '' },
	});

	const onSubmit = form.handleSubmit((values) => {
		request.mutate(values.email, {
			onError: (failure) => {
				setErrorCount((count) => count + 1);
				const copy = authErrorCopy(failure);
				if (copy.lockSeconds) {
					countdown.start(copy.lockSeconds);
				}
			},
		});
	});

	const error = request.error ? authErrorCopy(request.error) : null;

	return (
		<AuthScreen>
			<AuthHeading
				eyebrow="RECUPERAR ACESSO"
				description="Digite o e-mail da sua conta e enviaremos um link para criar uma nova."
			>
				Esqueceu a senha?
			</AuthHeading>
			{request.isSuccess ? (
				<>
					{/* The backend answers the same for any address on purpose. */}
					<StatusNotice tone="info">
						<span>
							Se houver uma conta com{' '}
							<b className="font-medium">{request.variables}</b>, enviamos o
							link. Ele vale por 30 minutos.
						</span>
					</StatusNotice>
					<TextLink href={appRoutes.auth.login} className="self-start">
						Voltar para entrar
					</TextLink>
				</>
			) : (
				<>
					{error ? (
						<FormAlert key={errorCount}>
							{countdown.locked
								? `Muitas tentativas seguidas. Tente de novo em ${countdown.secondsLeft} segundos.`
								: error.text}
						</FormAlert>
					) : null}
					<form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
						<TextField
							id="forgot-email"
							label="E-mail"
							type="email"
							autoComplete="email"
							error={form.formState.errors.email?.message}
							{...form.register('email')}
						/>
						<PrimaryButton
							type="submit"
							disabled={countdown.locked || request.isPending}
						>
							{countdown.locked
								? `Aguarde ${countdown.secondsLeft}s`
								: request.isPending
									? 'Enviando…'
									: 'Enviar link'}
						</PrimaryButton>
					</form>
					<TextLink href={appRoutes.auth.login} className="self-start">
						Lembrei a senha
					</TextLink>
				</>
			)}
		</AuthScreen>
	);
}

export { ForgotPasswordPage };
