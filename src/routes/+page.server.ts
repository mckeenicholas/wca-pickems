import { db } from '$lib/server/db';
import { Competition } from '$lib/server/db/schema';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async (event) => {
	if (event.locals.user) {
		return redirect(301, '/home');
	}

	const competitions = await db
		.select()
		.from(Competition)
		.where(eq(Competition.visible, true))
		.orderBy(Competition.startDate);

	return { competitions };
};
