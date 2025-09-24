ALTER TABLE "competitions" ALTER COLUMN "startDate" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "competitors" ALTER COLUMN "wcaId" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "isAdmin" boolean DEFAULT false NOT NULL;