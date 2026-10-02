/**
 * OrderCore's `PasswordPolicy`: 8 to 128 characters, at least one letter and
 * one digit (Unicode-aware, like .NET's `char.IsLetter`/`char.IsDigit`).
 */
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 128;

type PasswordRule = { label: string; ok: boolean };

function passwordRules(password: string): PasswordRule[] {
	return [
		{
			label: '8 a 128 caracteres',
			ok:
				password.length >= PASSWORD_MIN_LENGTH &&
				password.length <= PASSWORD_MAX_LENGTH,
		},
		{ label: 'Uma letra', ok: /\p{L}/u.test(password) },
		{ label: 'Um número', ok: /\p{Nd}/u.test(password) },
	];
}

/** 0–3: how many rules pass; 3 means the backend will accept it. */
function passwordScore(password: string) {
	return passwordRules(password).filter((rule) => rule.ok).length;
}

function isStrongPassword(password: string) {
	return passwordScore(password) === 3;
}

export type { PasswordRule };
export { isStrongPassword, passwordRules, passwordScore };
