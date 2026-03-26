# Level 03: Granular Proxy Re-Encryption (B2B Governance focus)

## Theoretical Foundation
- **Reference**: Warren & Brandeis (1890) - *"The Right to Privacy"*.
- **Principle**: **Wrapped Key Access**.

## Objective
To facilitate B2B governance where patients can share specific data "envelopes" with authorized doctors or partners without revealing their master key. This allows for a dynamic social control over personal data.

## How it works (The "How")
1. **Wrapped Key Sharing**: Instead of sharing the Master Key, the patient encrypts the specific `Record_Key` with the Doctor's Public Key. This creates a "Wrapper".
2. **Access Control List (ACL)**: This wrapper is stored in the `access_control_list` table.
3. **Decryption on Demand**: The Doctor retrieves the wrapper, decrypts it with their Private Key, and then uses the resulting `Record_Key` to decrypt the clinical record.
4. **Instant Revocation**: To "revoke" access, the patient simply deletes the wrapper entry in the database. Without the wrapper, the Doctor has no way to obtain the `Record_Key`.

## LGPD Mapping
- **Art. 13 (Portability)**: The user has the power to "carry" their data to different doctors by simply creating new key wrappers.
- **Data Sovereignty**: The B2B platform facilitates this exchange but **never sees the decrypted content** or the keys involved.

## Implementation Details
The `AccessService.ts` demonstrates the lifecycle of granting, using, and revoking wrapped keys.
