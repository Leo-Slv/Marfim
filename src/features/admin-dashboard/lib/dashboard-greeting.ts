/** "Bom dia" / "Boa tarde" / "Boa noite" — admins have no name (pendency #6). */
function greeting(now: Date) {
	const hour = now.getHours();
	if (hour < 5) {
		return 'Boa noite';
	}
	if (hour < 12) {
		return 'Bom dia';
	}
	return hour < 18 ? 'Boa tarde' : 'Boa noite';
}

const weekdays = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
const months = [
	'JAN',
	'FEV',
	'MAR',
	'ABR',
	'MAI',
	'JUN',
	'JUL',
	'AGO',
	'SET',
	'OUT',
	'NOV',
	'DEZ',
];

/** "QUA · 01 OUT 2026". */
function greetingDate(now: Date) {
	const day = String(now.getDate()).padStart(2, '0');
	return `${weekdays[now.getDay()]} · ${day} ${months[now.getMonth()]} ${now.getFullYear()}`;
}

export { greeting, greetingDate };
