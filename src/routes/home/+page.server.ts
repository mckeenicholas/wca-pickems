import { db } from '$lib/server/db';
import { Competition } from '$lib/server/db/schema';
import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { invalidateSession } from '$lib/server/auth';

export const load: PageServerLoad = async (event) => {
	if (!event.locals.user) {
		return redirect(302, '/login');
	}

	const competitions = await db.select().from(Competition).orderBy(Competition.startDate);

	return { competitions };
};

export const actions = {
	logout: async (event) => {
		if (!event.locals.session) {
			// User not logged in, do nothing and redirect
			return redirect(302, '/');
		}

		invalidateSession(event.locals.session);

		return redirect(302, '/');
	}
} satisfies Actions;
