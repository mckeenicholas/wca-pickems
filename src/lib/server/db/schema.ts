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
	varchar
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
	wcaUserId: integer().notNull(),
	wcaId: varchar({ length: 10 }).unique(),
	name: text().notNull(),
	isAdmin: boolean().notNull().default(false)
});

export const Sessions = pgTable('sessions', {
	sessionId: varchar({ length: 64 }).primaryKey(),
	userId: integer()
		.references(() => Users.id, { onDelete: 'cascade' })
		.notNull(),
	expiresAt: timestamp().notNull(),
	wcaToken: text().notNull(),
	wcaRefreshToken: text().notNull()
});

export const Competition = pgTable('competitions', {
	id: serial().primaryKey(),
	competitionId: text().notNull().unique(),
	competitionName: text().notNull(),
	startDate: date().notNull(),
	allowEdits: boolean().notNull().default(true),
	visible: boolean().notNull().default(true)
});

export const Competitor = pgTable('competitors', {
	wcaUserId: integer().primaryKey(),
	wcaId: varchar({ length: 10 }).unique(),
	name: text().notNull()
});

export const EventEnum = pgEnum('event', WCAEvents);

export const Registration = pgTable('registrations', {
	id: serial().primaryKey(),
	competitorId: integer().references(() => Competitor.wcaUserId, { onDelete: 'set null' }),
	competitionId: integer()
		.notNull()
		.references(() => Competition.id, { onDelete: 'cascade' }),
	event: EventEnum().notNull()
});

export const Prediction = pgTable('predictions', {
	id: serial().primaryKey(),
	userId: integer()
		.notNull()
		.references(() => Users.id, { onDelete: 'cascade' }),
	registrationId: integer()
		.notNull()
		.references(() => Registration.id, { onDelete: 'set null' }),
	placement: integer().notNull(),
	score: real().notNull().default(0)
});

export const Result = pgTable('results', {
	id: serial().primaryKey(),
	registrationId: integer()
		.notNull()
		.references(() => Registration.id, { onDelete: 'set null' }),
	placement: integer().notNull()
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

export type ResultsTable = typeof Prediction.$inferSelect;
export type ResultsTableInsert = typeof Prediction.$inferInsert;
