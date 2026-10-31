ALTER TABLE "user" ADD COLUMN "deck_limit" integer DEFAULT 10 NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "card_limit" integer DEFAULT 100 NOT NULL;