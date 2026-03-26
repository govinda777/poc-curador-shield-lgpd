-- Sovereign Guardian POC Schema
-- Designed for Neon (Postgres)
-- Focus: Separation of PII from Clinical Records (LGPD Compliance)

-- 1. Identities Table (Level 01: Vault-Proxy)
-- Stores PII separately from clinical data.
CREATE TABLE IF NOT EXISTS identities (
    internal_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    external_wallet_address TEXT UNIQUE NOT NULL, -- Privy Smart Wallet Address
    full_name_encrypted TEXT, -- Optional: PII can also be encrypted
    email_encrypted TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Clinical Vault Table (Level 02: E2EE)
-- Stores encrypted medical records. Server has NO access to keys.
CREATE TABLE IF NOT EXISTS clinical_vault (
    record_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES identities(internal_id),
    encrypted_blob TEXT NOT NULL, -- AES-256-GCM output (Base64)
    iv TEXT NOT NULL,             -- Initialization Vector
    auth_tag TEXT NOT NULL,       -- Authentication Tag for GCM
    data_hash TEXT NOT NULL,      -- SHA-256 for integrity verification
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Access Control List (Level 03: Granular Proxy Re-Encryption)
-- Stores "Wrapped Keys" for B2B sharing.
CREATE TABLE IF NOT EXISTS access_control_list (
    access_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    record_id UUID REFERENCES clinical_vault(record_id) ON DELETE CASCADE,
    grantor_id UUID REFERENCES identities(internal_id), -- Patient
    grantee_public_key TEXT NOT NULL,                  -- Doctor's Public Key (from Privy)
    wrapped_key TEXT NOT NULL,                         -- record_key encrypted with doctor_public_key
    metadata TEXT,                                     -- e.g., "Valid until 2025"
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for anonymized querying
CREATE INDEX idx_clinical_patient ON clinical_vault(patient_id);
