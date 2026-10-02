'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { useSession } from '@/lib/auth/use-session';
import { useIsHydrated } from '@/lib/hooks/use-is-hydrated';
import { appRoutes } from '@/lib/routes/app-routes';

import { useSignUp } from '../hooks/auth.queries';
import { useCountdown } from '../hooks/use-countdown';
import { authErrorCopy } from '../lib/auth-messages';
import { safeNext } from '../lib/safe-next';
import {
	signUpFormSchema,
	type SignUpForm,
} from '../schemas/auth-forms.schema';
import { AuthLayout } from './auth-layout';
import {
	Accent,
	AuthHeading,
	AuthScreen,
	FormAlert,
	PasswordField,
	PasswordStrengthMeter,
	PrimaryButton,
	SwitchPrompt,
	TextField,
	TextLink,
} from './auth-ui';

function SignUpPage() {
	return (
		<AuthLayout>
			<SignUpContent />
		</AuthLayout>
	);
}

function SignUpContent() {
	const router = useRouter();
	const next = safeNext(useSearchParams().get('next'));
	const hydrated = useIsHydrated();
	const session = useSession();
	const signUp = useSignUp();
	const countdown = useCountdown();
	const [errorCount, setErrorCount] = useState(0);

	const form = useForm<SignUpForm>({
		resolver: zodResolver(signUpFormSchema),
		defaultValues: { name: '', email: '', password: '', terms: false },
	});
	const password = useWatch({ control: form.control, name: 'password' });
	const termsAccepted = useWatch({ control: form.control, name: 'terms' });

	// Only before any submit (see sign-in-page).
	const alreadySignedIn = hydrated && session !== null && signUp.isIdle;
	useEffect(() => {
		if (alreadySignedIn) {
			router.replace(next ?? appRoutes.system.home);
		}
	}, [alreadySignedIn, next, router]);

	const onSubmit = form.handleSubmit((values) => {
		signUp.mutate(
			{ name: values.name, email: values.email, password: values.password },
			{
				onSuccess: () => router.push(appRoutes.auth.confirmEmail),
				onError: (failure) => {
					setErrorCount((count) => count + 1);
					const copy = authErrorCopy(failure);
					if (copy.lockSeconds) {
						countdown.start(copy.lockSeconds);
					}
				},
			},
		);
	});

	// A weak password caught on the client gets the mockup's banner too.
	const weakPasswordMessage = form.formState.errors.password?.message;
	const error = signUp.error ? authErrorCopy(signUp.error) : null;
	const loginHref = next
		? appRoutes.auth.loginThen(next)
		: appRoutes.auth.login;

	return (
		<AuthScreen>
			<AuthHeading eyebrow="CRIAR CONTA">
				Leva <Accent>um minuto</Accent>
			</AuthHeading>
			{error ? (
				<FormAlert
					key={errorCount}
					action={
						error.offerSignIn ? (
							<TextLink href={loginHref} className="min-h-0">
								Entrar
							</TextLink>
						) : undefined
					}
				>
					{countdown.locked
						? `Muitas tentativas seguidas. Tente de novo em ${countdown.secondsLeft} segundos.`
						: error.text}
				</FormAlert>
			) : weakPasswordMessage ? (
				<FormAlert key={`weak-${form.formState.submitCount}`}>
					{weakPasswordMessage}
				</FormAlert>
			) : null}
			<form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
				<TextField
					id="sign-up-name"
					label="Nome completo"
					autoComplete="name"
					error={form.formState.errors.name?.message}
					{...form.register('name')}
				/>
				<TextField
					id="sign-up-email"
					label="E-mail"
					type="email"
					autoComplete="email"
					error={form.formState.errors.email?.message}
					{...form.register('email')}
				/>
				<PasswordField
					id="sign-up-password"
					label="Senha"
					autoComplete="new-password"
					aria-invalid={weakPasswordMessage ? true : undefined}
					{...form.register('password')}
				/>
				<PasswordStrengthMeter password={password} />
				<label className="flex cursor-pointer items-start gap-2.5 text-[13px] leading-normal text-ink-soft">
					<input
						type="checkbox"
						className="mt-0.5 size-[18px] shrink-0 accent-primary"
						{...form.register('terms')}
					/>
					<span>
						Li e aceito os{' '}
						<Link
							href={appRoutes.content.page('termos')}
							className="text-primary hover:text-primary-strong"
						>
							termos de uso
						</Link>{' '}
						e a{' '}
						<Link
							href={appRoutes.content.page('privacidade')}
							className="text-primary hover:text-primary-strong"
						>
							política de privacidade
						</Link>
						.
					</span>
				</label>
				<PrimaryButton
					type="submit"
					disabled={!termsAccepted || countdown.locked || signUp.isPending}
				>
					{countdown.locked
						? `Aguarde ${countdown.secondsLeft}s`
						: signUp.isPending
							? 'Criando conta…'
							: 'Criar conta'}
				</PrimaryButton>
			</form>
			<SwitchPrompt>
				Já tem conta?
				<TextLink href={loginHref}>Entrar</TextLink>
			</SwitchPrompt>
		</AuthScreen>
	);
}

export { SignUpPage };
