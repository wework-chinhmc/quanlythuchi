BEGIN;

-- Ensure target schema exists and use it
CREATE SCHEMA IF NOT EXISTS quanlidulieu;
SET search_path TO quanlidulieu;

-- Enum
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_type') THEN
        CREATE TYPE transaction_type AS ENUM ('INCOME','EXPENSE');
    END IF;
END$$;

-- Users
CREATE TABLE IF NOT EXISTS "User" (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT,
  role TEXT NOT NULL DEFAULT 'ACCOUNTANT',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Accounts
CREATE TABLE IF NOT EXISTS "Account" (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  "initialBalance" NUMERIC(15,2) NOT NULL DEFAULT 0,
  "currentBalance" NUMERIC(15,2) NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Category
CREATE TABLE IF NOT EXISTS "Category" (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  type transaction_type NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Transaction
CREATE TABLE IF NOT EXISTS "Transaction" (
  id SERIAL PRIMARY KEY,
  amount NUMERIC(15,2) NOT NULL,
  type transaction_type NOT NULL,
  date TIMESTAMPTZ NOT NULL DEFAULT now(),
  description TEXT,
  "categoryId" INTEGER NOT NULL,
  "accountId" INTEGER NOT NULL,
  "userId" TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_category FOREIGN KEY ("categoryId") REFERENCES "Category"(id) ON DELETE RESTRICT,
  CONSTRAINT fk_account FOREIGN KEY ("accountId") REFERENCES "Account"(id) ON DELETE RESTRICT,
  CONSTRAINT fk_user FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE RESTRICT
);

-- Transfer
CREATE TABLE IF NOT EXISTS "Transfer" (
  id SERIAL PRIMARY KEY,
  amount NUMERIC(15,2) NOT NULL,
  date TIMESTAMPTZ NOT NULL DEFAULT now(),
  description TEXT,
  "fromAccountId" INTEGER NOT NULL,
  "toAccountId" INTEGER NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_from_account FOREIGN KEY ("fromAccountId") REFERENCES "Account"(id) ON DELETE RESTRICT,
  CONSTRAINT fk_to_account FOREIGN KEY ("toAccountId") REFERENCES "Account"(id) ON DELETE RESTRICT
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_transaction_category ON "Transaction" ("categoryId");
CREATE INDEX IF NOT EXISTS idx_transaction_account ON "Transaction" ("accountId");
CREATE INDEX IF NOT EXISTS idx_transaction_user ON "Transaction" ("userId");
CREATE INDEX IF NOT EXISTS idx_transfer_from ON "Transfer" ("fromAccountId");
CREATE INDEX IF NOT EXISTS idx_transfer_to ON "Transfer" ("toAccountId");

COMMIT;
