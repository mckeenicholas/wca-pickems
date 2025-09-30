import { db } from '$lib/server/db';
import { Competition, Registration } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { isAdmin } from '$lib/server/serverUtils';
import { eventOrderIdx } from '$lib/types';

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

		// Get competition info
		db
			.select({ allowEdits: Competition.allowEdits, isVisible: Competition.visible })
			.from(Competition)
			.where(eq(Competition.competitionId, compId))
			.limit(1)
	]);

	competitionEvents.sort((a, b) => eventOrderIdx[a.event] - eventOrderIdx[b.event]);

	return {
		competitionEvents,
		competition: competition[0]
	};
};
