/**
 * Sovereign Guardian POC: Benchmark and Global Access Vision Script
 */
import * as crypto from 'crypto';
import { ProxyService } from '../folder-01-vault-proxy/proxy_service.mjs';
import { EncryptionService } from '../folder-02-e2ee-privy/encryption_service.mjs';
import { AccessService } from '../folder-03-granular-access/access_service.mjs';
import { db } from '../src/db.mjs';
async function runBenchmarkAndAccess() {
    console.log("=== SOVEREIGN GUARDIAN: BENCHMARK & GLOBAL ACCESS VISION ===\n");
    const PATIENT_WALLET = "0xSovereign_Patient";
    const PATIENT_SIGNATURE = "Patient_Signature_Master_Secret";
    const DOCTOR_WALLET = "0xExpert_Doctor";
    const { publicKey: docPubKey, privateKey: docPrivKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: { type: 'spki', format: 'pem' },
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
    });
    const recordsToCreate = 5;
    const records = [];
    console.log(`[Setup] Creating ${recordsToCreate} clinical records for Patient...`);
    for (let i = 1; i <= recordsToCreate; i++) {
        const report = `Clinical Report #${i}: Patient condition is stable. Monitoring telemetry.`;
        const masterKey = EncryptionService.deriveKeyFromSignature(PATIENT_SIGNATURE);
        const encrypted = EncryptionService.encryptClinicalBlob(report, masterKey);
        const saved = await ProxyService.storeClinicalData(PATIENT_WALLET, encrypted);
        records.push(saved.record_id);
    }
    console.log(`- Created ${recordsToCreate} records in the clinical vault.\n`);
    // --- 1. PATIENT ACCESS (Single vs Multiple) ---
    console.log("--- 1. PATIENT ACCESS VISION ---");
    const startPatient = performance.now();
    const patientMasterKey = EncryptionService.deriveKeyFromSignature(PATIENT_SIGNATURE);
    // Single record
    const singleRecord = await ProxyService.getRecordById(records[0]);
    const decryptedSingle = EncryptionService.decryptClinicalBlob(singleRecord, patientMasterKey);
    console.log(`[Single] Patient retrieved and decrypted record ${records[0].substring(0, 8)}...`);
    // Multiple records
    const allPatientRecords = await ProxyService.getAnonymizedRecords(PATIENT_WALLET);
    console.log(`[Batch] Patient retrieved ${allPatientRecords.length} records.`);
    allPatientRecords.forEach(r => {
        EncryptionService.decryptClinicalBlob(r, patientMasterKey);
    });
    const endPatient = performance.now();
    console.log(`- Patient Total Access Time: ${(endPatient - startPatient).toFixed(2)}ms\n`);
    // --- 2. DOCTOR ACCESS (Granular) ---
    console.log("--- 2. DOCTOR ACCESS VISION ---");
    console.log("[Setup] Patient sharing 2 records with Doctor...");
    await AccessService.wrapKeyForDoctor(PATIENT_WALLET, records[0], docPubKey, PATIENT_SIGNATURE);
    await AccessService.wrapKeyForDoctor(PATIENT_WALLET, records[1], docPubKey, PATIENT_SIGNATURE);
    const startDoctor = performance.now();
    const accessibleForDoctor = await AccessService.getAccessibleRecordsForDoctor(docPubKey);
    console.log(`[Batch] Doctor found ${accessibleForDoctor.length} accessible records in ACL.`);
    for (const node of accessibleForDoctor) {
        const record = await ProxyService.getRecordById(node.record_id);
        const unwrappedSig = await AccessService.unwrapKey(node.wrapped_key, docPrivKey);
        const docKey = EncryptionService.deriveKeyFromSignature(unwrappedSig);
        const decrypted = EncryptionService.decryptClinicalBlob(record, docKey);
        console.log(`- Doctor decrypted: ${decrypted.substring(0, 30)}...`);
    }
    const endDoctor = performance.now();
    console.log(`- Doctor Total Access Time: ${(endDoctor - startDoctor).toFixed(2)}ms\n`);
    // --- 3. B2B / ADMIN VISION (Anonymized) ---
    console.log("--- 3. B2B / ADMIN GLOBAL VISION ---");
    const allGlobalRecords = await db.getAllClinicalRecords();
    console.log(`[Global] Admin/B2B can see ${allGlobalRecords.length} total records in the system.`);
    console.log(`[Privacy] Admin view of first record:`);
    console.log(` - Patient Internal ID: ${allGlobalRecords[0].patient_id}`);
    console.log(` - Encrypted Blob: ${allGlobalRecords[0].encrypted_blob.substring(0, 30)}...`);
    console.log(` - (Admin cannot decrypt without patient/doctor keys)\n`);
    // --- 4. BENCHMARK SUMMARY ---
    console.log("--- 4. PERFORMANCE SUMMARY (Averages) ---");
    // PBKDF2 Benchmark
    const startKDF = performance.now();
    EncryptionService.deriveKeyFromSignature(PATIENT_SIGNATURE);
    const endKDF = performance.now();
    console.log(`- KDF (PBKDF2 100k): ${(endKDF - startKDF).toFixed(2)}ms`);
    // RSA Benchmark
    const startRSA = performance.now();
    const testWrap = Buffer.from(crypto.publicEncrypt(docPubKey, Buffer.from(PATIENT_SIGNATURE))).toString('base64');
    crypto.privateDecrypt(docPrivKey, Buffer.from(testWrap, 'base64'));
    const endRSA = performance.now();
    console.log(`- RSA Wrapper (Wrap+Unwrap): ${(endRSA - startRSA).toFixed(2)}ms`);
    console.log("\n=== BENCHMARK & ACCESS VISION COMPLETED ===");
}
runBenchmarkAndAccess().catch(console.error);
