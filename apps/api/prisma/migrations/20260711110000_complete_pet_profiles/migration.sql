ALTER TABLE "pets"
  ADD COLUMN "age_years" INTEGER,
  ADD COLUMN "sex" TEXT,
  ADD COLUMN "weight_kg" DOUBLE PRECISION,
  ADD COLUMN "microchip_id" TEXT,
  ADD COLUMN "photo_key" TEXT,
  ADD COLUMN "vet_contact" JSONB,
  ADD COLUMN "preferences" JSONB,
  ADD COLUMN "emergency_fund_cents" INTEGER;
