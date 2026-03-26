# Level 01: The Vault-Proxy Pattern (Anonymization Focus)

## Theoretical Foundation
- **Reference**: Saltzer & Schroeder (1975) - *"The Protection of Information in Computer Systems"*.
- **Principle**: **Separation of Privileges**.

## Objective
To decouple **Personally Identifiable Information (PII)** from clinical records using a dual-silo architecture. This ensures that even if one database layer is compromised, the relationship between a record and a real-world human remains obscured.

## How it works (The "How")
1. **Identity Mapping**: When a user connects via Privy, the `ProxyService` maps their public wallet address to an internal, random UUID.
2. **Clinical Storage**: Clinical data is stored in the `clinical_vault` using the internal UUID, never the public wallet address.
3. **Anonymized Queries**: B2B analytics or researchers can query clinical records by internal ID. They can analyze medical patterns without ever knowing the patient's identity.

## LGPD Mapping
- **Art. 6 (Finality/Necessity)**: We only expose the internal ID needed for the clinical operation, satisfying the principle of data minimization.
- **Art. 12 (Anonymization)**: By breaking the link between identity and clinical data, the records are considered anonymized for external B2B processing, reducing legal liability.

## Access Patterns
- **Single Record**: `ProxyService.getRecordById(recordId)` retrieves a specific clinical entry.
- **Multiple Records**: `ProxyService.getAnonymizedRecords(walletAddress)` returns all records linked to a specific patient wallet.
- **B2B Global Vision**: `db.getAllClinicalRecords()` allows an administrator to view all records in an anonymized format.

## Implementation Details
The `ProxyService.ts` implements the mediation layer that ensures this separation.
