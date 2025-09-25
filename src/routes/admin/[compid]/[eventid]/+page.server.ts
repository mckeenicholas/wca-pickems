import { db } from '$lib/server/db';
import { Competition, Competitor, Result, Registration } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import { WCAEvents, type WCAEvent } from '$lib/types';
import { redirect } from '@sveltejs/kit';
import { isAdmin } from '$lib/server/serverUtils';

export const load: PageServerLoad = async (event) => {
	const { compid, eventid } = event.params;
	const userId = event.locals.user;

	if (!compid || !WCAEvents.includes(eventid as WCAEvent)) {
		return redirect(302, '..');
	}

	if (!userId?.id) {
		return redirect(302, '/login');
	}

	if (!isAdmin(userId.id)) {
		return redirect(302, '/');
	}

	const [allCompetitors, results] = await Promise.all([
		// Get all competitors for the event
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

		// Get inputted results for the event
		db
			.select({
				wcaUserId: Competitor.wcaUserId,
				wcaId: Competitor.wcaId,
				name: Competitor.name,
				placement: Result.placement,
				registrationId: Registration.id
			})
			.from(Result)
			.innerJoin(Registration, eq(Result.registrationId, Registration.id))
			.innerJoin(Competition, eq(Registration.competitionId, Competition.id))
			.innerJoin(Competitor, eq(Registration.competitorId, Competitor.wcaUserId))
			.where(
				and(eq(Competition.competitionId, compid), eq(Registration.event, eventid as WCAEvent))
			)
			.orderBy(Result.placement)
	]);

	const resultIds = new Set(results.map((p) => p.registrationId));
	const competitors = allCompetitors.filter((c) => !resultIds.has(c.registrationId));

	return { competitors, results };
};
