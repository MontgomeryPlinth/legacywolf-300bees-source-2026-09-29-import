CREATE TABLE "property_access_media" (
  "id" UUID NOT NULL,
  "property_id" UUID NOT NULL,
  "section" TEXT NOT NULL,
  "media_type" TEXT NOT NULL,
  "data_url" TEXT NOT NULL,
  "label" TEXT NOT NULL DEFAULT '',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "property_access_media_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "property_access_media" ADD CONSTRAINT "property_access_media_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;
