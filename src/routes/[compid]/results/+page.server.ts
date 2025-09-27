import { db } from '$lib/server/db';
import { Competition, Competitor, Prediction, Registration, Result } from '$lib/server/db/schema';
import type { WCAEvent } from '$lib/types';
import { fail } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
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
		.where(and(eq(Competition.competitionId, compId), eq(Prediction.userId, userId)));

	const [{ competition }] = results;

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

	return { predictions: predictionsByEvent, compName: competition };
};
