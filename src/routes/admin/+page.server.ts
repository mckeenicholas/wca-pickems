import { db } from '$lib/server/db/index.js';
import { Competitor, Competition, Registration } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import type { WCAEvent, WcifData } from '$lib/types';
import { isAdmin } from '$lib/server/serverUtils';

export const load: PageServerLoad = async (event) => {
	const userId = event.locals.user;

	if (!userId?.id) {
		return redirect(302, '/login');
	}

	if (!(await isAdmin(userId.id))) {
		return redirect(302, '/');
	}

	const availableCompetitions = await db
		.select({
			competitionName: Competition.competitionName,
			competitionId: Competition.competitionId,
			visible: Competition.visible
		})
		.from(Competition)
		.orderBy(Competition.startDate);

	return { availableCompetitions };
};

export const actions = {
	default: async (event) => {
		const userId = event.locals.user;

		if (!userId?.id) {
			return fail(401, { error: 'Unauthorized' });
		}

		if (!(await isAdmin(userId.id))) {
			return fail(403, { error: 'Forbidden' });
		}

		const formData = await event.request.formData();
		const competitionId = formData.get('compId')?.toString();

		if (!competitionId) {
			return fail(400, { error: 'No competition ID provided' });
		}

		try {
			await loadCompetitionData(competitionId);
		} catch (e: unknown) {
			console.error('Error loading competition data:', e);
			let errorMessage = 'An unknown error occurred';
			if (e instanceof Error) {
				errorMessage = e.message;
			}
			return fail(500, { error: errorMessage });
		}

		return { success: true };
	}
} satisfies Actions;

const loadCompetitionData = async (id: string) => {
	// TODO: RESET FROM STAGING
	// const wcifResponse = await fetch(`${WCA_URL}/api/v0/competitions/${id}/wcif/public`);
	const wcifResponse = await fetch(
		`https://www.worldcubeassociation.org/api/v0/competitions/${id}/wcif/public`
	);
	if (!wcifResponse.ok) {
		throw new Error(`Failed to fetch WCIF data: ${wcifResponse.statusText}`);
	}
	const wcifData: WcifData = await wcifResponse.json();

	const existingCompetition = await db
		.select()
		.from(Competition)
		.where(eq(Competition.competitionId, id))
		.limit(1);
	let competitionRecordId: number;

	if (existingCompetition.length > 0) {
		competitionRecordId = existingCompetition[0].id;
	} else {
		const newCompetition = await db
			.insert(Competition)
			.values({
				competitionId: wcifData.id,
				competitionName: wcifData.name,
				startDate: wcifData.schedule.startDate
			})
			.returning({ id: Competition.id });
		competitionRecordId = newCompetition[0].id;
	}

	const competitorsToInsert = wcifData.persons
		.filter(
			(person) => person.registration?.isCompeting && person.registration.status == 'accepted'
		)
		.map((person) => ({
			wcaUserId: person.wcaUserId,
			wcaId: person.wcaId,
			name: person.name
		}));

	if (competitorsToInsert.length > 0) {
		await db.insert(Competitor).values(competitorsToInsert).onConflictDoNothing();
	}

	await db.delete(Registration).where(eq(Registration.competitionId, competitionRecordId));

	const registrationsToInsert = [];
	for (const person of wcifData.persons) {
		if (
			person.registration?.eventIds &&
			person.registration.eventIds.length > 0 &&
			person.wcaUserId
		) {
			for (const eventId of person.registration.eventIds) {
				registrationsToInsert.push({
					competitorId: person.wcaUserId,
					competitionId: competitionRecordId,
					event: eventId as WCAEvent
				});
			}
		}
	}

	if (registrationsToInsert.length > 0) {
		await db.insert(Registration).values(registrationsToInsert);
	}
};
