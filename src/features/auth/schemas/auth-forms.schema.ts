import { z } from 'zod';

import { isStrongPassword } from '../lib/password-strength';

const INVALID_EMAIL = 'Digite um e-mail válido.';
const WEAK_PASSWORD =
	'A senha precisa ter de 8 a 128 caracteres, com pelo menos uma letra e um número.';

const emailField = z.string().trim().pipe(z.email(INVALID_EMAIL));
const strongPasswordField = z
	.string()
	.refine(isStrongPassword, { message: WEAK_PASSWORD });

const signInFormSchema = z.object({
	email: emailField,
	password: z.string().min(1, 'Digite sua senha.'),
});

const signUpFormSchema = z.object({
	name: z.string().trim().min(1, 'Digite seu nome.').max(200),
	email: emailField,
	password: strongPasswordField,
	terms: z.boolean().refine((accepted) => accepted, {
		message: 'Aceite os termos para continuar.',
	}),
});

const forgotPasswordFormSchema = z.object({ email: emailField });

const resetPasswordFormSchema = z
	.object({ password: strongPasswordField, confirmation: z.string() })
	.refine((form) => form.password === form.confirmation, {
		message: 'As senhas não são iguais.',
		path: ['confirmation'],
	});

type SignInForm = z.infer<typeof signInFormSchema>;
type SignUpForm = z.infer<typeof signUpFormSchema>;
type ForgotPasswordForm = z.infer<typeof forgotPasswordFormSchema>;
type ResetPasswordForm = z.infer<typeof resetPasswordFormSchema>;

export type { ForgotPasswordForm, ResetPasswordForm, SignInForm, SignUpForm };
export {
	forgotPasswordFormSchema,
	resetPasswordFormSchema,
	signInFormSchema,
	signUpFormSchema,
};
