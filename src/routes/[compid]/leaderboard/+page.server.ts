import { db } from '$lib/server/db';
import { Competition, Prediction, Registration, Users } from '$lib/server/db/schema';
import { fail } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { desc, and, eq, sum, count, countDistinct, sql } from 'drizzle-orm';
import { WCAEvents, type WCAEvent } from '$lib/types';
import { PAGINATION_SIZE } from '$lib/util';

export const load: PageServerLoad = async (event) => {
	const userId = event.locals.user?.id;

	const eventId = event.url.searchParams.get('event');
	const pageStr = event.url.searchParams.get('page') ?? '0';

	const page = parseInt(pageStr);
	const offsetCount = Number.isNaN(page) ? 0 : page * PAGINATION_SIZE;

	const compId = event.params.compid;

	if (!compId) {
		return fail(400, { error: 'Invalid competition ID' });
	}

	if (eventId) {
		if (!WCAEvents.includes(eventId as WCAEvent)) {
			return fail(400, { error: 'Invalid event ID' });
		}
	}

	const baseConditions = and(
		eq(Competition.competitionId, compId),
		eventId ? eq(Registration.event, eventId as WCAEvent) : undefined
	);

	// Get competition name first (this should always exist)
	const competitionQuery = await db
		.select({ competitionName: Competition.competitionName })
		.from(Competition)
		.where(eq(Competition.competitionId, compId));

	if (competitionQuery.length === 0) {
		return fail(404, { error: 'Competition not found' });
	}

	const competitionName = competitionQuery[0].competitionName;

	// Check if there are any predictions for this competition/event
	const hasPredictionsQuery = await db
		.select({ numPredictions: count() })
		.from(Prediction)
		.innerJoin(Registration, eq(Prediction.registrationId, Registration.id))
		.innerJoin(Competition, eq(Competition.id, Registration.competitionId))
		.where(baseConditions);

	const hasPredictions = (hasPredictionsQuery[0]?.numPredictions ?? 0) > 0;

	// If no predictions, return early with empty data
	if (!hasPredictions) {
		return {
			leaderboardResults: [],
			totalPages: 0,
			totalUsers: 0,
			currentPage: page,
			compName: competitionName,
			userRank: null,
			userScore: null,
			userPercentile: null,
			noPredictions: true
		};
	}

	// Get total users count
	const totalUsersQuery = await db
		.select({
			count: countDistinct(Users.id)
		})
		.from(Prediction)
		.innerJoin(Registration, eq(Prediction.registrationId, Registration.id))
		.innerJoin(Competition, eq(Competition.id, Registration.competitionId))
		.innerJoin(Users, eq(Users.id, Prediction.userId))
		.where(baseConditions);

	const totalUsers = totalUsersQuery[0]?.count ?? 0;
	const totalPages = Math.ceil(totalUsers / PAGINATION_SIZE);

	// Create ranked query
	const rankedQuery = db
		.select({
			userName: Users.name,
			userId: Users.id,
			score: sum(Prediction.score).as('score'),
			rank: sql<string>`RANK() OVER (ORDER BY ${sum(Prediction.score)} DESC)`.as('rank')
		})
		.from(Prediction)
		.innerJoin(Registration, eq(Prediction.registrationId, Registration.id))
		.innerJoin(Competition, eq(Competition.id, Registration.competitionId))
		.innerJoin(Users, eq(Users.id, Prediction.userId))
		.where(baseConditions)
		.groupBy(Users.id)
		.as('ranked_results');

	// Conditionally get user stats only if logged in
	let userRank = null;
	let userScore = null;
	let userPercentile = null;

	if (userId) {
		const userStatsQuery = await db
			.select({ rank: rankedQuery.rank, userScore: rankedQuery.score })
			.from(rankedQuery)
			.where(eq(rankedQuery.userId, userId));

		const userStats = userStatsQuery[0];
		userRank = userStats ? parseInt(userStats.rank) : null;
		userScore = userStats?.userScore ?? null;
		userPercentile =
			userRank && totalUsers > 0 ? ((totalUsers - userRank + 1) / totalUsers) * 100 : null;
	}

	// Get leaderboard results
	const leaderboardResults = await db
		.select({
			userName: rankedQuery.userName,
			score: rankedQuery.score,
			rank: rankedQuery.rank
		})
		.from(rankedQuery)
		.orderBy(desc(rankedQuery.score))
		.limit(PAGINATION_SIZE)
		.offset(offsetCount);

	return {
		leaderboardResults,
		totalPages,
		totalUsers,
		currentPage: page,
		compName: competitionName,
		userRank,
		userScore,
		userPercentile,
		noPredictions: false
	};
};
