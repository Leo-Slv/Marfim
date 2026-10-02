import { z } from 'zod';

const adminLoginFormSchema = z.object({
	email: z.string().trim().pipe(z.email('Digite um e-mail válido.')),
	password: z.string().min(1, 'Digite sua senha.'),
	keepSignedIn: z.boolean(),
});

type AdminLoginForm = z.infer<typeof adminLoginFormSchema>;

export type { AdminLoginForm };
export { adminLoginFormSchema };
