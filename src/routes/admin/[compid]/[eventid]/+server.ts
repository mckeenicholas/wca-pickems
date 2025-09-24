import { db } from '$lib/server/db';
import { Competition, Registration, Result } from '$lib/server/db/schema';
import { WCAEvents, type WCAEvent } from '$lib/types';
import { MAX_PICKS } from '$lib/util';
import { json, type RequestHandler } from '@sveltejs/kit';
import { eq, and } from 'drizzle-orm';
import { exists } from 'drizzle-orm/sql';

interface IResult {
	registrationId: number;
	placement: number;
}

export const POST: RequestHandler = async ({ request, params, locals }) => {
	try {
		const userId = locals.user?.id;
		if (!userId) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { results }: { results: IResult[] } = await request.json();

		if (results.length > MAX_PICKS) {
			return json({ error: `Maximum ${MAX_PICKS} results allowed` }, { status: 400 });
		}

		const { eventid, compid } = params;

		if (!eventid || !compid || !WCAEvents.includes(eventid as WCAEvent)) {
			return json({ error: 'Missing or invalid event ID or competition ID' }, { status: 400 });
		}

		const compQuery = await db
			.select({ allowEdits: Competition.allowEdits })
			.from(Competition)
			.where(eq(Competition.competitionId, compid));

		if (compQuery.length == 0) {
			return json({ error: 'Competition with given ID does not exist' }, { status: 404 });
		}

		if (!compQuery[0].allowEdits) {
			return json({ error: 'Edits are no longer allowed' }, { status: 400 });
		}

		await db.transaction(async (tx) => {
			await tx.delete(Result).where(
				exists(
					tx
						.select()
						.from(Registration)
						.innerJoin(Competition, eq(Registration.competitionId, Competition.id))
						.where(
							and(
								eq(Result.registrationId, Registration.id),
								eq(Competition.competitionId, compid),
								eq(Registration.event, eventid as WCAEvent)
							)
						)
				)
			);

			if (results.length > 0) {
				await tx.insert(Result).values(
					results.map((result) => ({
						userId,
						registrationId: result.registrationId,
						placement: result.placement
					}))
				);
			}
		});

		return json({ success: true, message: 'Results saved successfully' });
	} catch (error) {
		console.error('Error saving results:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
