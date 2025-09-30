ALTER TABLE "competitions" RENAME COLUMN "competitionId" TO "competition_id";--> statement-breakpoint
ALTER TABLE "competitions" RENAME COLUMN "competitionName" TO "competition_name";--> statement-breakpoint
ALTER TABLE "competitions" RENAME COLUMN "startDate" TO "start_date";--> statement-breakpoint
ALTER TABLE "competitions" RENAME COLUMN "allowEdits" TO "allow_edits";--> statement-breakpoint
ALTER TABLE "competitors" RENAME COLUMN "wcaUserId" TO "wca_user_id";--> statement-breakpoint
ALTER TABLE "competitors" RENAME COLUMN "wcaId" TO "wca_id";--> statement-breakpoint
ALTER TABLE "predictions" RENAME COLUMN "userId" TO "user_id";--> statement-breakpoint
ALTER TABLE "predictions" RENAME COLUMN "registrationId" TO "registration_id";--> statement-breakpoint
ALTER TABLE "registrations" RENAME COLUMN "competitorId" TO "competitor_id";--> statement-breakpoint
ALTER TABLE "registrations" RENAME COLUMN "competitionId" TO "competition_id";--> statement-breakpoint
ALTER TABLE "registrations" RENAME COLUMN "seedTime" TO "seed_time";--> statement-breakpoint
ALTER TABLE "results" RENAME COLUMN "registrationId" TO "registration_id";--> statement-breakpoint
ALTER TABLE "sessions" RENAME COLUMN "sessionId" TO "session_id";--> statement-breakpoint
ALTER TABLE "sessions" RENAME COLUMN "userId" TO "user_id";--> statement-breakpoint
ALTER TABLE "sessions" RENAME COLUMN "expiresAt" TO "expires_at";--> statement-breakpoint
ALTER TABLE "sessions" RENAME COLUMN "wcaToken" TO "wca_token";--> statement-breakpoint
ALTER TABLE "sessions" RENAME COLUMN "wcaRefreshToken" TO "wca_refresh_token";--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "wcaUserId" TO "wca_user_id";--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "wcaId" TO "wca_id";--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "isAdmin" TO "is_admin";--> statement-breakpoint
ALTER TABLE "competitions" DROP CONSTRAINT "competitions_competitionId_unique";--> statement-breakpoint
ALTER TABLE "competitors" DROP CONSTRAINT "competitors_wcaId_unique";--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_wcaId_unique";--> statement-breakpoint
ALTER TABLE "predictions" DROP CONSTRAINT "predictions_userId_users_id_fk";
--> statement-breakpoint
ALTER TABLE "predictions" DROP CONSTRAINT "predictions_registrationId_registrations_id_fk";
--> statement-breakpoint
ALTER TABLE "registrations" DROP CONSTRAINT "registrations_competitorId_competitors_wcaUserId_fk";
--> statement-breakpoint
ALTER TABLE "registrations" DROP CONSTRAINT "registrations_competitionId_competitions_id_fk";
--> statement-breakpoint
ALTER TABLE "results" DROP CONSTRAINT "results_registrationId_registrations_id_fk";
--> statement-breakpoint
ALTER TABLE "sessions" DROP CONSTRAINT "sessions_userId_users_id_fk";
--> statement-breakpoint
DROP INDEX "prediction_userid_idx";--> statement-breakpoint
DROP INDEX "registration_competitionId_idx";--> statement-breakpoint
ALTER TABLE "predictions" ADD CONSTRAINT "predictions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "predictions" ADD CONSTRAINT "predictions_registration_id_registrations_id_fk" FOREIGN KEY ("registration_id") REFERENCES "public"."registrations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registrations" ADD CONSTRAINT "registrations_competitor_id_competitors_wca_user_id_fk" FOREIGN KEY ("competitor_id") REFERENCES "public"."competitors"("wca_user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registrations" ADD CONSTRAINT "registrations_competition_id_competitions_id_fk" FOREIGN KEY ("competition_id") REFERENCES "public"."competitions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "results" ADD CONSTRAINT "results_registration_id_registrations_id_fk" FOREIGN KEY ("registration_id") REFERENCES "public"."registrations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "prediction_user_id_idx" ON "predictions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "registration_competition_id_idx" ON "registrations" USING btree ("competition_id");--> statement-breakpoint
CREATE UNIQUE INDEX "registration_uniqueinfo_idx" ON "registrations" USING btree ("competitor_id","competition_id","event");--> statement-breakpoint
ALTER TABLE "competitions" ADD CONSTRAINT "competitions_competition_id_unique" UNIQUE("competition_id");--> statement-breakpoint
ALTER TABLE "competitors" ADD CONSTRAINT "competitors_wca_id_unique" UNIQUE("wca_id");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_wca_id_unique" UNIQUE("wca_id");