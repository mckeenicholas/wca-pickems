CREATE INDEX "prediction_userid_idx" ON "predictions" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "registration_competitionId_idx" ON "registrations" USING btree ("competitionId");