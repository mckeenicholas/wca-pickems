import { db } from '$lib/server/db';
import { Competition, Competitor, Prediction, Registration, Result } from '$lib/server/db/schema';
import type { WCAEvent } from '$lib/types';
import { fail } from '@sveltejs/kit';
import { and, eq, inArray } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

type PredictionType = { name: string; placement: number; score: number; actual: number };

export const load: PageServerLoad = async (event) => {
	const userId = event.locals.user?.id;
	const compId = event.params.compid;

	if (!compId) {
		return fail(400, { error: 'Invalid competition ID' });
	}

	if (!userId) {
		return fail(400, { error: 'Invalid user ID' });
	}

	const nameQuery = await db
		.select({ name: Competition.competitionName })
		.from(Competition)
		.where(eq(Competition.competitionId, compId));

	if (nameQuery.length == 0) {
		return fail(404, { error: `Competition with id ${compId} does not exist` });
	}

	const compName = nameQuery[0].name;

	const eventsWithResults = await db
		.selectDistinct({ event: Registration.event })
		.from(Result)
		.innerJoin(Registration, eq(Result.registrationId, Registration.id))
		.innerJoin(Competition, eq(Registration.competitionId, Competition.id))
		.where(and(eq(Competition.competitionId, compId)));

	const userEventsList = eventsWithResults.map((r) => r.event);

	if (userEventsList.length === 0) {
		return { predictions: [], compName };
	}

	const results = await db
		.select({
			name: Competitor.name,
			competition: Competition.competitionName,
			event: Registration.event,
			placement: Prediction.placement,
			score: Prediction.score,
			actual: Result.placement
		})
		.from(Prediction)
		.innerJoin(Registration, eq(Prediction.registrationId, Registration.id))
		.innerJoin(Competition, eq(Registration.competitionId, Competition.id))
		.innerJoin(Competitor, eq(Registration.competitorId, Competitor.wcaUserId))
		.leftJoin(Result, eq(Result.registrationId, Registration.id))
		.where(
			and(
				eq(Competition.competitionId, compId),
				eq(Prediction.userId, userId),
				inArray(Registration.event, userEventsList)
			)
		);

	const predictionsByEventMap = results.reduce((acc, result) => {
		const predictions = acc.get(result.event) ?? [];
		predictions.push({
			name: result.name,
			placement: result.placement,
			score: result.score,
			actual: result.actual ?? 0
		});
		acc.set(result.event, predictions);
		return acc;
	}, new Map<WCAEvent, PredictionType[]>());

	const predictionsByEvent = Array.from(predictionsByEventMap.entries()).map(
		([event, predictions]) => ({
			event,
			predictions: predictions.sort((a, b) => a.placement - b.placement)
		})
	);

	return { predictions: predictionsByEvent, compName: compName };
};
