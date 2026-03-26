# Sovereign Guardian: Data Access Governance

This document provides a global vision of data access possibilities and governance for each actor in the Sovereign Guardian system.

## Data Visibility Matrix

| Actor | Security Level | Data Access | Visibility Scope |
|-------|----------------|-------------|------------------|
| **Patient** | Level 02 (E2EE) | Full (Decrypted) | Own records only. |
| **Doctor** | Level 03 (Wrapped) | Full (Decrypted) | Records explicitly shared by patients. |
| **B2B / Admin** | Level 01 (Proxy) | Limited (Encrypted/Anonymized) | Global population-level data. |

---

## Detailed Actor Scenarios

### 1. Patient (The Sovereign)
- **Primary Tool**: `EncryptionService`, `ProxyService`.
- **Single Record Access**: Can fetch any of their own records using the `Record_ID` and decrypt it using their Private Key.
- **Multiple Records Access**: Can fetch all records linked to their `Internal_ID` and batch decrypt them.
- **Granting Access**: Can "wrap" keys for specific records and share them with a Doctor.

### 2. Doctor (The Authorized Partner)
- **Primary Tool**: `AccessService`, `EncryptionService`.
- **Single Record Access**: Can access a record only if a `Wrapped_Key` exists in the ACL for their public key.
- **Multiple Records Access**: Can query the ACL to list all records they have been granted access to.
- **Decryption Flow**: Retrieve `Wrapped_Key` -> Unwrap with Private Key -> Decrypt Blob with `Unwrapped_Key`.

### 3. B2B / Administrator (The Analytics Platform)
- **Primary Tool**: `ProxyService`, `db.getAllClinicalRecords()`.
- **Data Access**: Can see all records in the `clinical_vault` table.
- **PII Protection**: Records are linked to an `Internal_ID` (UUID), not a `Wallet_Address`.
- **Data Visibility**: Can see clinical metadata and encrypted blobs, but cannot read the content (Zero-Knowledge).
- **Use Case**: Research, population health analytics, system maintenance.

---

## Governance Rules
1. **Ownership**: Data is owned by the patient; the platform acts as a custodian.
2. **Access Revocation**: Patients can instantly revoke any Doctor's access by deleting the corresponding entry from the Access Control List (ACL).
3. **Auditability**: All access grants are recorded in the ACL, providing a clear audit trail of who had access to what and when.
