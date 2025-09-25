import { APPLICATION_SECRET } from '$env/static/private';
import * as auth from '$lib/server/auth';
import { db } from '$lib/server/db';
import { Users } from '$lib/server/db/schema';
import { createServerLog } from '$lib/server/serverUtils.js';
import type { WCAOauthResponse, WCAUserResponseInfo } from '$lib/types';
import { APPLICATION_ID, authFetch, redirectURI, WCA_URL } from '$lib/util';
import { json } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

export async function POST(event) {
	const body = await event.request.json();
	const { accessCode } = body;

	if (!accessCode) {
		return json({ error: 'WCA token is required' }, { status: 400 });
	}

	const tokenData = {
		grant_type: 'authorization_code',
		code: accessCode,
		client_id: APPLICATION_ID,
		client_secret: APPLICATION_SECRET,
		redirect_uri: redirectURI
	};

	const response = await fetch(`${WCA_URL}/oauth/token`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body: new URLSearchParams(tokenData).toString()
	});

	if (!response.ok) {
		createServerLog(`WCA Oauth Error: ${response.statusText}`, 'error');
		return json({ error: 'Invalid WCA Code' }, { status: 401 });
	}

	const oAuthData = (await response.json()) as WCAOauthResponse;

	const userInfoResponse = await authFetch(`${WCA_URL}/api/v0/me`, oAuthData.access_token);

	if (!response.ok) {
		return json({ error: `Error fetching user info ${response.statusText}` }, { status: 401 });
	}

	const userInfo: WCAUserResponseInfo = await userInfoResponse.json();

	const { name, id, wca_id: wcaId } = userInfo.me;

	const existingUser = await db.select().from(Users).where(eq(Users.wcaId, wcaId)).limit(1);

	let userId: number;

	if (existingUser.length === 0) {
		const insertResult = await db
			.insert(Users)
			.values({
				name,
				wcaUserId: id,
				wcaId: wcaId
			})
			.returning({ id: Users.id });

		userId = insertResult[0].id;
	} else {
		userId = existingUser[0].id;
	}

	const session = await auth.generateSessionToken();
	const { expiresAt } = await auth.createSession(
		session,
		userId,
		oAuthData.access_token,
		oAuthData.refresh_token
	);

	auth.setSessionTokenCookie(event, session, expiresAt);

	return json({ success: true, name, wcaId });
}
