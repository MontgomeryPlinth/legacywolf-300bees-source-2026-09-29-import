CREATE TABLE "legal_documents" (
  "id" UUID NOT NULL,
  "account_id" UUID NOT NULL,
  "name" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "notes" TEXT,
  "mime_type" TEXT NOT NULL,
  "ciphertext" BYTEA NOT NULL,
  "iv" BYTEA NOT NULL,
  "auth_tag" BYTEA NOT NULL,
  "key_version" INTEGER NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "legal_documents_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "legal_documents" ADD CONSTRAINT "legal_documents_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
