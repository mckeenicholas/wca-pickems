import { db } from '$lib/server/db';
import { Competition, Prediction, Registration, Users } from '$lib/server/db/schema';
import { fail } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { desc, and, eq, sum, count, sql } from 'drizzle-orm';
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

	const [competitionQuery, availableEventsQuery] = await Promise.all([
		// Get competition name
		db
			.select({ competitionName: Competition.competitionName })
			.from(Competition)
			.where(eq(Competition.competitionId, compId)),

		// Get available events
		db
			.selectDistinct({ event: Registration.event })
			.from(Registration)
			.innerJoin(Competition, eq(Registration.competitionId, Competition.id))
			.where(eq(Competition.competitionId, compId))
	]);

	if (competitionQuery.length === 0) {
		return fail(404, { error: 'Competition not found' });
	}

	const competitionName = competitionQuery[0].competitionName;
	const events = availableEventsQuery.map((e) => e.event);

	const leaderboardExpr = db.$with('leaderboard_cte').as(
		db
			.select({
				userName: Users.name,
				userId: Users.id,
				score: sum(Prediction.score).as('score'),
				rank: sql<string>`RANK() OVER (ORDER BY ${sum(Prediction.score)} DESC)`
					.mapWith(Number)
					.as('rank')
			})
			.from(Prediction)
			.innerJoin(Registration, eq(Prediction.registrationId, Registration.id))
			.innerJoin(Competition, eq(Competition.id, Registration.competitionId))
			.innerJoin(Users, eq(Users.id, Prediction.userId))
			.where(baseConditions)
			.groupBy(Users.id)
	);

	const [hasPredictionsQuery, totalUsersQuery, leaderboardResults, userStatsQuery] =
		await Promise.all([
			// Check if predictions exist
			db
				.select({ numPredictions: count() })
				.from(Prediction)
				.innerJoin(Registration, eq(Prediction.registrationId, Registration.id))
				.innerJoin(Competition, eq(Competition.id, Registration.competitionId))
				.where(baseConditions),

			// Get total users
			db.with(leaderboardExpr).select({ count: count() }).from(leaderboardExpr),

			// Get paginated leaderboard results
			db
				.with(leaderboardExpr)
				.select({
					userName: leaderboardExpr.userName,
					score: leaderboardExpr.score,
					rank: leaderboardExpr.rank
				})
				.from(leaderboardExpr)
				.orderBy(desc(leaderboardExpr.score))
				.limit(PAGINATION_SIZE)
				.offset(offsetCount),

			// Get user stats
			userId
				? db
						.with(leaderboardExpr)
						.select({
							rank: leaderboardExpr.rank,
							userScore: leaderboardExpr.score
						})
						.from(leaderboardExpr)
						.where(eq(leaderboardExpr.userId, userId))
				: Promise.resolve([])
		]);

	const hasPredictions = (hasPredictionsQuery[0]?.numPredictions ?? 0) > 0;

	if (!hasPredictions) {
		return {
			events,
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

	const totalUsers = totalUsersQuery[0]?.count ?? 0;
	const totalPages = Math.ceil(totalUsers / PAGINATION_SIZE);

	// Process user stats
	let userRank = null;
	let userScore = null;
	let userPercentile = null;

	if (userId && userStatsQuery.length > 0) {
		const userStats = userStatsQuery[0];
		userRank = userStats ? userStats.rank : null;
		userScore = userStats?.userScore ?? null;
		userPercentile =
			userRank && totalUsers > 0 ? ((totalUsers - userRank + 1) / totalUsers) * 100 : null;
	}

	return {
		events,
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
