/**
 * OrderCore keeps one internal-notes text per order (max 2000 characters,
 * admin orders pendency #4). The screen keeps a list on top of it: each
 * note is its text followed by a meta line `— {author} · {ISO time}`, notes
 * separated by a blank line. Text written any other way (e.g. through the
 * API) is shown as one note without author; before appending, it's closed
 * with `— sem autor` so it stays a note of its own.
 */
const MAX_NOTES_LENGTH = 2000;
const LEGACY_MARK = '— sem autor';
const META_LINE = /^— (.+) · (\d{4}-\d{2}-\d{2}T[\d:.]+Z)$/;

type InternalNote = {
	text: string;
	author: string | null;
	/** ISO time; null for a note written outside this screen. */
	at: string | null;
};

function parseNotes(notes: string | null): InternalNote[] {
	if (!notes?.trim()) {
		return [];
	}
	const entries: InternalNote[] = [];
	let lines: string[] = [];

	const close = (author: string | null, at: string | null) => {
		const text = lines.join('\n').trim();
		if (text) {
			entries.push({ text, author, at });
		}
		lines = [];
	};

	for (const line of notes.replace(/\r\n/g, '\n').split('\n')) {
		const meta = META_LINE.exec(line.trim());
		if (meta) {
			close(meta[1], meta[2]);
		} else if (line.trim() === LEGACY_MARK) {
			close(null, null);
		} else {
			lines.push(line);
		}
	}
	close(null, null);
	return entries;
}

/** The notes text with `note` appended by `author` at `now`. */
function appendNote(
	notes: string | null,
	note: string,
	author: string,
	now: Date,
) {
	let existing = (notes ?? '').trim();
	if (existing) {
		const lastLine = existing.split('\n').at(-1)?.trim() ?? '';
		if (!META_LINE.test(lastLine) && lastLine !== LEGACY_MARK) {
			existing = `${existing}\n${LEGACY_MARK}`;
		}
		existing = `${existing}\n\n`;
	}
	return `${existing}${note.trim()}\n— ${author} · ${now.toISOString()}`;
}

/** Characters still available for a new note's text. */
function charactersLeft(notes: string | null, author: string, now: Date) {
	return Math.max(
		0,
		MAX_NOTES_LENGTH - appendNote(notes, '', author, now).length,
	);
}

export type { InternalNote };
export { appendNote, charactersLeft, MAX_NOTES_LENGTH, parseNotes };
