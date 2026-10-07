'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef, useState } from 'react';

import { Eyebrow } from '@/components/eyebrow';
import { ProductArt } from '@/features/catalog/components/product-art';
import type { ProductArtKind } from '@/features/catalog/lib/product-visuals';
import { appRoutes } from '@/lib/routes/app-routes';
import { cn } from '@/lib/utils';

import type { ErrorKind } from '../lib/error-kind';
import { sessionDestinationLabel } from '../lib/session-destination';

/** Countdown when a 429's `Retry-After` can't be read (pendency #1). */
const DEFAULT_RETRY_AFTER_SECONDS = 30;
const RING_LENGTH = 327;

const primaryButton =
	'flex h-[52px] w-full items-center justify-center rounded-xl bg-primary px-[22px] text-base font-medium text-primary-foreground transition min-[980px]:h-12 min-[980px]:w-auto min-[980px]:text-[15px] hover:-translate-y-px hover:bg-primary-strong disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:translate-y-0 disabled:hover:bg-primary';
const secondaryButton =
	'flex h-[50px] w-full items-center justify-center rounded-xl border bg-card px-5 text-[15px] font-medium transition-colors hover:bg-surface-2 min-[980px]:h-12 min-[980px]:w-auto';

type ErrorStateProps = {
	kind: ErrorKind;
	/** Shown on the 500 for the support team (hidden when null). */
	traceCode?: string | null;
	retryAfterSeconds?: number | null;
	/** "Tentar de novo"; reloads the page when not given. */
	onRetry?: () => void;
};

/**
 * The error screens of Erro.dc.html — 404, 500, 429 and Sessão expirada —
 * plus 403 and "sem conexão" in the same layouts. Centred; the caller adds
 * the store chrome around it.
 */
function ErrorState({
	kind,
	traceCode = null,
	retryAfterSeconds = null,
	onRetry,
}: ErrorStateProps) {
	const retry = onRetry ?? (() => window.location.reload());

	return (
		<section className="flex grow flex-col px-5 pt-9 pb-10 min-[980px]:px-10 min-[980px]:pt-[72px] min-[980px]:pb-24">
			<div className="mx-auto flex w-full max-w-[1280px] flex-col items-center gap-5 text-center">
				{kind === 'not-found' ? <NotFound /> : null}
				{kind === 'forbidden' ? <Forbidden /> : null}
				{kind === 'server' ? (
					<ServerError traceCode={traceCode} onRetry={retry} />
				) : null}
				{kind === 'offline' ? <Offline onRetry={retry} /> : null}
				{kind === 'rate-limited' ? (
					<RateLimited
						seconds={retryAfterSeconds ?? DEFAULT_RETRY_AFTER_SECONDS}
						onRetry={retry}
					/>
				) : null}
				{kind === 'session-expired' ? (
					<Suspense fallback={null}>
						<SessionExpired />
					</Suspense>
				) : null}
			</div>
		</section>
	);
}

function Heading({ children }: { children: React.ReactNode }) {
	return (
		<h1 className="m-0 animate-up text-[34px] font-light tracking-[-0.03em] [animation-delay:.08s] min-[980px]:text-[40px]">
			{children}
		</h1>
	);
}

function Lead({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<p
			className={cn(
				'm-0 max-w-[460px] animate-up text-base text-muted-foreground [animation-delay:.16s]',
				className,
			)}
		>
			{children}
		</p>
	);
}

function Label({ children }: { children: React.ReactNode }) {
	return (
		<Eyebrow className="animate-up [animation-delay:.08s]">{children}</Eyebrow>
	);
}

function Actions({ children }: { children: React.ReactNode }) {
	return (
		<div className="flex w-full animate-up flex-col gap-2.5 pt-1 [animation-delay:.24s] min-[980px]:w-auto min-[980px]:flex-row min-[980px]:flex-wrap min-[980px]:justify-center">
			{children}
		</div>
	);
}

/** "4 [peça flutuando] 4" — the 404 and, with a 3, the 403. */
function BigCode({ last, art }: { last: string; art: ProductArtKind }) {
	const digit =
		'text-[120px] leading-[0.9] font-light tracking-[-0.06em] min-[980px]:text-[220px]';
	return (
		<div
			className="relative flex animate-up items-center justify-center"
			aria-hidden="true"
		>
			<span className={digit}>4</span>
			<span className="mx-2 inline-flex size-[110px] animate-float-tilt items-center justify-center rounded-full bg-primary-soft min-[980px]:size-[180px]">
				<ProductArt kind={art} size={110} className="h-auto w-[60%]" />
			</span>
			<span className={digit}>{last}</span>
		</div>
	);
}

