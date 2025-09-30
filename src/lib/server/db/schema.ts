import {
	boolean,
	date,
	integer,
	pgEnum,
	pgTable,
	real,
	serial,
	text,
	timestamp,
	varchar,
	index,
	uniqueIndex
} from 'drizzle-orm/pg-core';

const WCAEvents = [
	'222',
	'333',
	'444',
	'555',
	'666',
	'777',
	'333bf',
	'333fm',
	'333oh',
	'minx',
	'pyram',
	'clock',
	'skewb',
	'sq1',
	'444bf',
	'555bf',
	'333mbf'
] as const;

export const Users = pgTable('users', {
	id: serial().primaryKey(),
	wcaUserId: integer('wca_user_id').notNull(),
	wcaId: varchar('wca_id', { length: 10 }).unique(),
	name: text('name').notNull(),
	isAdmin: boolean('is_admin').notNull().default(false)
});

export const Sessions = pgTable('sessions', {
	sessionId: varchar('session_id', { length: 64 }).primaryKey(),
	userId: integer('user_id')
		.references(() => Users.id, { onDelete: 'cascade' })
		.notNull(),
	expiresAt: timestamp('expires_at').notNull(),
	wcaToken: text('wca_token').notNull(),
	wcaRefreshToken: text('wca_refresh_token').notNull()
});

export const Competition = pgTable('competitions', {
	id: serial().primaryKey(),
	competitionId: text('competition_id').notNull().unique(),
	competitionName: text('competition_name').notNull(),
	startDate: date('start_date').notNull(),
	allowEdits: boolean('allow_edits').notNull().default(true),
	visible: boolean('visible').notNull().default(true)
});

export const Competitor = pgTable('competitors', {
	wcaUserId: integer('wca_user_id').primaryKey(),
	wcaId: varchar('wca_id', { length: 10 }).unique(),
	name: text('name').notNull()
});

export const EventEnum = pgEnum('event', WCAEvents);

export const Registration = pgTable(
	'registrations',
	{
		id: serial('id').primaryKey(),
		competitorId: integer('competitor_id').references(() => Competitor.wcaUserId, {
			onDelete: 'cascade'
		}),
		competitionId: integer('competition_id')
			.notNull()
			.references(() => Competition.id, { onDelete: 'cascade' }),
		event: EventEnum('event').notNull(),
		seedTime: integer('seed_time')
	},
	(table) => [
		index('registration_competition_id_idx').on(table.competitionId),
		uniqueIndex('registration_uniqueinfo_idx').on(
			table.competitorId,
			table.competitionId,
			table.event
		)
	]
);

export const Prediction = pgTable(
	'predictions',
	{
		id: serial('id').primaryKey(),
		userId: integer('user_id')
			.notNull()
			.references(() => Users.id, { onDelete: 'cascade' }),
		registrationId: integer('registration_id')
			.notNull()
			.references(() => Registration.id, { onDelete: 'cascade' }),
		placement: integer('placement').notNull(),
		score: real('score').notNull().default(0)
	},
	(table) => [index('prediction_user_id_idx').on(table.userId)]
);

export const Result = pgTable('results', {
	id: serial('id').primaryKey(),
	registrationId: integer('registration_id')
		.notNull()
		.references(() => Registration.id, { onDelete: 'cascade' }),
	placement: integer('placement').notNull()
});

export type UserTable = typeof Users.$inferSelect;
export type UserTableInsert = typeof Users.$inferInsert;

export type SessionTable = typeof Sessions.$inferSelect;
export type SessionTableInsert = typeof Sessions.$inferInsert;

export type CompetitionTable = typeof Competition.$inferSelect;
export type CompetitionTableInsert = typeof Competition.$inferInsert;

export type CompetitorTable = typeof Competitor.$inferSelect;
export type CompetitorTableInsert = typeof Competitor.$inferInsert;

export type RegistrationTable = typeof Registration.$inferSelect;
export type RegistrationTableInsert = typeof Registration.$inferInsert;

export type PredictionsTable = typeof Prediction.$inferSelect;
export type PredictionsTableInsert = typeof Prediction.$inferInsert;

export type ResultsTable = typeof Result.$inferSelect;
export type ResultsTableInsert = typeof Result.$inferInsert;
