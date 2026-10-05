'use client';

import {
	CaretLeftIcon,
	CaretRightIcon,
	CaretRightIcon as ChevronIcon,
	MagnifyingGlassIcon,
	XIcon,
} from '@phosphor-icons/react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';

import { ComingSoonBadge } from '@/components/coming-soon-badge';
import { Eyebrow } from '@/components/eyebrow';
import { formatTimelineMoment } from '@/features/account/lib/account-format';
import { parsePage } from '@/features/admin-orders/lib/order-tabs';
import { useSession } from '@/lib/auth/use-session';
import { cn } from '@/lib/utils';

import { useAuditActors, useAuditLogs } from '../hooks/admin-audit.queries';
import {
	actionLabel,
	actorOf,
	auditDetails,
	auditLinks,
	entityLabel,
	entityTabs,
	isUuid,
	parseEntityTab,
	shortId,
	type Actor,
} from '../lib/audit';
import type { AuditLog } from '../schemas/admin-audit.schema';

const columns =
	'grid grid-cols-[124px_160px_minmax(0,1fr)_104px_84px_20px] items-center gap-3 min-[1440px]:grid-cols-[150px_180px_minmax(0,1fr)_120px_100px_24px]';

const dotClass = {
	admin: 'bg-primary',
	customer: 'bg-success',
	system: 'bg-muted-foreground',
} as const;

/** Admin · Auditoria (AdminAuditoria.dc.html). */
function AuditPage() {
	return (
		// Tab, search, user filter and page live in the URL (Suspense).
		<Suspense fallback={null}>
			<AuditContent />
		</Suspense>
	);
}

