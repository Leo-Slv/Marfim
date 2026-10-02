'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { useSession } from '@/lib/auth/use-session';
import { useIsHydrated } from '@/lib/hooks/use-is-hydrated';
import { appRoutes } from '@/lib/routes/app-routes';

import { useSignIn } from '../hooks/auth.queries';
import { useCountdown } from '../hooks/use-countdown';
import { authErrorCopy } from '../lib/auth-messages';
import { safeNext } from '../lib/safe-next';
import {
	signInFormSchema,
	type SignInForm,
} from '../schemas/auth-forms.schema';
import { AuthLayout } from './auth-layout';
import {
	Accent,
	AuthHeading,
	AuthScreen,
	ButtonLink,
	FormAlert,
	PasswordField,
	PrimaryButton,
	StatusIcon,
	SwitchPrompt,
	TextField,
	TextLink,
} from './auth-ui';

/** How long "Você entrou" shows before returning to `next`. */
const SIGNED_IN_REDIRECT_MS = 1200;

function SignInPage() {
	return (
		<AuthLayout>
			<SignInContent />
		</AuthLayout>
	);
}

function SignInContent() {
	const router = useRouter();
	const next = safeNext(useSearchParams().get('next'));
	const destination = next ?? appRoutes.system.home;
	const hydrated = useIsHydrated();
	const session = useSession();
	const signIn = useSignIn();
	const countdown = useCountdown();
	const [errorCount, setErrorCount] = useState(0);

	const form = useForm<SignInForm>({
		resolver: zodResolver(signInFormSchema),
		defaultValues: { email: '', password: '' },
	});

	// Opening the form while already signed in goes straight on.
	// Only before any submit: the mutation itself stores the session a render
	// before it reports success.
	const alreadySignedIn = hydrated && session !== null && signIn.isIdle;
	useEffect(() => {
		if (alreadySignedIn) {
			router.replace(destination);
		}
	}, [alreadySignedIn, destination, router]);

	useEffect(() => {
		if (!signIn.isSuccess) {
			return;
		}
		const timer = setTimeout(
			() => router.replace(destination),
			SIGNED_IN_REDIRECT_MS,
		);
		return () => clearTimeout(timer);
	}, [signIn.isSuccess, destination, router]);

	if (signIn.isSuccess) {
		return (
			<AuthScreen>
				<StatusIcon tone="success" />
				<AuthHeading description="Voltando para onde você estava…">
					Você entrou
				</AuthHeading>
				<div className="flex flex-wrap gap-2.5">
					<ButtonLink variant="primary" href={appRoutes.cart.index}>
						Voltar para a sacola
					</ButtonLink>
					<ButtonLink variant="secondary" href={appRoutes.account.index}>
						Minha conta
					</ButtonLink>
				</div>
			</AuthScreen>
		);
	}

	const error = signIn.error ? authErrorCopy(signIn.error) : null;

	const onSubmit = form.handleSubmit((values) => {
		signIn.mutate(values, {
			onError: (failure) => {
				setErrorCount((count) => count + 1);
				const copy = authErrorCopy(failure);
				if (copy.lockSeconds) {
					countdown.start(copy.lockSeconds);
				}
			},
		});
	});

	return (
		<AuthScreen>
			<AuthHeading eyebrow="ENTRAR">
				Bom te ver <Accent>de novo</Accent>
			</AuthHeading>
			{error ? (
				<FormAlert key={errorCount}>
					{countdown.locked
						? `Muitas tentativas seguidas. Tente de novo em ${countdown.secondsLeft} segundos.`
						: error.text}
				</FormAlert>
			) : null}
			<form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
				<TextField
					id="sign-in-email"
					label="E-mail"
					type="email"
					autoComplete="email"
					placeholder="voce@email.com"
					error={form.formState.errors.email?.message}
					{...form.register('email')}
				/>
				<PasswordField
					id="sign-in-password"
					label="Senha"
					autoComplete="current-password"
					error={form.formState.errors.password?.message}
					labelAction={
						<TextLink
							href={appRoutes.auth.forgotPassword}
							className="min-h-0 text-[13px]"
						>
							Esqueci minha senha
						</TextLink>
					}
					{...form.register('password')}
				/>
				<PrimaryButton
					type="submit"
					disabled={countdown.locked || signIn.isPending}
				>
					{countdown.locked
						? `Aguarde ${countdown.secondsLeft}s`
						: signIn.isPending
							? 'Entrando…'
							: 'Entrar'}
				</PrimaryButton>
			</form>
			<SwitchPrompt>
				Ainda não tem conta?
				<TextLink
					href={
						next
							? `${appRoutes.auth.register}?next=${encodeURIComponent(next)}`
							: appRoutes.auth.register
					}
				>
					Criar conta
				</TextLink>
			</SwitchPrompt>
		</AuthScreen>
	);
}

export { SignInPage };
