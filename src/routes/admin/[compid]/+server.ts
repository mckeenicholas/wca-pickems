import { db } from '$lib/server/db';
import { Competition } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { json, error } from '@sveltejs/kit';
import { isAdmin } from '$lib/server/serverUtils';
import type { RequestHandler } from './$types';

export const PATCH: RequestHandler = async ({ request, params, locals }) => {
	const compId = params.compid;
	const userId = locals.user;

	// Check authentication and admin status
	if (!userId?.id) {
		return error(401, 'Unauthorized');
	}

	if (!isAdmin(userId.id)) {
		return error(403, 'Forbidden - Admin access required');
	}

	try {
		const { allowEdits } = await request.json();

		if (typeof allowEdits !== 'boolean') {
			return error(400, 'Invalid allowEdits value - must be boolean');
		}

		// Update the competition's allowEdits status
		await db.update(Competition).set({ allowEdits }).where(eq(Competition.competitionId, compId));

		return json({ success: true, allowEdits });
	} catch (err) {
		console.error('Error updating competition:', err);
		return error(500, 'Internal server error');
	}
};
