import { db } from '$lib/server/db/index.js';
import { Competition, Prediction, Registration, Result } from '$lib/server/db/schema.js';
import { WCAEvents, type WCAEvent } from '$lib/types.js';
import { MAX_PICKS } from '$lib/util';
import { json } from '@sveltejs/kit';
import { and, eq, count, sql } from 'drizzle-orm';

const DECAY_FACTOR = 1.5;

export const POST = async (event) => {
	const eventId = event.params.eventid;
	const compId = event.params.compid;

	if (!WCAEvents.includes(eventId as WCAEvent)) {
		return json({ error: 'Invalid WCA event' }, { status: 400 });
	}

	if (!compId) {
		return json({ error: 'No competition ID provided' }, { status: 400 });
	}

	await db.transaction(async (tx) => {
		await tx
			.update(Prediction)
			.set({
				score: sql`(
    ${MAX_PICKS} - ${Prediction.placement} + 1
)::float / POWER(${DECAY_FACTOR}, ABS(${Prediction.placement} - ${Result.placement}))`
			})
			.from(Registration)
			.innerJoin(Competition, eq(Registration.competitionId, Competition.id))
			.innerJoin(Result, eq(Result.registrationId, Registration.id))
			.where(
				and(
					eq(Prediction.registrationId, Registration.id),
					eq(Competition.competitionId, compId),
					eq(Registration.event, eventId as WCAEvent)
				)
			);
	});

	return json({ success: true });
};
