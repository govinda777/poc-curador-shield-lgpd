/**
 * Mock Database Client for Sovereign Guardian POC
 * This simulates the interaction with Neon (Postgres) to demonstrate
 * the architectural patterns without requiring a live connection.
 */

import { v4 as uuidv4 } from 'uuid';

export interface Identity {
    internal_id: string;
    external_wallet_address: string;
    full_name_encrypted?: string;
    email_encrypted?: string;
    created_at: Date;
}

export interface ClinicalRecord {
    record_id: string;
    patient_id: string;
    encrypted_blob: string;
    iv: string;
    auth_tag: string;
    data_hash: string;
    created_at: Date;
}

export interface ACLNode {
    access_id: string;
    record_id: string;
    grantor_id: string;
    grantee_public_key: string;
    wrapped_key: string;
    metadata?: string;
    created_at: Date;
}

class MockDB {
    private identities: Map<string, Identity> = new Map();
    private clinicalVault: Map<string, ClinicalRecord> = new Map();
    private acl: Map<string, ACLNode> = new Map();

    // Level 01: Vault Proxy Logic
    async createIdentity(walletAddress: string): Promise<Identity> {
        const id = uuidv4();
        const identity: Identity = {
            internal_id: id,
            external_wallet_address: walletAddress,
            created_at: new Date()
        };
        this.identities.set(id, identity);
        return identity;
    }

    async getIdentityByWallet(walletAddress: string): Promise<Identity | undefined> {
        return Array.from(this.identities.values()).find(i => i.external_wallet_address === walletAddress);
    }

    async getIdentity(id: string): Promise<Identity | undefined> {
        return this.identities.get(id);
    }

    // Level 02: Clinical Vault Storage
    async saveClinicalRecord(record: Omit<ClinicalRecord, 'record_id' | 'created_at'>): Promise<ClinicalRecord> {
        const record_id = uuidv4();
        const fullRecord: ClinicalRecord = {
            ...record,
            record_id,
            created_at: new Date()
        };
        this.clinicalVault.set(record_id, fullRecord);
        return fullRecord;
    }

    async getClinicalRecord(recordId: string): Promise<ClinicalRecord | undefined> {
        return this.clinicalVault.get(recordId);
    }

    async getClinicalRecordsByPatient(patientId: string): Promise<ClinicalRecord[]> {
        return Array.from(this.clinicalVault.values()).filter(r => r.patient_id === patientId);
    }

    async getAllClinicalRecords(): Promise<ClinicalRecord[]> {
        return Array.from(this.clinicalVault.values());
    }

    async getAllIdentities(): Promise<Identity[]> {
        return Array.from(this.identities.values());
    }

    // Level 03: ACL sharing
    async grantAccess(node: Omit<ACLNode, 'access_id' | 'created_at'>): Promise<ACLNode> {
        const access_id = uuidv4();
        const fullNode: ACLNode = {
            ...node,
            access_id,
            created_at: new Date()
        };
        this.acl.set(access_id, fullNode);
        return fullNode;
    }

    async getACLForGrantee(granteePublicKey: string): Promise<ACLNode[]> {
        return Array.from(this.acl.values()).filter(a => a.grantee_public_key === granteePublicKey);
    }

    async getACLForGrantor(grantorId: string): Promise<ACLNode[]> {
        return Array.from(this.acl.values()).filter(a => a.grantor_id === grantorId);
    }

    async revokeAccess(accessId: string): Promise<boolean> {
        return this.acl.delete(accessId);
    }
}

export const db = new MockDB();