function AuditContent() {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const session = useSession();
	const tab = parseEntityTab(searchParams.get('entidade'));
	const id = searchParams.get('id');
	const userId = searchParams.get('usuario');
	const page = parsePage(searchParams.get('pagina'));

	const [term, setTerm] = useState(id ?? '');
	const [termHint, setTermHint] = useState(false);
	const [open, setOpen] = useState<string | null>(null);
	const logs = useAuditLogs(tab, id, userId, page);
	const userIds = [
		...new Set(
			(logs.data?.items ?? [])
				.map((log) => log.userId)
				.filter((value): value is string => value !== null)
				.concat(userId ? [userId] : []),
		),
	];
	const actors = useAuditActors(userIds);
	const actor = (value: string | null) =>
		actorOf(value, session?.userId ?? null, value ? actors[value] : undefined);

	function update(changes: Record<string, string | null>) {
		const params = new URLSearchParams(searchParams);
		for (const [key, value] of Object.entries(changes)) {
			if (value === null) {
				params.delete(key);
			} else {
				params.set(key, value);
			}
		}
		if (!('pagina' in changes)) {
			params.delete('pagina');
		}
		const query = params.toString();
		router.replace(query ? `${pathname}?${query}` : pathname, {
			scroll: false,
		});
	}

	function handleSearch(event: React.FormEvent) {
		event.preventDefault();
		const value = term.trim();
		if (!value) {
			setTermHint(false);
			update({ id: null });
			return;
		}
		if (!isUuid(value)) {
			setTermHint(true);
			return;
		}
		setTermHint(false);
		update({ id: value.toLowerCase() });
	}

	const items = logs.data?.items;
	const totalPages = logs.data?.totalPages ?? 1;

	return (
		<div className="flex flex-col gap-4 px-5 py-7 min-[980px]:px-8">
			<div className="flex flex-wrap items-end gap-4">
				<div className="flex grow flex-col gap-1">
					<Eyebrow className="tracking-[0.16em]">SISTEMA</Eyebrow>
					<h1 className="text-[34px] font-light tracking-[-0.025em]">
						Auditoria
					</h1>
				</div>
				<form onSubmit={handleSearch} className="flex flex-col gap-1">
					<label className="flex h-10 w-full items-center gap-2 rounded-xl border bg-card px-3 text-muted-foreground focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary min-[720px]:w-[300px]">
						<MagnifyingGlassIcon size={16} />
						<input
							type="search"
							aria-label="Buscar no registro por ID"
							placeholder="ID completo (pedido, cliente, usuário…)"
							value={term}
							onChange={(event) => {
								setTerm(event.target.value);
								setTermHint(false);
							}}
							className="w-full bg-transparent font-mono text-xs text-foreground outline-none"
						/>
					</label>
					{termHint ? (
						<span
							role="status"
							className="flex items-center gap-1.5 text-xs text-muted-foreground"
						>
							Cole um ID completo. Busca por texto
							<ComingSoonBadge />
						</span>
					) : null}
				</form>
			</div>

			<div className="flex flex-wrap items-center gap-1.5">
				{entityTabs.map((option) => {
					const selected = option.id === tab.id;
					return (
						<button
							key={option.id}
							type="button"
							aria-pressed={selected}
							onClick={() =>
								update({ entidade: option.id === 'todos' ? null : option.id })
							}
							className={cn(
								'h-[34px] rounded-full px-3 text-[13px] font-medium transition-colors',
								selected
									? 'bg-foreground text-white'
									: 'bg-card text-ink-soft hover:bg-surface-2',
							)}
						>
							{option.label}
						</button>
					);
				})}
				{userId || id ? (
					<span className="flex items-center gap-2 pl-2 text-[13px] text-ink-soft">
						{userId ? (
							<FilterChip
								label={`Usuário: ${actor(userId).name}`}
								onClear={() => update({ usuario: null })}
							/>
						) : null}
						{id ? (
							<FilterChip
								label={`${logs.data?.matchedAs === 'user' ? 'Usuário' : 'ID'}: ${shortId(id)}`}
								onClear={() => {
									setTerm('');
									update({ id: null });
								}}
							/>
						) : null}
					</span>
				) : null}
			</div>

			<div className="overflow-hidden rounded-2xl border bg-card">
				<div className="overflow-x-auto">
					<div className="min-w-[700px]">
						<div
							className={cn(
								columns,
								'bg-surface px-[18px] py-2.5 font-mono text-[10px] tracking-[0.12em] text-muted-foreground',
							)}
						>
							<span>QUANDO</span>
							<span>QUEM</span>
							<span>AÇÃO</span>
							<span>ENTIDADE</span>
							<span>ID</span>
							<span />
						</div>
						{logs.isError && !logs.data ? (
							<div
								role="alert"
								className="flex flex-col items-center gap-2 border-t p-10 text-sm text-ink-soft"
							>
								Não foi possível carregar o registro.
								<button
									type="button"
									onClick={() => void logs.refetch()}
									className="font-medium text-primary hover:text-primary-strong"
								>
									Tentar de novo
								</button>
							</div>
						) : !items ? (
							<div className="flex flex-col gap-2 border-t p-[18px]">
								{[0, 1, 2, 3, 4, 5].map((index) => (
									<div key={index} className="skeleton h-10 rounded-lg" />
								))}
							</div>
						) : items.length === 0 ? (
							<p className="border-t p-10 text-center text-sm text-muted-foreground">
								Nada encontrado.
							</p>
						) : (
							<div
								className={cn(
									logs.isPlaceholderData && 'opacity-60 transition-opacity',
								)}
							>
								{items.map((log) => (
									<AuditRow
										key={log.id}
										log={log}
										actor={actor(log.userId)}
										open={open === log.id}
										onToggle={() => setOpen(open === log.id ? null : log.id)}
										onUser={() =>
											log.userId ? update({ usuario: log.userId }) : undefined
										}
									/>
								))}
							</div>
						)}
					</div>
				</div>
			</div>

			<div className="flex flex-wrap items-center gap-3">
				<span className="grow font-mono text-[11px] text-muted-foreground">
					REGISTRO SOMENTE LEITURA · NÃO PODE SER EDITADO NEM APAGADO
				</span>
				{totalPages > 1 ? (
					<nav
						aria-label="Páginas"
						className="flex items-center gap-2 text-sm text-ink-soft"
					>
						<span className="font-mono text-xs">
							{page} / {totalPages}
						</span>
						<button
							type="button"
							onClick={() =>
								update({ pagina: page - 1 > 1 ? String(page - 1) : null })
							}
							disabled={page <= 1}
							aria-label="Página anterior"
							className="flex size-9 items-center justify-center rounded-lg border bg-card hover:bg-surface-2 disabled:opacity-40"
						>
							<CaretLeftIcon size={14} />
						</button>
						<button
							type="button"
							onClick={() => update({ pagina: String(page + 1) })}
							disabled={page >= totalPages}
							aria-label="Próxima página"
							className="flex size-9 items-center justify-center rounded-lg border bg-card hover:bg-surface-2 disabled:opacity-40"
						>
							<CaretRightIcon size={14} />
						</button>
					</nav>
				) : null}
			</div>
		</div>
	);
}

