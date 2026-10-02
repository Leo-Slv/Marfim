'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

import { signOut } from '@/lib/auth/session-client';
import { useSession } from '@/lib/auth/use-session';
import { useIsHydrated } from '@/lib/hooks/use-is-hydrated';
import { appRoutes } from '@/lib/routes/app-routes';

import {
	useConfirmEmail,
	useRequestEmailConfirmation,
} from '../hooks/auth.queries';
import { useCountdown } from '../hooks/use-countdown';
import { authErrorCopy, hasErrorCode } from '../lib/auth-messages';
import { AuthLayout } from './auth-layout';
import {
	AuthHeading,
	AuthScreen,
	ButtonLink,
	PrimaryButton,
	StatusIcon,
	StatusNotice,
	TextAction,
	TextLink,
} from './auth-ui';

/**
 * `/confirmar-email` — with `?token=` (the backend e-mail's link) confirms
 * the address; without it, the "check your inbox" screen after sign-up.
 */
function ConfirmEmailPage() {
	return (
		<AuthLayout>
			<ConfirmEmailContent />
		</AuthLayout>
	);
}

function ConfirmEmailContent() {
	const token = useSearchParams().get('token');
	return token ? <ConfirmLink key={token} token={token} /> : <CheckYourInbox />;
}

/** 11 · E-mail confirmado / Esse link expirou. */
function ConfirmLink({ token }: { token: string }) {
	const router = useRouter();
	const session = useSession();
	const confirmation = useConfirmEmail(token);

	if (confirmation.isPending) {
		return (
			<AuthScreen>
				<AuthHeading eyebrow="CONFIRMANDO">Só um instante…</AuthHeading>
			</AuthScreen>
		);
	}

	if (confirmation.isSuccess) {
		return (
			<AuthScreen>
				<StatusIcon tone="success" />
				<AuthHeading description="Tudo certo. Agora você pode finalizar suas compras.">
					E-mail <span className="font-medium text-success">confirmado</span>
				</AuthHeading>
				<div className="flex flex-wrap gap-2.5">
					<ButtonLink variant="primary" href={appRoutes.cart.index}>
						Ir para a sacola
					</ButtonLink>
					<ButtonLink variant="secondary" href={appRoutes.system.home}>
						Continuar comprando
					</ButtonLink>
				</div>
			</AuthScreen>
		);
	}

	const expired = hasErrorCode(confirmation.error, 'invalid_or_expired_token');

	return (
		<AuthScreen>
			<StatusIcon tone="expired" />
			<AuthHeading
				description={
					expired
						? 'O link de confirmação vale 24 horas e só pode ser usado uma vez. Peça um novo e ele chega em instantes.'
						: authErrorCopy(confirmation.error).text
				}
			>
				{expired ? 'Esse link expirou' : 'Não deu para confirmar'}
			</AuthHeading>
			<PrimaryButton
				size="md"
				className="self-start"
				onClick={() =>
					router.push(
						session
							? appRoutes.auth.confirmEmail
							: appRoutes.auth.loginThen(appRoutes.auth.confirmEmail),
					)
				}
			>
				Enviar novo link
			</PrimaryButton>
		</AuthScreen>
	);
}

/** 10 · Confirme seu e-mail — needs a session to resend. */
function CheckYourInbox() {
	const router = useRouter();
	const hydrated = useIsHydrated();
	const session = useSession();
	const resend = useRequestEmailConfirmation();
	const countdown = useCountdown();

	useEffect(() => {
		if (hydrated && !session) {
			router.replace(appRoutes.auth.loginThen(appRoutes.auth.confirmEmail));
		}
	}, [hydrated, session, router]);

	const alreadyConfirmed =
		session?.emailConfirmed === true ||
		hasErrorCode(resend.error, 'email_already_confirmed');
	const limited = countdown.locked;

	function handleResend() {
		resend.mutate(undefined, {
			onError: (failure) => {
				const copy = authErrorCopy(failure);
				if (copy.lockSeconds) {
					countdown.start(copy.lockSeconds);
				}
			},
		});
	}

	async function useAnotherEmail() {
		// OrderCore can't change an account's e-mail: start a new account.
		await signOut().catch(() => undefined);
		router.push(appRoutes.auth.register);
	}

	return (
		<AuthScreen>
			<StatusIcon tone="mail" />
			<AuthHeading
				eyebrow="QUASE LÁ"
				description={
					<>
						Enviamos um link para{' '}
						<b className="font-medium">{session?.email ?? 'seu e-mail'}</b>. Ele
						vale por 24 horas. Você já pode navegar; para finalizar compras, a
						confirmação é necessária.
					</>
				}
			>
				Confirme seu e-mail
			</AuthHeading>
			{alreadyConfirmed ? (
				<StatusNotice tone="info">
					<span className="grow">Seu e-mail já está confirmado.</span>
					<TextLink href={appRoutes.cart.index} className="min-h-0">
						Ir para a sacola
					</TextLink>
				</StatusNotice>
			) : limited ? (
				<StatusNotice tone="warning">
					<span>
						Muitas tentativas. Você poderá pedir outro link em{' '}
						<b className="font-mono font-medium">{countdown.secondsLeft}s</b>.
					</span>
				</StatusNotice>
			) : resend.isSuccess ? (
				<StatusNotice tone="success">
					Link reenviado. Confira também a caixa de spam.
				</StatusNotice>
			) : resend.isError ? (
				<StatusNotice tone="warning">
					{authErrorCopy(resend.error).text}
				</StatusNotice>
			) : null}
			<div className="flex flex-wrap gap-2.5">
				<PrimaryButton
					size="md"
					onClick={handleResend}
					disabled={!session || limited || alreadyConfirmed || resend.isPending}
				>
					{resend.isPending ? 'Enviando…' : 'Reenviar link'}
				</PrimaryButton>
				<ButtonLink variant="secondary" href={appRoutes.system.home}>
					Continuar navegando
				</ButtonLink>
			</div>
			<div className="flex items-center gap-1 text-sm text-muted-foreground">
				E-mail errado?
				<TextAction onClick={useAnotherEmail}>Usar outro e-mail</TextAction>
			</div>
		</AuthScreen>
	);
}

export { ConfirmEmailPage };
