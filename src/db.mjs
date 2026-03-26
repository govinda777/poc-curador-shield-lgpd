/**
 * Mock Database Client for Sovereign Guardian POC
 * This simulates the interaction with Neon (Postgres) to demonstrate
 * the architectural patterns without requiring a live connection.
 */
import { v4 as uuidv4 } from 'uuid';
class MockDB {
    identities = new Map();
    clinicalVault = new Map();
    acl = new Map();
    // Level 01: Vault Proxy Logic
    async createIdentity(walletAddress) {
        const id = uuidv4();
        const identity = {
            internal_id: id,
            external_wallet_address: walletAddress,
            created_at: new Date()
        };
        this.identities.set(id, identity);
        return identity;
    }
    async getIdentityByWallet(walletAddress) {
        return Array.from(this.identities.values()).find(i => i.external_wallet_address === walletAddress);
    }
    async getIdentity(id) {
        return this.identities.get(id);
    }
    // Level 02: Clinical Vault Storage
    async saveClinicalRecord(record) {
        const record_id = uuidv4();
        const fullRecord = {
            ...record,
            record_id,
            created_at: new Date()
        };
        this.clinicalVault.set(record_id, fullRecord);
        return fullRecord;
    }
    async getClinicalRecord(recordId) {
        return this.clinicalVault.get(recordId);
    }
    async getClinicalRecordsByPatient(patientId) {
        return Array.from(this.clinicalVault.values()).filter(r => r.patient_id === patientId);
    }
    // Level 03: ACL sharing
    async grantAccess(node) {
        const access_id = uuidv4();
        const fullNode = {
            ...node,
            access_id,
            created_at: new Date()
        };
        this.acl.set(access_id, fullNode);
        return fullNode;
    }
    async getACLForGrantee(granteePublicKey) {
        return Array.from(this.acl.values()).filter(a => a.grantee_public_key === granteePublicKey);
    }
    async revokeAccess(accessId) {
        return this.acl.delete(accessId);
    }
}
export const db = new MockDB();
