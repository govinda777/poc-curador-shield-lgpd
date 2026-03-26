/**
 * Level 01: Vault-Proxy Pattern
 * Reference: Saltzer & Schroeder (1975) - Separation of Privileges.
 * Purpose: Decouple PII from Clinical Records to ensure Anonymization.
 */

import { db, Identity, ClinicalRecord } from '../src/db.mjs';

export class ProxyService {
    /**
     * Maps an external identity (e.g., Wallet) to an internal UUID.
     * This internal UUID is what gets stored in clinical records,
     * acting as an anonymized pointer.
     */
    static async getOrCreateInternalId(walletAddress: string): Promise<string> {
        let identity = await db.getIdentityByWallet(walletAddress);
        if (!identity) {
            identity = await db.createIdentity(walletAddress);
        }
        return identity.internal_id;
    }

    /**
     * Stores clinical data by referencing the internal UUID.
     * The PII (Identity) and Clinical Data (Vault) are in separate "silos".
     */
    static async storeClinicalData(
        walletAddress: string,
        payload: { encrypted_blob: string; iv: string; auth_tag: string; data_hash: string }
    ): Promise<ClinicalRecord> {
        const patientId = await this.getOrCreateInternalId(walletAddress);
        return db.saveClinicalRecord({
            patient_id: patientId,
            ...payload
        });
    }

    /**
     * Fetches clinical records without exposing the PII.
     * A B2B analytics layer would use this function to work with
     * populations of data without knowing WHO the patient is.
     */
    static async getAnonymizedRecords(walletAddress: string): Promise<ClinicalRecord[]> {
        const patientId = await this.getOrCreateInternalId(walletAddress);
        return db.getClinicalRecordsByPatient(patientId);
    }

    /**
     * Demonstrates the decoupling: Retrieving the identity from the record.
     * In a strict Vault-Proxy, this requires higher privilege.
     */
    static async getIdentityFromRecord(record: ClinicalRecord): Promise<Identity | undefined> {
        return db.getIdentity(record.patient_id);
    }
}
