import { isAdmin } from '$lib/server/serverUtils';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { Users } from '$lib/server/db/schema';
import { PAGINATION_SIZE } from '$lib/util';
import { count } from 'drizzle-orm';

export const load: PageServerLoad = async (event) => {
	if (!isAdmin(event.locals.user?.id)) {
		return redirect(302, '/');
	}

	const page = event.url.searchParams.get('page') ?? '0';
	const pageNum = parseInt(page);

	const offsetAmount = pageNum * PAGINATION_SIZE;

	const [allUsers, totalUsers] = await Promise.all([
		// Get list of users
		db.select().from(Users).limit(PAGINATION_SIZE).offset(offsetAmount),

		// Get total number of users of pagination info
		db.select({ count: count() }).from(Users)
	]);

	return { users: allUsers, total: totalUsers, currentPage: pageNum };
};
