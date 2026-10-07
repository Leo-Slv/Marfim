import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { contentSlugs } from '../model/content';
import { contentGroups, getContentPage, isContentSlug } from './content-pages';

describe('content pages', () => {
	it('lists every slug exactly once across the groups', () => {
		const listed = contentGroups.flatMap((group) =>
			group.pages.map((page) => page.slug),
		);
		assert.deepEqual([...listed].sort(), [...contentSlugs].sort());
	});

	it('recognises known slugs only', () => {
		assert.equal(isContentSlug('termos'), true);
		assert.equal(isContentSlug('instagram'), false);
	});

	it('finds the label of a page', () => {
		assert.equal(getContentPage('prazos').label, 'Prazos e frete');
	});
});