function FilterChip({
	label,
	onClear,
}: {
	label: string;
	onClear: () => void;
}) {
	return (
		<span className="flex h-[30px] items-center gap-1.5 rounded-full border bg-card pr-1 pl-3 text-xs">
			{label}
			<button
				type="button"
				onClick={onClear}
				aria-label={`Remover filtro ${label}`}
				className="flex size-6 items-center justify-center rounded-full text-muted-foreground hover:bg-surface"
			>
				<XIcon size={12} />
			</button>
		</span>
	);
}

function AuditRow({
	log,
	actor,
	open,
	onToggle,
	onUser,
}: {
	log: AuditLog;
	actor: Actor;
	open: boolean;
	onToggle: () => void;
	onUser: () => void;
}) {
	const details = auditDetails(log);
	const links = auditLinks(log);

	return (
		<div className="border-t">
			<button
				type="button"
				onClick={onToggle}
				aria-expanded={open}
				className={cn(
					columns,
					'w-full px-[18px] py-3 text-left text-sm transition-colors hover:bg-[#FAFAF8]',
					open && 'bg-[#FAFAF8]',
				)}
			>
				<span className="font-mono text-xs text-ink-soft">
					{formatTimelineMoment(log.createdAt)}
				</span>
				<span className="flex min-w-0 items-center gap-2">
					<span
						className={cn('size-2 shrink-0 rounded-full', dotClass[actor.kind])}
					/>
					<span className="truncate">{actor.name}</span>
				</span>
				<span className="truncate">{actionLabel(log.action)}</span>
				<span>
					<span className="inline-flex h-[22px] items-center rounded-full bg-surface px-2 font-mono text-[10px] tracking-[0.08em] text-ink-soft uppercase">
						{entityLabel(log.entityName)}
					</span>
				</span>
				<span
					className="font-mono text-xs text-ink-soft"
					title={log.entityId ?? undefined}
				>
					{shortId(log.entityId)}
				</span>
				<ChevronIcon
					size={13}
					className={cn(
						'text-muted-foreground transition-transform duration-200',
						open && 'rotate-90',
					)}
				/>
			</button>
			{open ? (
				<div className="flex animate-up flex-col gap-3 px-[18px] pt-1 pb-4 min-[980px]:pl-[318px]">
					<div className="rounded-[10px] bg-background px-3.5 py-3 font-mono text-xs leading-relaxed">
						<span className="block pb-1 text-[10px] tracking-[0.12em] text-muted-foreground">
							DETALHES
						</span>
						{details.length === 0 ? (
							<span className="text-muted-foreground">
								Sem detalhes registrados.
							</span>
						) : (
							details.map((detail) => (
								<span key={detail.key} className="block break-all">
									<span className="text-muted-foreground">{detail.label}:</span>{' '}
									{detail.value}
								</span>
							))
						)}
						{log.entityId ? (
							<span className="block pt-1 break-all text-muted-foreground">
								ID: {log.entityId}
							</span>
						) : null}
					</div>
					<div className="flex flex-wrap gap-x-4 gap-y-1 text-[13px]">
						{links.map((link) => (
							<Link
								key={link.href}
								href={link.href}
								className="font-medium text-primary hover:text-primary-strong"
							>
								{link.label} →
							</Link>
						))}
						{log.userId ? (
							<button
								type="button"
								onClick={onUser}
								className="font-medium text-primary hover:text-primary-strong"
							>
								Ver tudo deste usuário
							</button>
						) : null}
					</div>
				</div>
			) : null}
		</div>
	);
}

export { AuditPage };
