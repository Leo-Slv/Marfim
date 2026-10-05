'use client';

import { useState } from 'react';

import { notify } from '@/features/account/components/account-toast';
import { formatTimelineMoment } from '@/features/account/lib/account-format';

import { NotesFullError } from '../hooks/admin-orders.queries';
import { charactersLeft, parseNotes } from '../lib/internal-notes';
import { actionErrorCopy } from '../lib/order-actions';

/** "Notas internas · só a equipe vê" — a list over OrderCore's one text. */
function InternalNotes({
	notes,
	author,
	pending,
	onAdd,
}: {
	notes: string | null;
	author: string;
	pending: boolean;
	onAdd: (
		note: string,
		callbacks: { onSuccess: () => void; onError: (error: unknown) => void },
	) => void;
}) {
	const [draft, setDraft] = useState('');
	const [error, setError] = useState<string | null>(null);
	// The meta line's time doesn't change its length: any instant will do.
	const left = charactersLeft(notes, author, new Date(0));
	const entries = parseNotes(notes);

	function handleSubmit(event: React.FormEvent) {
		event.preventDefault();
		const note = draft.trim();
		if (!note) {
			return;
		}
		if (note.length > left) {
			setError('As notas deste pedido chegaram ao limite de 2000 caracteres.');
			return;
		}
		setError(null);
		onAdd(note, {
			onSuccess: () => {
				setDraft('');
				notify('Nota salva');
			},
			onError: (failure) =>
				setError(
					failure instanceof NotesFullError
						? 'As notas deste pedido chegaram ao limite de 2000 caracteres.'
						: actionErrorCopy(failure),
				),
		});
	}

	return (
		<div className="flex flex-col gap-2">
			<span className="font-mono text-[10px] tracking-[0.14em] text-muted-foreground">
				NOTAS INTERNAS · SÓ A EQUIPE VÊ
			</span>
			{entries.map((entry, index) => (
				<div
					key={`${entry.at ?? 'nota'}-${index}`}
					className="animate-up rounded-[10px] bg-clay-soft px-3 py-2.5 text-[13px] leading-normal whitespace-pre-line"
				>
					{entry.text}
					<span className="block pt-1 font-mono text-[10px] text-muted-foreground">
						{entry.author ?? 'Nota sem autor'}
						{entry.at ? ` · ${formatTimelineMoment(entry.at)}` : ''}
					</span>
				</div>
			))}
			<form onSubmit={handleSubmit} className="flex gap-2">
				<input
					aria-label="Nova nota interna"
					placeholder="Escrever nota"
					value={draft}
					maxLength={Math.max(left, 1)}
					onChange={(event) => setDraft(event.target.value)}
					className="h-10 min-w-0 grow rounded-[10px] border bg-card px-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
				/>
				<button
					type="submit"
					disabled={pending || !draft.trim()}
					className="h-10 rounded-[10px] border bg-card px-3.5 text-[13px] font-medium transition-colors hover:bg-surface-2 disabled:opacity-55"
				>
					{pending ? 'Salvando…' : 'Salvar'}
				</button>
			</form>
			<span className="flex justify-between gap-3 text-xs">
				<span role="alert" className="text-clay">
					{error}
				</span>
				<span className="shrink-0 font-mono text-muted-foreground">
					{Math.max(0, left - draft.trim().length)} restantes
				</span>
			</span>
		</div>
	);
}

export { InternalNotes };
