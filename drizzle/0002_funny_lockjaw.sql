CREATE TABLE "predictions" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"registrationId" integer NOT NULL,
	"placement" integer NOT NULL,
	"score" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "predictions" ADD CONSTRAINT "predictions_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "predictions" ADD CONSTRAINT "predictions_registrationId_registrations_id_fk" FOREIGN KEY ("registrationId") REFERENCES "public"."registrations"("id") ON DELETE set null ON UPDATE no action;