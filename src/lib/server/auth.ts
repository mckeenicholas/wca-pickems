import { APPLICATION_SECRET } from '$env/static/private';
import { db } from '$lib/server/db';
import type { SessionTableInsert } from '$lib/server/db/schema';
import { Sessions, Users } from '$lib/server/db/schema';
import { createServerLog } from './serverUtils';
import type { WCAOauthResponse } from '$lib/types';
import { APPLICATION_ID, WCA_URL } from '$lib/util';
import { sha256 } from '@oslojs/crypto/sha2';
import { encodeBase64url, encodeHexLowerCase } from '@oslojs/encoding';
import type { RequestEvent } from '@sveltejs/kit';
import { eq, lt } from 'drizzle-orm';

const DAY_MS = 1000 * 60 * 60 * 24;
const SESSION_LENGTH_DAYS = 7;
const SESSION_RENEW_THRESHOLD_DAYS = 1;

export const sessionCookieName = 'auth-session';

export function generateSessionToken() {
	const bytes = crypto.getRandomValues(new Uint8Array(18));
	const token = encodeBase64url(bytes);
	return token;
}

export async function createSession(
	token: string,
	userId: number,
	wcaToken: string,
	wcaRefreshToken: string
) {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));

	const session: SessionTableInsert = {
		sessionId,
		wcaToken,
		userId,
		wcaRefreshToken,
		expiresAt: new Date(Date.now() + DAY_MS * SESSION_LENGTH_DAYS)
	};

	await db.insert(Sessions).values(session);
	return session;
}

export async function validateSessionToken(token: string) {
	const providedSessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const [result] = await db
		.select({
			user: { id: Users.id },
			sessionId: Sessions.sessionId,
			expiresAt: Sessions.expiresAt
		})
		.from(Sessions)
		.innerJoin(Users, eq(Sessions.userId, Users.id))
		.where(eq(Sessions.sessionId, providedSessionId));

	if (!result) {
		return { session: null, user: null, expiresAt: null };
	}

	const { sessionId, user, expiresAt } = result;

	const sessionExpired = Date.now() >= expiresAt.getTime();
	if (sessionExpired) {
		await db.delete(Sessions).where(eq(Sessions.sessionId, sessionId));
		return { session: null, user: null, expiresAt: null };
	}

	const renewSession = Date.now() >= expiresAt.getTime() - DAY_MS * SESSION_RENEW_THRESHOLD_DAYS;
	if (renewSession) {
		const newExpiryDate = new Date(Date.now() + DAY_MS * SESSION_LENGTH_DAYS);
		await db
			.update(Sessions)
			.set({ expiresAt: newExpiryDate })
			.where(eq(Sessions.sessionId, sessionId));
	}

	return { session: sessionId, user, expiresAt };
}

export type SessionValidationResult = Awaited<ReturnType<typeof validateSessionToken>>;

export async function invalidateSession(providedSessionId: string) {
	await db.delete(Sessions).where(eq(Sessions.sessionId, providedSessionId));
}

export async function getWCAToken(sessionId: string) {
	const [row] = await db
		.select({
			wcaToken: Sessions.wcaToken,
			refreshToken: Sessions.wcaRefreshToken,
			expiresAt: Sessions.expiresAt
		})
		.from(Sessions)
		.where(eq(Sessions.sessionId, sessionId));

	if (!row) return null;

	const now = Date.now();

	if (now >= row.expiresAt.getTime()) {
		const newTokens = await refreshWCAToken(row.refreshToken);

		const newExpiry = new Date(newTokens.created_at * 1000 + newTokens.expires_in * 1000);

		await db
			.update(Sessions)
			.set({
				wcaToken: newTokens.access_token,
				wcaRefreshToken: newTokens.refresh_token,
				expiresAt: newExpiry
			})
			.where(eq(Sessions.sessionId, sessionId));

		return newTokens.access_token;
	}

	return row.wcaToken;
}

export async function deleteExpiredSessions(): Promise<void> {
	createServerLog('Starting expired session token cleanup...');
	try {
		const now = new Date();
		await db.delete(Sessions).where(lt(Sessions.expiresAt, now));

		createServerLog(`Successfully deleted expired session tokens.`);
	} catch (error) {
		createServerLog(`Failed to delete expired session tokens. Error: ${error}`, 'error');
	}
}

export function setSessionTokenCookie(event: RequestEvent, token: string, expiresAt: Date) {
	event.cookies.set(sessionCookieName, token, {
		expires: expiresAt,
		path: '/'
	});
}

export function deleteSessionTokenCookie(event: RequestEvent) {
	event.cookies.delete(sessionCookieName, {
		path: '/'
	});
}

export async function refreshWCAToken(refreshToken: string) {
	const response = await fetch(`${WCA_URL}/oauth/token`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body: new URLSearchParams({
			grant_type: 'refresh_token',
			refresh_token: refreshToken,
			client_id: APPLICATION_ID,
			client_secret: APPLICATION_SECRET
		})
	});

	if (!response.ok) {
		throw new Error(`Failed to refresh token: ${response.status}`);
	}

	const data: WCAOauthResponse = await response.json();
	return data;
}
