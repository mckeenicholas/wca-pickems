import { db } from '$lib/server/db';
import { Competition, Competitor, Prediction, Registration } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import { WCAEvents, type WCAEvent } from '$lib/types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async (event) => {
	const { compid, eventid } = event.params;
	const userId = event.locals.user;

	if (!userId) {
		return redirect(302, '/login');
	}

	if (!compid || !WCAEvents.includes(eventid as WCAEvent)) {
		return redirect(302, '..');
	}

	const comp = await db
		.select({ allowEdits: Competition.allowEdits, name: Competition.competitionName })
		.from(Competition)
		.where(eq(Competition.competitionId, compid));

	if (comp.length == 0) {
		return redirect(302, '..');
	}

	const [allCompetitors, predictions] = await Promise.all([
		// get competitors in event
		db
			.select({
				wcaUserId: Competitor.wcaUserId,
				wcaId: Competitor.wcaId,
				name: Competitor.name,
				registrationId: Registration.id
			})
			.from(Registration)
			.innerJoin(Competition, eq(Registration.competitionId, Competition.id))
			.innerJoin(Competitor, eq(Registration.competitorId, Competitor.wcaUserId))
			.where(
				and(eq(Competition.competitionId, compid), eq(Registration.event, eventid as WCAEvent))
			)
			.orderBy(Competitor.name),

		// get user predictions
		db
			.select({
				wcaUserId: Competitor.wcaUserId,
				wcaId: Competitor.wcaId,
				name: Competitor.name,
				placement: Prediction.placement,
				registrationId: Registration.id
			})
			.from(Prediction)
			.innerJoin(Registration, eq(Prediction.registrationId, Registration.id))
			.innerJoin(Competition, eq(Registration.competitionId, Competition.id))
			.innerJoin(Competitor, eq(Registration.competitorId, Competitor.wcaUserId))
			.where(
				and(
					eq(Competition.competitionId, compid),
					eq(Registration.event, eventid as WCAEvent),
					eq(Prediction.userId, userId.id)
				)
			)
			.orderBy(Prediction.placement)
	]);

	const predictionIds = new Set(predictions.map((p) => p.registrationId));
	const competitors = allCompetitors.filter((c) => !predictionIds.has(c.registrationId));

	return { competitors, predictions, comp: comp[0] };
};
