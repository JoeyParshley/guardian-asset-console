export type Role  = 'operator' | 'admin' | 'auditor';
export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type AssetStatus = 'active' | 'missing' | 'anomaly' | 'resolved';

export interface User {
    id: string;
    name: string;
    role: Role
}

export interface Asset {
    id: string;
    tagId: string;
    name: string;
    site: string;
    status: AssetStatus;
    severity: Severity
    lastSeenAt: string;
    createdAt: string;
    metadata?: Record<string, string>;
}

export interface Scan {
    id: string;
    assetId: string;
    site: string;
    scannedAt: string;
    readerId: string;
}

export interface Incident {
    id: string;
    assetId: string;
    severity: Severity;
    description: string;
    createdAt: string;
    resolvedAt?: string;
    resolvedBy?: string;
    resolutionReason?: string;
}

export interface AuditLog {
    id: string
    userId: string;
    action: string;
    resourceType: string;
    resourceId: string;
    details?: Record<string, any>;
    timestamp: string;
}