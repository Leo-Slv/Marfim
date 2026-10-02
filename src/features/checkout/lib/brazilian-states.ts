/** The 27 Brazilian federative units (OrderCore accepts any `State`). */
const brazilianStates = [
	'AC',
	'AL',
	'AP',
	'AM',
	'BA',
	'CE',
	'DF',
	'ES',
	'GO',
	'MA',
	'MT',
	'MS',
	'MG',
	'PA',
	'PB',
	'PR',
	'PE',
	'PI',
	'RJ',
	'RN',
	'RS',
	'RO',
	'RR',
	'SC',
	'SP',
	'SE',
	'TO',
] as const;

type BrazilianState = (typeof brazilianStates)[number];

export type { BrazilianState };
export { brazilianStates };
