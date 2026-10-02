/** "Pendente Orbe" / "Pendente Orbe + 1 peça" / "Pendente Orbe + 2 peças". */
function orderItemsSummary(names: readonly string[]) {
	if (names.length === 0) {
		return '';
	}
	const others = names.length - 1;
	if (others === 0) {
		return names[0];
	}
	return `${names[0]} + ${others} ${others === 1 ? 'peça' : 'peças'}`;
}

/**
 * OrderCore keeps one `name`; the form shows Nome + Sobrenome (account
 * pendency #2): first word / the rest.
 */
function splitName(fullName: string) {
	const [first = '', ...rest] = fullName.trim().split(/\s+/);
	return { first, last: rest.join(' ') };
}

function joinName(first: string, last: string) {
	return [first.trim(), last.trim()].filter(Boolean).join(' ');
}

function phoneDigits(value: string) {
	return value.replace(/\D/g, '').slice(0, 11);
}

/** Live mask "(11) 98000-0000" / "(11) 3000-0000". */
function maskPhone(value: string) {
	const digits = phoneDigits(value);
	if (digits.length <= 2) {
		return digits.length ? `(${digits}` : '';
	}
	const ddd = digits.slice(0, 2);
	const rest = digits.slice(2);
	const split = rest.length > 8 ? 5 : 4;
	return rest.length > split
		? `(${ddd}) ${rest.slice(0, split)}-${rest.slice(split)}`
		: `(${ddd}) ${rest}`;
}

/** DDD + number: 10 or 11 digits (empty is allowed — the phone is optional). */
function isValidPhone(value: string) {
	const length = phoneDigits(value).length;
	return length === 0 || length === 10 || length === 11;
}

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
	day: '2-digit',
	month: 'short',
	year: 'numeric',
	timeZone: 'America/Sao_Paulo',
});

const timeFormatter = new Intl.DateTimeFormat('pt-BR', {
	day: '2-digit',
	month: 'short',
	hour: '2-digit',
	minute: '2-digit',
	timeZone: 'America/Sao_Paulo',
});

/** "02 out. 2026" → "02 out 2026" (the mockup drops the dot). */
function formatOrderDate(iso: string) {
	return dateFormatter
		.format(new Date(iso))
		.replace(/\./g, '')
		.replace(/ de /g, ' ');
}

/** "12 SET · 14:02" for the timeline. */
function formatTimelineMoment(iso: string) {
	const parts = timeFormatter.formatToParts(new Date(iso));
	const get = (type: Intl.DateTimeFormatPartTypes) =>
		parts.find((part) => part.type === type)?.value ?? '';
	return `${get('day')} ${get('month').replace('.', '').toUpperCase()} · ${get('hour')}:${get('minute')}`;
}

export {
	formatOrderDate,
	formatTimelineMoment,
	isValidPhone,
	joinName,
	maskPhone,
	orderItemsSummary,
	phoneDigits,
	splitName,
};
