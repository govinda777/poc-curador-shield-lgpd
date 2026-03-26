/**
 * Level 03: Granular Proxy Re-Encryption (B2B Governance focus)
 * Reference: Warren & Brandeis (1890) - "The Right to Privacy".
 * Principle: Wrapped Key Access.
 */

import * as crypto from 'crypto';
import { db, ACLNode, ClinicalRecord } from '../src/db.mjs';

export class AccessService {
    /**
     * Patient wraps the Record Key with the Doctor's Public Key.
     * This simulates ECIES (Elliptic Curve Integrated Encryption Scheme).
     * In this POC, we use RSA for simplicity in demonstrating the "Wrapper" pattern.
     */
    static async wrapKeyForDoctor(
        patientWallet: string,
        recordId: string,
        doctorPublicKey: string,
        recordKey: string // The key used for AES-256-GCM
    ): Promise<ACLNode> {
        const patientIdentity = await db.getIdentityByWallet(patientWallet);
        if (!patientIdentity) throw new Error("Patient not found");

        // Simulate wrapping the recordKey with doctor's public key
        // In a real ECIES flow, this would be done client-side.
        const wrappedKey = Buffer.from(
            crypto.publicEncrypt(doctorPublicKey, Buffer.from(recordKey))
        ).toString('base64');

        return db.grantAccess({
            record_id: recordId,
            grantor_id: patientIdentity.internal_id,
            grantee_public_key: doctorPublicKey,
            wrapped_key: wrappedKey,
            metadata: "B2B_CONSULTATION_ACTIVE"
        });
    }

    /**
     * Revokes access by deleting the wrapper entry in the database.
     * Once deleted, the B2B platform or Doctor can no longer access
     * the decryption key.
     */
    static async revokeDoctorAccess(accessId: string): Promise<boolean> {
        return db.revokeAccess(accessId);
    }

    /**
     * Simulated Doctor's flow:
     * 1. Get the wrapped key from the ACL.
     * 2. Decrypt it using Doctor's Private Key.
     * 3. Use the result to decrypt the Clinical Record.
     */
    static async unwrapKey(wrappedKey: string, doctorPrivateKey: string): Promise<string> {
        const decryptedKey = crypto.privateDecrypt(
            doctorPrivateKey,
            Buffer.from(wrappedKey, 'base64')
        );
        return decryptedKey.toString();
    }

    /**
     * Retrieves all records that a doctor has access to based on their public key.
     */
    static async getAccessibleRecordsForDoctor(doctorPublicKey: string): Promise<ACLNode[]> {
        return db.getACLForGrantee(doctorPublicKey);
    }

    /**
     * Retrieves all access grants given by a patient.
     */
    static async getGrantsByPatient(patientWallet: string): Promise<ACLNode[]> {
        const patientIdentity = await db.getIdentityByWallet(patientWallet);
        if (!patientIdentity) return [];
        return db.getACLForGrantor(patientIdentity.internal_id);
    }
}
