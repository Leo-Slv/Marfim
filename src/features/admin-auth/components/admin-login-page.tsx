'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { LockSimpleIcon } from '@phosphor-icons/react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import {
	ButtonLink,
	FormAlert,
	PrimaryButton,
	StatusIcon,
	StatusNotice,
	TextField,
} from '@/features/auth/components/auth-ui';
import { useCountdown } from '@/features/auth/hooks/use-countdown';
import { Eyebrow } from '@/components/eyebrow';
import { wasSessionExpired } from '@/lib/auth/session-store';
import { useSession } from '@/lib/auth/use-session';
import { useIsHydrated } from '@/lib/hooks/use-is-hydrated';
import { appRoutes } from '@/lib/routes/app-routes';

import { useAdminSignIn } from '../hooks/admin-auth.queries';
import {
	adminDestination,
	adminLoginErrorCopy,
	adminSection,
	isNotAdmin,
} from '../lib/admin-login';
import {
	adminLoginFormSchema,
	type AdminLoginForm,
} from '../schemas/admin-login.schema';
import { AdminBrandPanel, AdminWordmark } from './admin-brand';

/** How long "Bem-vindo de volta" shows before going on. */
const WELCOME_REDIRECT_MS = 1200;

/** Admin · Entrar (AdminLogin.dc.html). */
function AdminLoginPage() {
	return (
		<div className="grid min-h-screen min-w-[360px] bg-background min-[980px]:grid-cols-2">
			<AdminBrandPanel />
			<main className="flex flex-col items-center justify-center gap-10 px-5 py-12 min-[980px]:p-12">
				<div className="w-full max-w-[400px] min-[980px]:hidden">
					<AdminWordmark tone="light" />
				</div>
				{/* Reads ?next=, so it sits inside Suspense. */}
				<Suspense fallback={<div className="h-[460px] w-full max-w-[400px]" />}>
					<AdminLoginContent />
				</Suspense>
			</main>
		</div>
	);
}

