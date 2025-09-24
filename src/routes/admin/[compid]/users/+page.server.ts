import { db } from '$lib/server/db';
import { Competition, Prediction, Registration, Users } from '$lib/server/db/schema';
import { isAdmin } from '$lib/server/serverUtils';
import { redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	if (!isAdmin(event.locals.user?.id)) {
		return redirect(302, '/login');
	}

	const compId = event.params.compid;

	if (compId == undefined) {
		return redirect(302, '/admin');
	}

	const userQuery = await db
		.selectDistinct({ userId: Users.id, userName: Users.name })
		.from(Users)
		.innerJoin(Prediction, eq(Prediction.userId, Users.id))
		.innerJoin(Registration, eq(Prediction.registrationId, Registration.id))
		.innerJoin(Competition, eq(Registration.competitionId, Competition.id))
		.where(eq(Competition.competitionId, compId));

	return { users: userQuery };
};
