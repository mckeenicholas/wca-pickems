import { db } from '$lib/server/db';
import { Competition } from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const competitions = await db.select().from(Competition).orderBy(Competition.startDate);

	return { competitions };
};
