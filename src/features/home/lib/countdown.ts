type CountdownPart = { value: string; label: string };

/** The end of the current week's Sunday (23:59:59, local time). */
function endOfSunday(now: Date) {
	const end = new Date(now);
	end.setDate(now.getDate() + ((7 - now.getDay()) % 7));
	end.setHours(23, 59, 59, 0);
	return end;
}

/** DIAS / HORAS / MIN / SEG left until `endOfSunday(now)`, zero-padded. */
function countdownToEndOfSunday(now: Date): CountdownPart[] {
	let seconds = Math.max(
		0,
		Math.floor((endOfSunday(now).getTime() - now.getTime()) / 1000),
	);
	const days = Math.floor(seconds / 86_400);
	seconds -= days * 86_400;
	const hours = Math.floor(seconds / 3_600);
	seconds -= hours * 3_600;
	const minutes = Math.floor(seconds / 60);
	seconds -= minutes * 60;

	const pad = (n: number) => String(n).padStart(2, '0');
	return [
		{ value: pad(days), label: 'DIAS' },
		{ value: pad(hours), label: 'HORAS' },
		{ value: pad(minutes), label: 'MIN' },
		{ value: pad(seconds), label: 'SEG' },
	];
}

export type { CountdownPart };
export { countdownToEndOfSunday, endOfSunday };
