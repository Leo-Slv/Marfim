import { safeNext } from '@/features/auth/lib/safe-next';
import { isApiError } from '@/lib/http/api-error';
import { appRoutes } from '@/lib/routes/app-routes';

/** Lock used when a 429's `Retry-After` can't be read. */
const DEFAULT_LOCK_SECONDS = 30;

type AdminLoginErrorCopy = {
	text: string;
	/** Seconds to lock the form for (too many attempts). */
	lockSeconds?: number;
};

/**
 * Maps a failed admin sign-in to the mockup's copy. `not_admin` isn't here:
 * it's the "Sem acesso ao painel" step, not a form error.
 */
function adminLoginErrorCopy(error: unknown): AdminLoginErrorCopy {
	if (isApiError(error)) {
		if (error.status === 429) {
			return {
				text: 'Muitas tentativas.',
				lockSeconds: error.retryAfterSeconds ?? DEFAULT_LOCK_SECONDS,
			};
		}
		if (error.code === 'invalid_credentials') {
			return { text: 'E-mail ou senha incorretos.' };
		}
		if (error.code === 'account_inactive') {
			return {
				text: 'Esta conta foi desativada. Fale com quem gerencia a loja.',
			};
		}
		if (error.status === 503 || error.status === 408) {
			return {
				text: 'Não conseguimos falar com a loja agora. Tente de novo em instantes.',
			};
		}
	}
	return { text: 'Algo deu errado. Tente de novo em instantes.' };
}

function isNotAdmin(error: unknown) {
	return isApiError(error) && error.code === 'not_admin';
}

/**
 * Where to go after signing in: a same-origin path inside the panel
 * (never the sign-in itself), else the dashboard.
 */
function adminDestination(next: string | null) {
	const safe = safeNext(next);
	const path = safe?.split(/[?#]/)[0] ?? '';
	const insidePanel =
		path === appRoutes.admin.index || path.startsWith('/admin/');
	return safe && insidePanel && path !== appRoutes.admin.login
		? safe
		: appRoutes.admin.index;
}

type AdminSection = {
	/** "a" / "ao" before the name: "voltar a Pedidos", "voltar ao Dashboard". */
	preposition: 'a' | 'ao';
	label: string;
};

const sections: (AdminSection & { path: string })[] = [
	{ path: '/admin/orders', preposition: 'a', label: 'Pedidos' },
	{ path: '/admin/products', preposition: 'a', label: 'Produtos' },
	{ path: '/admin/categories', preposition: 'a', label: 'Categorias' },
	{ path: '/admin/inventory', preposition: 'ao', label: 'Estoque' },
	{ path: '/admin/customers', preposition: 'a', label: 'Clientes' },
	{ path: '/admin/payments', preposition: 'a', label: 'Pagamentos' },
	{ path: '/admin/failures', preposition: 'a', label: 'Falhas' },
	{ path: '/admin/audit', preposition: 'a', label: 'Auditoria' },
];

/** The section an admin goes back to ("…para voltar ao Dashboard"). */
function adminSection(destination: string): AdminSection {
	const path = destination.split(/[?#]/)[0];
	if (path === appRoutes.admin.index) {
		return { preposition: 'ao', label: 'Dashboard' };
	}
	return (
		sections.find(
			(section) => path === section.path || path.startsWith(`${section.path}/`),
		) ?? { preposition: 'ao', label: 'painel' }
	);
}

export type { AdminLoginErrorCopy, AdminSection };
export { adminDestination, adminLoginErrorCopy, adminSection, isNotAdmin };