function AdminLoginContent() {
	const router = useRouter();
	const destination = adminDestination(useSearchParams().get('next'));
	const section = adminSection(destination);
	const hydrated = useIsHydrated();
	const session = useSession();
	const signIn = useAdminSignIn();
	const countdown = useCountdown();
	const [errorCount, setErrorCount] = useState(0);

	const form = useForm<AdminLoginForm>({
		resolver: zodResolver(adminLoginFormSchema),
		defaultValues: { email: '', password: '', keepSignedIn: true },
	});

	// Already an admin: straight on (only before a submit — the mutation
	// stores the session a render before it reports success).
	const alreadyAdmin = hydrated && session?.role === 'Admin' && signIn.isIdle;
	useEffect(() => {
		if (alreadyAdmin) {
			router.replace(destination);
		}
	}, [alreadyAdmin, destination, router]);

	useEffect(() => {
		if (!signIn.isSuccess) {
			return;
		}
		const timer = setTimeout(
			() => router.replace(destination),
			WELCOME_REDIRECT_MS,
		);
		return () => clearTimeout(timer);
	}, [signIn.isSuccess, destination, router]);

	if (signIn.isSuccess) {
		return (
			<Step key="welcome">
				<StatusIcon tone="success" />
				<h1 className="text-[34px] font-light tracking-[-0.03em]">
					Bem-vindo de volta
				</h1>
				<ButtonLink variant="primary" href={destination} className="self-start">
					{destination === appRoutes.admin.index
						? 'Abrir o dashboard'
						: `Voltar ${section.preposition} ${section.label}`}
				</ButtonLink>
			</Step>
		);
	}

	if (isNotAdmin(signIn.error)) {
		return (
			<Step key="denied">
				<span className="flex size-16 items-center justify-center rounded-[18px] bg-clay-soft">
					<LockSimpleIcon size={28} className="text-clay" />
				</span>
				<h1 className="text-[34px] font-light tracking-[-0.03em]">
					Sem acesso ao painel
				</h1>
				<p className="text-[15px] leading-[1.6] text-ink-soft">
					A conta{' '}
					<b className="font-medium break-all text-foreground">
						{signIn.variables?.email}
					</b>{' '}
					existe, mas não tem permissão de administrador. Peça acesso a quem
					gerencia a loja.
				</p>
				<div className="flex flex-wrap gap-2.5">
					<PrimaryButton
						type="button"
						size="md"
						onClick={() => {
							signIn.reset();
							form.setValue('password', '');
						}}
					>
						Usar outra conta
					</PrimaryButton>
					<ButtonLink variant="secondary" href={appRoutes.system.home}>
						Ir para a loja
					</ButtonLink>
				</div>
			</Step>
		);
	}

	const error = signIn.error ? adminLoginErrorCopy(signIn.error) : null;
	const expired =
		hydrated && session === null && !signIn.error && wasSessionExpired();

	const onSubmit = form.handleSubmit((values) => {
		signIn.mutate(values, {
			onError: (failure) => {
				setErrorCount((count) => count + 1);
				const copy = adminLoginErrorCopy(failure);
				if (copy.lockSeconds) {
					countdown.start(copy.lockSeconds);
				}
			},
		});
	});

	return (
		<Step key="form">
			<div className="flex flex-col gap-2">
				<Eyebrow>PAINEL DE ADMINISTRAÇÃO</Eyebrow>
				<h1 className="text-4xl font-light tracking-[-0.03em]">
					Entrar no painel
				</h1>
			</div>
			{expired ? (
				<StatusNotice tone="info">
					<span>
						Sua sessão terminou. Entre de novo para voltar {section.preposition}{' '}
						<b className="font-medium">{section.label}</b>.
					</span>
				</StatusNotice>
			) : null}
			{error ? (
				<FormAlert key={errorCount}>
					{error.lockSeconds !== undefined
						? countdown.locked
							? `Muitas tentativas. Tente de novo em ${countdown.secondsLeft} segundos.`
							: 'Muitas tentativas. Já pode tentar de novo.'
						: error.text}
				</FormAlert>
			) : null}
			<form onSubmit={onSubmit} noValidate className="flex flex-col gap-3.5">
				<TextField
					id="admin-email"
					label="E-mail"
					type="email"
					autoComplete="username"
					error={form.formState.errors.email?.message}
					{...form.register('email')}
				/>
				<TextField
					id="admin-password"
					label="Senha"
					type="password"
					autoComplete="current-password"
					error={form.formState.errors.password?.message}
					{...form.register('password')}
				/>
				<label className="flex cursor-pointer items-center gap-2.5 text-sm text-ink-soft">
					<input
						type="checkbox"
						className="m-0 size-[18px] accent-primary"
						{...form.register('keepSignedIn')}
					/>
					Manter conectado neste computador
				</label>
				<PrimaryButton
					type="submit"
					className="gap-2.5"
					disabled={countdown.locked || signIn.isPending}
				>
					{signIn.isPending ? <Spinner /> : null}
					{countdown.locked
						? `Aguarde ${countdown.secondsLeft}s`
						: signIn.isPending
							? 'Entrando…'
							: 'Entrar'}
				</PrimaryButton>
			</form>
			<div className="flex justify-between border-t pt-1.5 text-sm">
				<Link
					href={appRoutes.auth.forgotPassword}
					className="flex min-h-10 items-center font-medium text-primary hover:text-primary-strong"
				>
					Esqueci minha senha
				</Link>
				<Link
					href={appRoutes.system.home}
					className="flex min-h-10 items-center text-muted-foreground hover:text-foreground"
				>
					Ir para a loja
				</Link>
			</div>
		</Step>
	);
}

/** One screen of the form column; remounting it replays the fade-up. */
function Step({ children }: { children: React.ReactNode }) {
	return (
		<div className="flex w-full max-w-[400px] animate-up flex-col gap-5 [animation-duration:.6s]">
			{children}
		</div>
	);
}

function Spinner() {
	return (
		<svg
			width="16"
			height="16"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2.4"
			strokeLinecap="round"
			aria-hidden="true"
			className="animate-spin-fast"
		>
			<path d="M21 12a9 9 0 1 1-6.2-8.6" />
		</svg>
	);
}

export { AdminLoginPage };
