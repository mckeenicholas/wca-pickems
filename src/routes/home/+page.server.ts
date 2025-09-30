import { db } from '$lib/server/db';
import { Competition, Registration, Result } from '$lib/server/db/schema';
import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { invalidateSession } from '$lib/server/auth';
import { eq, sql } from 'drizzle-orm';

export const load: PageServerLoad = async (event) => {
	if (!event.locals.user) {
		return redirect(302, '/login');
	}

	const competitions = await db
		.select({
			competitionName: Competition.competitionName,
			competitionId: Competition.competitionId,
			startDate: Competition.startDate,
			hasResults: sql`COUNT(${Result.id}) > 0`.mapWith(Boolean)
		})
		.from(Competition)
		.innerJoin(Registration, eq(Registration.competitionId, Competition.id))
		.leftJoin(Result, eq(Result.registrationId, Registration.id))
		.where(eq(Competition.visible, true))
		.groupBy(Competition.competitionId, Competition.competitionName, Competition.startDate)
		.orderBy(Competition.startDate);

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
