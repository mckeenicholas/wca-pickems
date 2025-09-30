import { db } from '$lib/server/db';
import { Competition, Competitor, Registration } from '$lib/server/db/schema';
import type { WCAEvent, WcifData } from '$lib/types';
import { error, json, type RequestHandler } from '@sveltejs/kit';
import { eq, sql, and, getTableName } from 'drizzle-orm';
import { isAdmin } from '$lib/server/serverUtils';
import { getPbTime } from '$lib/util';

export const POST: RequestHandler = async (event) => {
	try {
		if (!(await isAdmin(event.locals.user?.id))) {
			return json({ error: 'Forbidden' }, { status: 403 });
		}

		const competitionId = event.params.compid;

		if (!competitionId) {
			return error(400, 'Missing competition ID in request body.');
		}

		const existingCompetition = await db
			.select({ id: Competition.id })
			.from(Competition)
			.where(eq(Competition.competitionId, competitionId))
			.limit(1);

		if (existingCompetition.length == 0) {
			return json({ error: `Competition with ID ${competitionId} does not exist` });
		}

		await updateRegistrationList(competitionId, existingCompetition[0].id);

		return json({
			success: true,
			message: `Registration list for ${competitionId} updated successfully.`
		});
	} catch (e) {
		console.error('Error updating registration list:', e);
		const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
		return error(500, `Failed to update registration list: ${errorMessage}`);
	}
};

const fetchWcifData = async (id: string) => {
	const wcifResponse = await fetch(
		`https://www.worldcubeassociation.org/api/v0/competitions/${id}/wcif/public`
	);
	if (!wcifResponse.ok) {
		throw new Error(`Failed to fetch WCIF data: ${wcifResponse.statusText}`);
	}
	return wcifResponse.json() as Promise<WcifData>;
};

const updateRegistrationList = async (id: string, competitionRecordId: number) => {
	const wcifData = await fetchWcifData(id);

	const competitorsToInsert = wcifData.persons
		.filter(
			(person) => person.registration?.isCompeting && person.registration.status == 'accepted'
		)
		.map((person) => ({
			wcaUserId: person.wcaUserId,
			wcaId: person.wcaId,
			name: person.name
		}));

	await db.transaction(async (tx) => {
		if (competitorsToInsert.length > 0) {
			await tx
				.insert(Competitor)
				.values(competitorsToInsert)
				.onConflictDoUpdate({
					target: [Competitor.wcaUserId],
					set: {
						wcaId: sql.raw(
							`COALESCE(excluded.${Competitor.wcaId.name}, ${getTableName(Competitor)}.${Competitor.wcaId.name})`
						)
					}
				});
		}

		const currentRegistrations = [];
		for (const person of wcifData.persons) {
			if (
				person.registration?.eventIds &&
				person.registration.eventIds.length > 0 &&
				person.wcaUserId
			) {
				for (const eventId of person.registration.eventIds) {
					const seedTime = getPbTime(person.personalBests, eventId as WCAEvent);

					currentRegistrations.push({
						competitorId: person.wcaUserId,
						competitionId: competitionRecordId,
						event: eventId as WCAEvent,
						seedTime: seedTime
					});
				}
			}
		}

		if (currentRegistrations.length > 0) {
			await tx
				.insert(Registration)
				.values(currentRegistrations)
				.onConflictDoUpdate({
					target: [Registration.competitorId, Registration.competitionId, Registration.event],
					set: {
						seedTime: sql.raw(`excluded.${Registration.seedTime.name}`)
					}
				});

			await tx.delete(Registration).where(
				and(
					eq(Registration.competitionId, competitionRecordId),
					sql`(${Registration.competitorId}, ${Registration.event}) NOT IN (${sql.join(
						currentRegistrations.map((r) => sql`(${r.competitorId}, ${r.event}::event)`),
						sql`, `
					)})`
				)
			);
		}
	});
};
