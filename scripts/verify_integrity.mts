/**
 * Sovereign Guardian POC: End-to-End Integrity Verification Script
 * This script simulates the full architectural flow across all three levels.
 */

import * as crypto from 'crypto';
import { ProxyService } from '../folder-01-vault-proxy/proxy_service.mjs';
import { EncryptionService } from '../folder-02-e2ee-privy/encryption_service.mjs';
import { AccessService } from '../folder-03-granular-access/access_service.mjs';
import { db } from '../src/db.mjs';

async function verifyPOC() {
    console.log("--- STARTING SOVEREIGN GUARDIAN POC VALIDATION ---\n");

    // --- SETUP: Patient & Doctor Wallets ---
    const PATIENT_WALLET = "0xPatient_Wallet_ABC_123";
    const PATIENT_SIGNATURE = "Privy_Signature_XYZ_789"; // Derived from user's wallet

    // Generate RSA Keys for the Doctor (Level 03 Simulation)
    const { publicKey: docPubKey, privateKey: docPrivKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: { type: 'spki', format: 'pem' },
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
    });

    const MEDICAL_REPORT = "Patient shows optimal recovery in spiritual and clinical levels. No further treatment needed.";

    // --- LEVEL 01: Vault-Proxy (Anonymization) ---
    console.log("[Level 01] Initializing Vault-Proxy...");
    const patientInternalId = await ProxyService.getOrCreateInternalId(PATIENT_WALLET);
    console.log(`- Patient Wallet: ${PATIENT_WALLET}`);
    console.log(`- Internal UUID: ${patientInternalId} (Decoupled from PII)\n`);

    // --- LEVEL 02: E2EE (Zero-Knowledge) ---
    console.log("[Level 02] Performing E2EE Client-Side Encryption...");
    const masterKey = EncryptionService.deriveKeyFromSignature(PATIENT_SIGNATURE);
    const encryptedPayload = EncryptionService.encryptClinicalBlob(MEDICAL_REPORT, masterKey);

    const record = await ProxyService.storeClinicalData(PATIENT_WALLET, encryptedPayload);
    console.log("- Data Encrypted with AES-256-GCM.");
    console.log(`- Record ID in Neon: ${record.record_id}`);
    console.log(`- Clinical Blob (Server View): ${record.encrypted_blob.substring(0, 20)}...\n`);

    // Verify Integrity (SHA-256)
    const currentHash = crypto.createHash('sha256').update(MEDICAL_REPORT).digest('hex');
    if (currentHash === record.data_hash) {
        console.log("✅ Data Integrity Verified: SHA-256 Hash matches.\n");
    } else {
        throw new Error("❌ Data Integrity Failure!");
    }

    // --- LEVEL 03: Granular Access (Wrapped Keys) ---
    console.log("[Level 03] Sharing access with Doctor via Wrapped Keys...");
    // The patient wraps the "Secret" (Signature/Key) for the Doctor
    const aclNode = await AccessService.wrapKeyForDoctor(
        PATIENT_WALLET,
        record.record_id,
        docPubKey,
        PATIENT_SIGNATURE // Using the signature as the "Master Key" to be wrapped
    );
    console.log("- Access Granted to Doctor.");
    console.log(`- Wrapped Key (ACL Entry): ${aclNode.wrapped_key.substring(0, 20)}...\n`);

    // Doctor Retrieval Flow
    console.log("[Level 03] Doctor Accessing the Record...");
    const doctorACL = await db.getACLForGrantee(docPubKey);
    const node = doctorACL[0];
    if (!node) throw new Error("ACL Node not found");

    const unwrappedSignature = await AccessService.unwrapKey(node.wrapped_key, docPrivKey);
    const doctorDerivedKey = EncryptionService.deriveKeyFromSignature(unwrappedSignature);

    const decryptedReport = EncryptionService.decryptClinicalBlob(record, doctorDerivedKey);
    console.log("- Doctor Decryption Success.");
    console.log(`- Decrypted Content: "${decryptedReport}"\n`);

    if (decryptedReport === MEDICAL_REPORT) {
        console.log("✅ POC Success: Clinical Record recovered securely by authorized party.\n");
    }

    // --- REVOCATION TEST ---
    console.log("[Revocation] Patient revoking access...");
    if (node) {
        await AccessService.revokeDoctorAccess(node.access_id);
    }
    const doctorACLPostRevoke = await db.getACLForGrantee(docPubKey);

    if (doctorACLPostRevoke.length === 0) {
        console.log("✅ Revocation Verified: Doctor no longer has access in the ACL.\n");
    }

    console.log("--- SOVEREIGN GUARDIAN POC VALIDATION COMPLETED ---");
}

verifyPOC().catch(err => {
    console.error("❌ POC Validation Failed:", err);
    process.exit(1);
});
