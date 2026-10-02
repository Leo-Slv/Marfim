const AUTH_PATHS = ['/login', '/register', '/forgot-password'];

/**
 * The `?next=` to return to after signing in — only a same-origin path
 * (never `//host` or a URL, to avoid an open redirect) and never another
 * auth form (to avoid a loop). Null means "go home".
 */
function safeNext(next: string | null): string | null {
	if (
		!next ||
		!next.startsWith('/') ||
		next.startsWith('//') ||
		next.startsWith('/\\')
	) {
		return null;
	}
	const path = next.split(/[?#]/)[0];
	return AUTH_PATHS.includes(path) ? null : next;
}

export { safeNext };
