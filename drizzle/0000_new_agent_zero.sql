CREATE TYPE "public"."event" AS ENUM('222', '333', '444', '555', '666', '777', '333bf', '333fm', '333oh', 'minx', 'pyram', 'clock', 'skewb', 'sq1', '444bf', '555bf', '333mbf');--> statement-breakpoint
CREATE TABLE "competitions" (
	"id" serial PRIMARY KEY NOT NULL,
	"competitionId" text NOT NULL,
	"competitionName" text NOT NULL,
	"startDate" date,
	CONSTRAINT "competitions_competitionId_unique" UNIQUE("competitionId")
);
--> statement-breakpoint
CREATE TABLE "competitors" (
	"wcaUserId" integer PRIMARY KEY NOT NULL,
	"wcaId" varchar(10) NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "competitors_wcaId_unique" UNIQUE("wcaId")
);
--> statement-breakpoint
CREATE TABLE "registrations" (
	"id" serial PRIMARY KEY NOT NULL,
	"competitorId" integer,
	"competitionId" integer NOT NULL,
	"event" "event" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sessionId" varchar(64) PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"wcaToken" text NOT NULL,
	"wcaRefreshToken" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"wcaUserId" integer NOT NULL,
	"wcaId" varchar(10),
	"name" text NOT NULL,
	CONSTRAINT "users_wcaId_unique" UNIQUE("wcaId")
);
--> statement-breakpoint
ALTER TABLE "registrations" ADD CONSTRAINT "registrations_competitorId_competitors_wcaUserId_fk" FOREIGN KEY ("competitorId") REFERENCES "public"."competitors"("wcaUserId") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registrations" ADD CONSTRAINT "registrations_competitionId_competitions_id_fk" FOREIGN KEY ("competitionId") REFERENCES "public"."competitions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;