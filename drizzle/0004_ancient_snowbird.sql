CREATE TABLE "results" (
	"id" serial PRIMARY KEY NOT NULL,
	"registrationId" integer NOT NULL,
	"placement" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "results" ADD CONSTRAINT "results_registrationId_registrations_id_fk" FOREIGN KEY ("registrationId") REFERENCES "public"."registrations"("id") ON DELETE set null ON UPDATE no action;