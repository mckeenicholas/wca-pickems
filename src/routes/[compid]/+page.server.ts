import { db } from '$lib/server/db';
import { Competition, Registration } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async (event) => {
	const userId = event.locals.user;

	if (!userId) {
		return redirect(302, '/login');
	}

	const compId = event.params.compid;

	const [competitionName, competitionEvents] = await Promise.all([
		// Get competition name
		db
			.select({ competitionName: Competition.competitionName })
			.from(Competition)
			.where(eq(Competition.competitionId, compId)),

		// Get events for the competition
		db
			.selectDistinct({ event: Registration.event })
			.from(Registration)
			.innerJoin(Competition, eq(Registration.competitionId, Competition.id))
			.where(eq(Competition.competitionId, compId))
	]);

	if (!competitionName.length) {
		return fail(404, 'Competition not found');
	}

	return { competitionName: competitionName[0], competitionEvents };
};
