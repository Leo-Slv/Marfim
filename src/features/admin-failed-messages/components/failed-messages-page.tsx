'use client';

import { CheckIcon, WarningIcon } from '@phosphor-icons/react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';

import { Eyebrow } from '@/components/eyebrow';
import { notify } from '@/features/account/components/account-toast';
import { formatTimelineMoment } from '@/features/account/lib/account-format';
import { cn } from '@/lib/utils';

import {
	useFailedMessageCounts,
	useFailedMessageDetails,
	useFailedMessages,
	useFailureActions,
} from '../hooks/failed-messages.queries';
import {
	attemptsLabel,
	consequenceOf,
	failureErrorCopy,
	failureTabs,
	messageTitle,
	parseFailureTab,
	prettyBody,
} from '../lib/failed-messages';
import type { FailedMessage } from '../schemas/failed-messages.schema';

const REPLAYED_TOAST =
	'Mensagem reenviada — se falhar de novo, ela volta para esta lista.';

/** Admin · Mensagens com falha (AdminFalhas.dc.html). */
function FailedMessagesPage() {
	return (
		// The status tab lives in the URL (Suspense).
		<Suspense fallback={null}>
			<FailedMessagesContent />
		</Suspense>
	);
}

function FailedMessagesContent() {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const tab = parseFailureTab(searchParams.get('status'));
	const messages = useFailedMessages(tab);
	const counts = useFailedMessageCounts();
	const actions = useFailureActions();
	const [open, setOpen] = useState<string | null>(null);
	const pending = tab.status === 'Pending';
	const items = messages.data?.items;

	function pickTab(id: string) {
		const params = new URLSearchParams(searchParams);
		if (id === 'pendentes') {
			params.delete('status');
		} else {
			params.set('status', id);
		}
		const query = params.toString();
		router.replace(query ? `${pathname}?${query}` : pathname, {
			scroll: false,
		});
	}

	function replayAll() {
		if (!items?.length) {
			return;
		}
		actions.replayAll.mutate(
			items.map((message) => message.id),
			{
				onSuccess: ({ replayed, failed }) =>
					notify(
						failed > 0
							? `${replayed} reenviadas · ${failed} não puderam ser reenviadas`
							: `${replayed} ${replayed === 1 ? 'mensagem reenviada' : 'mensagens reenviadas'}`,
					),
			},
		);
	}

	return (
		<div className="flex flex-col gap-4 px-5 py-7 min-[980px]:px-8">
			<div className="flex flex-wrap items-end gap-4">
				<div className="flex grow flex-col gap-1">
					<Eyebrow className="tracking-[0.16em]">SISTEMA</Eyebrow>
					<h1 className="text-[34px] font-light tracking-[-0.025em]">
						Mensagens com falha
					</h1>
				</div>
				{pending && items && items.length > 0 ? (
					<button
						type="button"
						onClick={replayAll}
						disabled={actions.replayAll.isPending}
						className="h-10 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-strong disabled:opacity-55"
					>
						{actions.replayAll.isPending
							? 'Reprocessando…'
							: 'Reprocessar todas'}
					</button>
				) : null}
			</div>
			<p className="max-w-[720px] text-sm text-muted-foreground">
				Eventos entre serviços que esgotaram as tentativas automáticas.
				Reprocessar envia de novo; descartar remove da fila e fica registrado na
				auditoria.
			</p>

			<div
				role="tablist"
				aria-label="Status"
				className="flex flex-wrap gap-1.5"
			>
				{failureTabs.map((option) => {
					const selected = option.id === tab.id;
					return (
						<button
							key={option.id}
							type="button"
							role="tab"
							aria-selected={selected}
							onClick={() => pickTab(option.id)}
							className={cn(
								'flex h-9 items-center gap-2 rounded-full px-3 text-[13px] font-medium transition-colors',
								selected
									? 'bg-foreground text-white'
									: 'bg-card text-ink-soft hover:bg-surface-2',
							)}
						>
							{option.label}
							<span className="font-mono text-[11px] opacity-75">
								{counts.data?.[option.id] ?? '·'}
							</span>
						</button>
					);
				})}
			</div>

			{messages.isError && !messages.data ? (
				<div
					role="alert"
					className="flex flex-col items-center gap-2 rounded-2xl border bg-card p-10 text-sm text-ink-soft"
				>
					Não foi possível carregar as mensagens.
					<button
						type="button"
						onClick={() => void messages.refetch()}
						className="font-medium text-primary hover:text-primary-strong"
					>
						Tentar de novo
					</button>
				</div>
			) : !items ? (
				<div className="flex flex-col gap-3">
					<div className="skeleton h-[70px] rounded-2xl" />
					<div className="skeleton h-[70px] rounded-2xl" />
				</div>
			) : items.length === 0 ? (
				pending ? (
					<div className="flex animate-up flex-col items-center gap-3 rounded-[20px] border bg-card p-14 text-center">
						<span className="flex size-16 animate-floaty items-center justify-center rounded-full bg-success-soft">
							<CheckIcon size={30} weight="bold" className="text-success" />
						</span>
						<span className="text-2xl font-light">Fila limpa</span>
						<span className="text-sm text-muted-foreground">
							Nenhuma mensagem com falha agora.
						</span>
					</div>
				) : (
					<p className="rounded-2xl border bg-card p-10 text-center text-sm text-muted-foreground">
						Nenhuma mensagem aqui.
					</p>
				)
			) : (
				items.map((message) => (
					<MessageCard
						key={message.id}
						message={message}
						open={open === message.id}
						onToggle={() => setOpen(open === message.id ? null : message.id)}
						actions={actions}
						bulkBusy={actions.replayAll.isPending}
					/>
				))
			)}
		</div>
	);
}

