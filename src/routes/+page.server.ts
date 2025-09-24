import { db } from '$lib/server/db';
import { Competition } from '$lib/server/db/schema';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
    if (event.locals.user) {
        return redirect(301, "/home")
    }

    const competitions = await db.select().from(Competition).orderBy(Competition.startDate);

    return { competitions };
};
