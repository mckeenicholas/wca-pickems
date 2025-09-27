import { db } from '$lib/server/db';
import { Competition, Registration } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { isAdmin } from '$lib/server/serverUtils';

export const load: PageServerLoad = async (event) => {
	const compId = event.params.compid;
	const userId = event.locals.user;

	if (!userId?.id) {
		return redirect(302, '/login');
	}

	if (!(await isAdmin(userId.id))) {
		return redirect(302, '/');
	}

	const [competitionEvents, competition] = await Promise.all([
		// Get all events at this competition
		db
			.selectDistinct({ event: Registration.event })
			.from(Registration)
			.innerJoin(Competition, eq(Registration.competitionId, Competition.id))
			.where(eq(Competition.competitionId, compId)),

		// Get whether edits are allowed
		db
			.select({ allowEdits: Competition.allowEdits })
			.from(Competition)
			.where(eq(Competition.competitionId, compId))
			.limit(1)
	]);

	return {
		competitionEvents,
		competition: competition[0]
	};
};
