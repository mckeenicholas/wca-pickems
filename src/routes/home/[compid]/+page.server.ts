import { db } from '$lib/server/db';
import { Competition, Registration } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async (event) => {
	const compId = event.params.compid;

	const competitionName = await db
		.select({ competitionName: Competition.competitionName })
		.from(Competition)
		.where(eq(Competition.competitionId, compId));

	if (!competitionName.length) {
		return fail(404, 'Competition not found');
	}

	const competitionEvents = await db
		.selectDistinct({ event: Registration.event })
		.from(Registration)
		.innerJoin(Competition, eq(Registration.competitionId, Competition.id))
		.where(eq(Competition.competitionId, compId));

	return { competitionName: competitionName[0], competitionEvents };
};