function NotFound() {
	return (
		<>
			<BigCode last="4" art="vase" />
			<Label>PÁGINA NÃO ENCONTRADA</Label>
			<Heading>Esta página saiu da prateleira</Heading>
			<Lead>
				O endereço pode estar errado ou a página foi removida. As peças
				continuam todas aqui.
			</Lead>
			<Actions>
				<Link href={appRoutes.system.home} className={primaryButton}>
					Voltar ao início
				</Link>
				<Link href={appRoutes.products.search()} className={secondaryButton}>
					Buscar produtos
				</Link>
			</Actions>
		</>
	);
}

function Forbidden() {
	return (
		<>
			<BigCode last="3" art="jar" />
			<Label>ACESSO NEGADO · 403</Label>
			<Heading>Esta área não é para a sua conta</Heading>
			<Lead>
				Você está conectado com uma conta que não pode ver esta página. Se acha
				que é um engano, fale com o atendimento.
			</Lead>
			<Actions>
				<Link href={appRoutes.system.home} className={primaryButton}>
					Voltar ao início
				</Link>
				<Link href={appRoutes.account.index} className={secondaryButton}>
					Minha conta
				</Link>
			</Actions>
		</>
	);
}

/** Pendant swinging inside a slowly turning dotted ring. */
function SwingingPendant() {
	return (
		<div
			className="relative flex size-40 animate-up items-center justify-center"
			aria-hidden="true"
		>
			<svg
				width="160"
				height="160"
				viewBox="0 0 160 160"
				fill="none"
				className="absolute inset-0 animate-spin-slow"
			>
				<circle cx="80" cy="80" r="74" stroke="#E6E4DE" strokeDasharray="3 8" />
				<circle cx="80" cy="6" r="5" fill="#E8793A" />
			</svg>
			<span className="flex origin-top animate-wobble">
				<ProductArt kind="pendant" size={96} />
			</span>
		</div>
	);
}

function ServerError({
	traceCode,
	onRetry,
}: {
	traceCode: string | null;
	onRetry: () => void;
}) {
	return (
		<>
			<SwingingPendant />
			<Label>ERRO INESPERADO · 500</Label>
			<Heading>Algo deu errado do nosso lado</Heading>
			<Lead className="max-w-[480px]">
				Não foi nada que você fez. Tente de novo em instantes. Se continuar,
				fale com o atendimento
				{traceCode ? ' e informe o código abaixo' : ''}.
			</Lead>
			{traceCode ? <TraceCode code={traceCode} /> : null}
			<Actions>
				<button type="button" onClick={onRetry} className={primaryButton}>
					Tentar de novo
				</button>
				<Link href={appRoutes.system.home} className={secondaryButton}>
					Voltar ao início
				</Link>
			</Actions>
		</>
	);
}

function TraceCode({ code }: { code: string }) {
	const [copied, setCopied] = useState(false);
	const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(
		() => () => {
			if (timer.current) {
				clearTimeout(timer.current);
			}
		},
		[],
	);

	function handleCopy() {
		void navigator.clipboard?.writeText(code).catch(() => undefined);
		setCopied(true);
		if (timer.current) {
			clearTimeout(timer.current);
		}
		timer.current = setTimeout(() => setCopied(false), 2000);
	}

	return (
		<div className="flex max-w-full animate-up items-center gap-2 rounded-[14px] border bg-card py-1.5 pr-1.5 pl-4 [animation-delay:.16s]">
			<span className="font-mono text-[11px] tracking-[0.12em] text-muted-foreground">
				CÓDIGO
			</span>
			<code className="min-w-0 truncate font-mono text-sm">{code}</code>
			<button
				type="button"
				onClick={handleCopy}
				className={cn(
					'h-9 shrink-0 rounded-[10px] border bg-card px-3 text-[13px] font-medium transition-colors hover:bg-surface-2',
					copied && 'text-success',
				)}
			>
				<span aria-live="polite">{copied ? 'Copiado' : 'Copiar'}</span>
			</button>
		</div>
	);
}

