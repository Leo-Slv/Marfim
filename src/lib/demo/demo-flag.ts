/** The demonstration-store notice is on unless explicitly switched off. */
function isDemoStore(value: string | undefined): boolean {
	return !['false', '0', 'off'].includes((value ?? '').trim().toLowerCase());
}

export { isDemoStore };
