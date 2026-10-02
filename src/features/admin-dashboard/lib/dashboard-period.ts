/**
 * The dashboard's periods are store days (São Paulo), today included.
 * Brazil has had no daylight saving since 2019, so a day starts at 00:00
 * at UTC−3.
 */
const SAO_PAULO_OFFSET = '-03:00';

const dayKeyFormatter = new Intl.DateTimeFormat('en-CA', {
	timeZone: 'America/Sao_Paulo',
	year: 'numeric',
	month: '2-digit',
	day: '2-digit',
});

const dayLabelFormatter = new Intl.DateTimeFormat('pt-BR', {
	timeZone: 'UTC',
	day: '2-digit',
	month: 'short',
});

type DashboardPeriod = 7 | 30;

type PeriodRange = {
	/** Day keys (`YYYY-MM-DD`), oldest first. */
	days: string[];
	from: string;
	to: string;
	previousFrom: string;
	previousTo: string;
};

/** `YYYY-MM-DD` of an instant in São Paulo. */
function saoPauloDayKey(date: Date) {
	return dayKeyFormatter.format(date);
}

function startOfDay(dayKey: string) {
	return new Date(`${dayKey}T00:00:00${SAO_PAULO_OFFSET}`);
}

function addDays(dayKey: string, amount: number) {
	const date = new Date(`${dayKey}T12:00:00Z`);
	date.setUTCDate(date.getUTCDate() + amount);
	return date.toISOString().slice(0, 10);
}

/** `?periodo=` → 7 or 30 (the default). */
function parsePeriod(value: string | null): DashboardPeriod {
	return value === '7' ? 7 : 30;
}

/** The last `days` store days up to the end of today, and the ones before. */
function periodRange(days: DashboardPeriod, now: Date): PeriodRange {
	const today = saoPauloDayKey(now);
	const first = addDays(today, -(days - 1));
	return {
		days: Array.from({ length: days }, (_, index) => addDays(first, index)),
		from: startOfDay(first).toISOString(),
		to: startOfDay(addDays(today, 1)).toISOString(),
		previousFrom: startOfDay(addDays(first, -days)).toISOString(),
		previousTo: startOfDay(first).toISOString(),
	};
}

/** "02 OUT". */
function formatDayLabel(dayKey: string) {
	return dayLabelFormatter
		.format(new Date(`${dayKey}T12:00:00Z`))
		.replace('.', '')
		.replace(' de ', ' ')
		.toUpperCase();
}

export type { DashboardPeriod, PeriodRange };
export { formatDayLabel, parsePeriod, periodRange, saoPauloDayKey };
