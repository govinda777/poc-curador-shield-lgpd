# Level 02: End-to-End Encryption (E2EE) (Zero-Knowledge focus)

## Theoretical Foundation
- **Reference**: Kerckhoffs's Principle & Bruce Schneier’s *"Applied Cryptography"*.
- **Principle**: **Computational Sovereignty**.

## Objective
To ensure the server is an "untrusted" storage. Even if the Neon database is compromised, the content of clinical records remains encrypted. Data is encrypted client-side using a key derived from the user's Smart Wallet signature.

## How it works (The "How")
1. **Key Derivation (KDF)**: We use `PBKDF2` to derive a 256-bit AES key from a unique signature produced by the user's Privy Wallet. This signature is the "secret" that never leaves the user's control.
2. **Authenticated Encryption (AES-GCM)**: We use AES-256 in Galois/Counter Mode (GCM). This provides both confidentiality and **integrity** (via the Auth Tag).
3. **Data Integrity**: We also store a SHA-256 hash of the plaintext to verify that the record hasn't been tampered with or corrupted during transit/storage.

## Sigilo Hipocrático Digital
This architectural pattern satisfies the "Digital Hippocratic Oath":
- The server *stores* the data but *cannot read* it.
- The patient (and only the patient) holds the decryption "spark" (the wallet signature).

## Implementation Details
The `EncryptionService.ts` handles the PBKDF2 derivation and the AES-GCM encryption/decryption lifecycle.
