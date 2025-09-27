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

	if (!(await isAdmin(userId.id))) {
		return error(403, 'Forbidden - Admin access required');
	}

	try {
		const body = await request.json();
		const updateData: Partial<{ visible: boolean; allowEdits: boolean }> = {};

		if ('visible' in body) {
			if (typeof body.visible !== 'boolean') {
				return error(400, 'Invalid visible value - must be boolean');
			}
			updateData.visible = body.visible;
		}

		if ('allowEdits' in body) {
			if (typeof body.allowEdits !== 'boolean') {
				return error(400, 'Invalid allowEdits value - must be boolean');
			}
			updateData.allowEdits = body.allowEdits;
		}

		if (Object.keys(updateData).length === 0) {
			return error(400, 'No valid fields provided');
		}

		await db.update(Competition).set(updateData).where(eq(Competition.competitionId, compId));

		return json({ success: true, updated: updateData });
	} catch (err) {
		console.error('Error updating competition:', err);
		return error(500, 'Internal server error');
	}
};
