# Sovereign Guardian: Performance Benchmarks

This document outlines the performance characteristics of each security level in the Sovereign Guardian architecture. These benchmarks are based on the implementation provided in the POC.

## Level 01: Vault-Proxy (Anonymization)
**Operation**: Internal ID mapping and lookup.

| Metric | Complexity | Estimated Latency (Local Mock) | Notes |
|--------|------------|--------------------------------|-------|
| Wallet -> Internal ID | O(N) lookup in POC, O(1) in DB with Index | < 1ms | Primary key lookup on wallet address. |
| Record Retrieval | O(1) by Record ID, O(N) by Patient ID | < 2ms | Simple database queries. |

**Scalability**: High. Decoupling adds minimal overhead compared to standard database systems.

---

## Level 02: E2EE (Zero-Knowledge)
**Operation**: Client-side encryption/decryption using AES-256-GCM and PBKDF2.

| Metric | Complexity | Estimated Latency (Node.js) | Notes |
|--------|------------|-----------------------------|-------|
| Key Derivation (KDF) | O(Iterations) | ~100-200ms | PBKDF2 with 100,000 iterations (Security/Speed balance). |
| AES-256-GCM Encrypt | O(Data Size) | < 5ms (for 1MB) | Hardware-accelerated on most CPUs. |
| AES-256-GCM Decrypt | O(Data Size) | < 5ms (for 1MB) | Includes Auth Tag verification. |

**Scalability**: Excellent. Encryption workload is offloaded to the client (User Browser/App). The server only stores blobs.

---

## Level 03: Granular Access (Wrapped Keys)
**Operation**: Key wrapping with RSA-2048 (simulating ECIES).

| Metric | Complexity | Estimated Latency (Node.js) | Notes |
|--------|------------|-----------------------------|-------|
| Key Wrapping (RSA) | O(Key Length^3) | ~10-30ms | Public key encryption of the AES master key. |
| Key Unwrapping (RSA) | O(Key Length^3) | ~50-80ms | Private key decryption of the AES master key. |
| ACL Lookup | O(1) with Index | < 1ms | Querying the `access_control_list` table. |

**Scalability**: High. Each "share" operation requires one RSA encryption. Each "access" requires one RSA decryption.

---

## Global Performance Vision

| Actor | Access Mode | Total Overhead |
|-------|-------------|----------------|
| **Patient** | Single Record | 1 KDF + 1 AES Decrypt (~150ms) |
| **Patient** | Batch (10 Records) | 1 KDF + 10 AES Decrypt (~200ms) |
| **Doctor** | Single Record | 1 RSA Decrypt + 1 KDF + 1 AES Decrypt (~250ms) |
| **B2B/Admin** | Analytics | N/A (Data is anonymized, no decryption) |

*Note: In production, PBKDF2 iterations can be adjusted based on the required security posture and hardware capabilities.*