function MessageCard({
	message,
	open,
	onToggle,
	actions,
	bulkBusy,
}: {
	message: FailedMessage;
	open: boolean;
	onToggle: () => void;
	actions: ReturnType<typeof useFailureActions>;
	bulkBusy: boolean;
}) {
	const details = useFailedMessageDetails(message.id, open);
	const [asking, setAsking] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const replaying =
		(actions.replay.isPending && actions.replay.variables === message.id) ||
		bulkBusy;
	const discarding =
		actions.discard.isPending && actions.discard.variables === message.id;
	const pending = message.status === 'Pending';

	function replay() {
		setError(null);
		setAsking(false);
		actions.replay.mutate(message.id, {
			onSuccess: () => notify(REPLAYED_TOAST),
			onError: (failure) => setError(failureErrorCopy(failure)),
		});
	}

	function discard() {
		setError(null);
		actions.discard.mutate(message.id, {
			onSuccess: () => notify('Mensagem descartada'),
			onError: (failure) => setError(failureErrorCopy(failure)),
		});
	}

	return (
		<article className="animate-up overflow-hidden rounded-2xl border bg-card">
			<div className="flex flex-wrap items-center gap-4 px-5 py-4">
				<span className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-clay-soft">
					<WarningIcon size={18} className="text-clay" />
				</span>
				<span className="flex min-w-0 grow basis-[280px] flex-col gap-0.5">
					<span className="text-sm font-medium">
						{messageTitle(message.type, message.consumer)}
					</span>
					<span className="truncate font-mono text-[11px] text-muted-foreground">
						{message.type} · {message.consumer}
					</span>
					<span className="line-clamp-2 text-[13px] text-ink-soft">
						{message.lastError}
					</span>
				</span>
				<span className="text-right font-mono text-[11px] text-muted-foreground">
					{attemptsLabel(message.attempts)}
					<br />
					{formatTimelineMoment(message.resolvedAt ?? message.lastFailedAt)}
				</span>
				<span className="flex items-center gap-2">
					<button
						type="button"
						onClick={onToggle}
						aria-expanded={open}
						className="h-9 rounded-[10px] border bg-card px-3 text-[13px] transition-colors hover:bg-surface-2"
					>
						{open ? 'Ocultar' : 'Detalhes'}
					</button>
					{pending ? (
						replaying ? (
							<span className="flex w-[124px] items-center gap-1.5 text-[13px] text-primary">
								<svg
									width="14"
									height="14"
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
								Reprocessando
							</span>
						) : (
							<>
								<button
									type="button"
									onClick={replay}
									disabled={discarding}
									className="h-9 rounded-[10px] bg-primary px-3.5 text-[13px] font-medium text-primary-foreground transition-colors hover:bg-primary-strong disabled:opacity-55"
								>
									Reprocessar
								</button>
								<button
									type="button"
									onClick={() => setAsking(true)}
									className="h-9 rounded-[10px] px-2.5 text-[13px] font-medium text-clay hover:bg-clay-soft"
								>
									Descartar
								</button>
							</>
						)
					) : (
						<span
							className={cn(
								'inline-flex h-6 items-center rounded-full px-2.5 text-xs font-medium',
								message.status === 'Replayed'
									? 'bg-primary-soft text-primary'
									: 'bg-surface text-ink-soft',
							)}
						>
							{message.status === 'Replayed' ? 'Reenviada' : 'Descartada'}
						</span>
					)}
				</span>
			</div>

			{asking && pending && !replaying ? (
				<div className="mx-5 mb-4 flex animate-pop-in flex-wrap items-center gap-2.5 rounded-xl bg-clay-soft px-3.5 py-3 text-[13px]">
					<span className="grow">
						Descartar esta mensagem? {consequenceOf(message.consumer)}
					</span>
					<button
						type="button"
						onClick={discard}
						disabled={discarding}
						className="h-[34px] rounded-[9px] bg-clay px-3 text-[13px] font-medium text-white disabled:opacity-55"
					>
						{discarding ? 'Descartando…' : 'Descartar'}
					</button>
					<button
						type="button"
						onClick={() => setAsking(false)}
						className="h-[34px] rounded-[9px] border bg-card px-3 text-[13px]"
					>
						Manter
					</button>
				</div>
			) : null}

			{error ? (
				<p role="alert" className="mx-5 mb-4 text-[13px] text-clay">
					{error}
				</p>
			) : null}

			{open ? (
				<div className="grid animate-up grid-cols-1 gap-3 px-5 pb-[18px] min-[980px]:grid-cols-2">
					{details.isPending ? (
						<div className="skeleton h-40 rounded-[10px] min-[980px]:col-span-2" />
					) : details.isError ? (
						<p className="text-[13px] text-clay min-[980px]:col-span-2">
							Não foi possível carregar os detalhes.
						</p>
					) : (
						<>
							<pre className="m-0 max-h-[360px] overflow-auto rounded-[10px] bg-background px-3.5 py-3 font-mono text-xs leading-relaxed break-all whitespace-pre-wrap">
								{prettyBody(details.data.body)}
							</pre>
							<pre className="m-0 max-h-[360px] overflow-auto rounded-[10px] bg-foreground px-3.5 py-3 font-mono text-xs leading-relaxed break-words whitespace-pre-wrap text-[#E6E4DE]">
								{details.data.lastError}
								{'\n\n'}
								{`mensagem: ${details.data.messageId}\nprimeira falha: ${formatTimelineMoment(details.data.firstFailedAt)}`}
								{details.data.traceParent
									? `\ntraceparent: ${details.data.traceParent}`
									: ''}
							</pre>
						</>
					)}
				</div>
			) : null}
		</article>
	);
}

export { FailedMessagesPage };
