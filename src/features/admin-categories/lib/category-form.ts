import { z } from 'zod';

import type { Category } from '@/features/catalog/model/category';
import { slugify } from '@/features/catalog/lib/slugify';
import { isApiError } from '@/lib/http/api-error';

/** The address OrderCore will give it (same rule as `Slug.GenerateFrom`). */
function categorySlug(name: string) {
	return slugify(name);
}

/** The category whose address the new name would take, if any. */
function findDuplicate(name: string, categories: readonly Category[]) {
	const slug = categorySlug(name);
	return slug
		? (categories.find((category) => category.slug === slug) ?? null)
		: null;
}

const newCategoryFormSchema = z.object({
	name: z
		.string()
		.trim()
		.min(1, 'Informe o nome da categoria.')
		.max(100)
		.refine((name) => categorySlug(name).length > 0, {
			message: 'Use letras ou números no nome.',
		}),
});

type NewCategoryForm = z.infer<typeof newCategoryFormSchema>;

function categoryErrorCopy(error: unknown) {
	if (isApiError(error)) {
		if (error.status === 503 || error.status === 408) {
			return 'Não conseguimos falar com a loja agora. Tente de novo em instantes.';
		}
		if (error.code === 'validation_error') {
			return 'Confira o nome e tente de novo.';
		}
		// A duplicate address the screen didn't know about (pendency #4).
		if (error.status >= 500) {
			return 'Não foi possível criar. Talvez já exista uma categoria com esse nome — atualize a página e confira.';
		}
	}
	return 'Algo deu errado. Tente de novo em instantes.';
}

export type { NewCategoryForm };
export {
	categoryErrorCopy,
	categorySlug,
	findDuplicate,
	newCategoryFormSchema,
};
