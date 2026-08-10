ALTER TABLE "meals" ALTER COLUMN "photo_url" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "meals" ADD COLUMN "weight_g" numeric;