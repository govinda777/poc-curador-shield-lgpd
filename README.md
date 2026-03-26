# Sovereign Guardian: Medical/Shamanic Data Platform POC

## Overview
This Proof of Concept (POC) demonstrates a high-security architecture for handling sensitive medical and shamanic data, ensuring **Privacy by Design** and full **LGPD compliance**. The system uses a multi-layered security model to protect patient sovereignty while enabling B2B governance.

## Architecture: The Three Levels of Security

### Level 01: The Vault-Proxy Pattern (Anonymization)
- **Concept**: Decoupling Personally Identifiable Information (PII) from clinical records.
- **Implementation**: `folder-01-vault-proxy/`
- **LGPD Focus**: Art. 12 (Anonymization) and Art. 6 (Data Minimization).

### Level 02: End-to-End Encryption (E2EE) (Zero-Knowledge)
- **Concept**: Server-side storage is "untrusted". All encryption happens client-side using keys derived from Privy Smart Wallets.
- **Implementation**: `folder-02-e2ee-privy/`
- **Security**: AES-256-GCM + PBKDF2.

### Level 03: Granular Proxy Re-Encryption (B2B Governance)
- **Concept**: Dynamic social control through "Wrapped Key Access". Patients share specific data envelopes with doctors without revealing master keys.
- **Implementation**: `folder-03-granular-access/`
- **LGPD Focus**: Art. 13 (Portability) and Data Sovereignty.

## Technical Stack
- **Database**: Simulated Neon (Serverless Postgres) via `src/db.mts`.
- **Auth**: Simulated Privy Smart Wallets (Signatures used for KDF).
- **Language**: TypeScript (Node.js).

## How to Run the POC
1. Install dependencies:
   ```bash
   npm install
   ```
2. Build the project:
   ```bash
   npx tsc
   ```
3. Run the validation script:
   ```bash
   node scripts/verify_integrity.mjs
   ```

## Repository Structure
- `/schema`: SQL definitions for Neon/Postgres.
- `/folder-01-vault-proxy`: Logic for PII decoupling and anonymization.
- `/folder-02-e2ee-privy`: Client-side encryption and KDF logic.
- `/folder-03-granular-access`: Wrapped key sharing and revocation logic.
- `/src`: Core database utilities.
- `/scripts`: Validation and integrity checking.

## Conclusion
The **Sovereign Guardian** POC proves that it is possible to build B2B healthcare platforms that are both functional and deeply respectful of human privacy, fulfilling the requirements of the *Sigilo Hipocrático Digital*.