function Offline({ onRetry }: { onRetry: () => void }) {
	return (
		<>
			<SwingingPendant />
			<Label>SEM CONEXÃO</Label>
			<Heading>Não conseguimos falar com a loja</Heading>
			<Lead className="max-w-[480px]">
				Pode ser a sua internet ou a loja fora do ar por alguns instantes.
				Confira a conexão e tente de novo.
			</Lead>
			<Actions>
				<button type="button" onClick={onRetry} className={primaryButton}>
					Tentar de novo
				</button>
				<Link href={appRoutes.system.home} className={secondaryButton}>
					Voltar ao início
				</Link>
			</Actions>
		</>
	);
}

function RateLimited({
	seconds,
	onRetry,
}: {
	seconds: number;
	onRetry: () => void;
}) {
	const total = Math.max(1, seconds);
	const [left, setLeft] = useState(total);

	useEffect(() => {
		const id = setInterval(() => {
			setLeft((current) => Math.max(0, current - 1));
		}, 1000);
		return () => clearInterval(id);
	}, []);

	const waiting = left > 0;

	return (
		<>
			<div className="relative size-[140px] animate-up">
				<svg
					width="140"
					height="140"
					viewBox="0 0 120 120"
					fill="none"
					className="-rotate-90"
					aria-hidden="true"
				>
					<circle cx="60" cy="60" r="52" stroke="#ECECFD" strokeWidth="6" />
					<circle
						cx="60"
						cy="60"
						r="52"
						stroke={waiting ? '#3B3FD9' : '#15803D'}
						strokeWidth="6"
						strokeLinecap="round"
						strokeDasharray={RING_LENGTH}
						strokeDashoffset={Math.round(RING_LENGTH * (1 - left / total))}
						className="transition-[stroke-dashoffset] duration-1000 ease-linear"
					/>
				</svg>
				<span className="absolute inset-0 flex flex-col items-center justify-center">
					<span className="text-[44px] leading-none font-light tracking-[-0.03em]">
						{left}
					</span>
					<span className="font-mono text-[10px] tracking-[0.14em] text-muted-foreground">
						SEGUNDOS
					</span>
				</span>
			</div>
			<Label>MUITAS TENTATIVAS · 429</Label>
			<Heading>Vamos com calma</Heading>
			<Lead>
				Recebemos muitas tentativas seguidas deste aparelho. Por segurança,
				espere a contagem terminar para tentar de novo.
			</Lead>
			<div className="animate-up [animation-delay:.24s]">
				<button
					type="button"
					onClick={onRetry}
					disabled={waiting}
					className={primaryButton}
				>
					{waiting ? `Tentar de novo em ${left}s` : 'Tentar de novo'}
				</button>
			</div>
		</>
	);
}

/** Reads the current URL (callers sit inside Suspense) to come back here. */
function SessionExpired() {
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const query = searchParams.toString();
	const next = query ? `${pathname}?${query}` : pathname;

	return (
		<div className="flex w-full max-w-[520px] animate-up flex-col items-center gap-4 rounded-3xl border bg-card px-9 py-10">
			<span className="flex size-[72px] items-center justify-center rounded-[20px] bg-primary-soft">
				<svg
					width="32"
					height="32"
					viewBox="0 0 24 24"
					fill="none"
					stroke="#3B3FD9"
					strokeWidth="1.6"
					strokeLinecap="round"
					strokeLinejoin="round"
					aria-hidden="true"
				>
					<path d="M5 11h14v10H5zM8 11V8a4 4 0 0 1 8 0v3" />
					<path d="M12 15v2" />
				</svg>
			</span>
			<Eyebrow>SESSÃO EXPIRADA</Eyebrow>
			<h1 className="m-0 text-[34px] font-light tracking-[-0.03em]">
				Entre de novo para continuar
			</h1>
			<p className="m-0 text-[15px] leading-[1.55] text-muted-foreground">
				Por segurança, sua sessão terminou. Depois de entrar, você volta direto
				para{' '}
				<b className="font-medium text-foreground">
					{sessionDestinationLabel(pathname)}
				</b>
				. Sua sacola continua salva.
			</p>
			<Link
				href={appRoutes.auth.loginThen(next)}
				className={cn(primaryButton, 'h-[52px] w-full text-base')}
			>
				Entrar
			</Link>
			<Link
				href={appRoutes.system.home}
				className="text-sm font-medium text-primary hover:text-primary-strong"
			>
				Continuar sem entrar
			</Link>
		</div>
	);
}

export { ErrorState };
