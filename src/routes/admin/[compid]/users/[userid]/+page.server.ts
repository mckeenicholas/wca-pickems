import { db } from '$lib/server/db';
import { Prediction, Registration, Competition, Users, Competitor } from '$lib/server/db/schema';
import { isAdmin } from '$lib/server/serverUtils';
import { redirect } from '@sveltejs/kit';
import { eq, and } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	if (!(await isAdmin(event.locals.user?.id))) {
		return redirect(302, '/login');
	}

	const compId = event.params.compid;
	const userId = parseInt(event.params.userid ?? 'NaN');

	if (Number.isNaN(userId)) {
		return redirect(302, `/admin/${compId}`);
	}

	if (compId == undefined) {
		return redirect(302, '/admin');
	}

	const [userName, personPredictions] = await Promise.all([
		// Get User's name to display
		db.select({ name: Users.name }).from(Users).where(eq(Users.id, userId)),

		// Get all their predictions from this comp
		db
			.select({
				event: Registration.event,
				competitorName: Competitor.name,
				place: Prediction.placement,
				score: Prediction.score
			})
			.from(Prediction)
			.innerJoin(Registration, eq(Prediction.registrationId, Registration.id))
			.innerJoin(Competition, eq(Registration.competitionId, Competition.id))
			.innerJoin(Competitor, eq(Registration.competitorId, Competitor.wcaUserId))
			.where(and(eq(Prediction.userId, userId), eq(Competition.competitionId, compId)))
			.orderBy(Prediction.placement)
	]);

	const predictionsByEvent = personPredictions.reduce<
		Record<string, { competitorName: string; place: number; score: number }[]>
	>((acc, prediction) => {
		const event = prediction.event;

		if (!acc[event]) acc[event] = [];

		acc[event].push({
			competitorName: prediction.competitorName,
			place: prediction.place,
			score: prediction.score
		});

		return acc;
	}, {});

	return {
		userName,
		predictions: predictionsByEvent
	};
};
