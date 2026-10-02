import { isApiError } from '@/lib/http/api-error';

/** Countdown used when a 429's `Retry-After` can't be read (pendency #2). */
const DEFAULT_RETRY_AFTER_SECONDS = 60;

type AuthErrorCopy = {
	text: string;
	/** Offer the "Entrar" shortcut (e-mail already registered). */
	offerSignIn?: boolean;
	/** Seconds to lock the form for (too many attempts). */
	lockSeconds?: number;
};

const messagesByCode: Record<string, AuthErrorCopy> = {
	invalid_credentials: {
		text: 'E-mail ou senha incorretos. Confira e tente de novo.',
	},
	account_inactive: {
		text: 'Esta conta foi desativada pela loja. Fale com o atendimento para reativar.',
	},
	email_already_registered: {
		text: 'Já existe uma conta com este e-mail.',
		offerSignIn: true,
	},
	weak_password: {
		text: 'A senha precisa ter de 8 a 128 caracteres, com pelo menos uma letra e um número.',
	},
	validation_error: {
		text: 'Confira os dados e tente de novo.',
	},
};

/** Maps an error from the auth endpoints to the mockup's copy. */
function authErrorCopy(error: unknown): AuthErrorCopy {
	if (!isApiError(error)) {
		return { text: 'Algo deu errado. Tente de novo em instantes.' };
	}
	if (error.status === 429) {
		return {
			text: 'Muitas tentativas seguidas. Por segurança, aguarde para tentar de novo.',
			lockSeconds: error.retryAfterSeconds ?? DEFAULT_RETRY_AFTER_SECONDS,
		};
	}
	if (error.status === 503 || error.status === 408) {
		return {
			text: 'Não conseguimos falar com a loja agora. Tente de novo em instantes.',
		};
	}
	return (
		(error.code ? messagesByCode[error.code] : undefined) ?? {
			text: 'Algo deu errado. Tente de novo em instantes.',
		}
	);
}

function hasErrorCode(error: unknown, code: string) {
	return isApiError(error) && error.code === code;
}

export type { AuthErrorCopy };
export { authErrorCopy, DEFAULT_RETRY_AFTER_SECONDS, hasErrorCode };
