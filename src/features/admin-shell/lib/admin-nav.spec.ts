import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { adminInitials, adminNavGroups, isActiveItem } from './admin-nav';

describe('adminInitials', () => {
	it('takes the first letters of the e-mail', () => {
		assert.equal(adminInitials('leonardo@gmail.com'), 'LE');
		assert.equal(adminInitials('a.b@marfim.com'), 'AB');
		assert.equal(adminInitials('@x'), 'AD');
	});
});

describe('isActiveItem', () => {
	const [dashboard] = adminNavGroups[0].items;
	it('matches the dashboard exactly', () => {
		assert.equal(isActiveItem(dashboard, '/admin'), true);
		assert.equal(isActiveItem(dashboard, '/admin/orders'), false);
	});

	it('matches a section and its sub-pages', () => {
		const orders = adminNavGroups[0].items[1];
		assert.equal(isActiveItem(orders, '/admin/orders'), true);
		assert.equal(isActiveItem(dashboard, '/admin/orders'), false);
	});

	it('has every admin screen built', () => {
		const items = adminNavGroups.flatMap((group) => group.items);
		assert.equal(items.filter((item) => item.href === null).length, 0);
	});
});
