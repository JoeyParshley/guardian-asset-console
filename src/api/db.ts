// create an in memory database for the application
import type { Asset, AuditLog, Incident, Scan } from "../domain/types";
import { DEFAULT_SEED_DATA } from "../data/seed";

// create a database class that will encapsulate the data and methods in one place
class Database {
    // tables - just arrays in memory
    private assets: Asset[] = [];
    private scans: Scan[] = [];
    private incidents: Incident[] = [];
    private auditLogs: AuditLog[] = [];

    // add an initialize method that loads the seed data
    initialize(seedData = DEFAULT_SEED_DATA) {
        // use spread operator to creat copies and not mutate the original data
        this.assets = [...seedData.assets];
        this.scans = [...seedData.scans];
        this.incidents = [...seedData.incidents];
        this.auditLogs = [...seedData.auditLogs];
    }

    // add query methods
    getAssets(): Asset[] {
        // return a copy so callers can't mutate the original
        return [...this.assets];
    }

    getScans(): Scan[] {
        return [...this.scans];
    }

    getIncidents(): Incident[] {
        return [...this.incidents];
    }

    getAuditLogs(): AuditLog[] {
        return [...this.auditLogs];
    }

    // get one item by id
    getAssetById(id: string): Asset | undefined {
        // Array.find() returns the first match or undefined
        return this.assets.find(asset => asset.id === id);
    }
    
    getScansByAssetId(assetId: string): Scan[] {
        return this.scans
            .filter(scan => scan.assetId === assetId)
            .sort((a, b) => 
                new Date(b.scannedAt).getTime() - new Date(a.scannedAt).getTime()
            );
    }

    getIncidentsByAssetId(assetId: string): Incident[] {
        return this.incidents
            .filter(incident => incident.assetId === assetId)
            .sort((a, b) => 
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
    }

    getAuditLogsByAssetId(assetId: string): AuditLog[] {
        return this.auditLogs.filter(auditLog => auditLog.resourceId === assetId);
    }

    getScanById(id: string): Scan | undefined {
        return this.scans.find(scan => scan.id === id);
    }

    getIncidentById(id: string): Incident | undefined {
        return this.incidents.find(incident => incident.id === id);
    }

    getAuditLogById(id: string): AuditLog | undefined {
        return this.auditLogs.find(auditLog => auditLog.id === id);
    }

    // add mutation methods
    createScan(scan: Omit<Scan, 'id'>): Scan {
        // generate a new id
        const newScan: Scan = {
            ...scan,
            id: `scan-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
        };
        // add to the array
        this.scans.push(newScan);

        // Update the asset's lastSeenAt if this scan is newer
        const asset = this.getAssetById(scan.assetId);
        if (asset) {
          const scanTime = new Date(scan.scannedAt).getTime();
          const currentLastSeen = new Date(asset.lastSeenAt).getTime();
          if (scanTime > currentLastSeen) {
            asset.lastSeenAt = scan.scannedAt;
          }
        }
        
        return newScan;
    }

    resolveIncident(
        assetId: string,
        resolvedBy: string,
        resolutionReason: string
    ): Incident {
        // Find all unresolved incidents for this asset
        const unresolvedIncidents = this.incidents.filter(
            inc => inc.assetId === assetId && !inc.resolvedAt
        );
        
        // Get the most recent one (newest first)
        const incident = unresolvedIncidents
            .sort((a, b) => 
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            )[0];
        
        if (!incident) {
            throw new Error(`No unresolved incident found for asset ${assetId}`);
        }
        
        // Update the incident
        incident.resolvedAt = new Date().toISOString();
        incident.resolvedBy = resolvedBy;
        incident.resolutionReason = resolutionReason;
        
        // Update the asset status
        const asset = this.getAssetById(assetId);
        if (asset) {
            asset.status = 'resolved';
        }
        
        // Create audit log entry
        const auditLog: AuditLog = {
            id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            userId: resolvedBy,
            action: 'incident.resolve',
            resourceType: 'incident',
            resourceId: incident.id,
            details: {
                assetId,
                incidentId: incident.id,
                resolutionReason,
            },
            timestamp: new Date().toISOString(),
        };
        
        this.auditLogs.unshift(auditLog);
        
        return incident;
    }

    /**
     * Create a new audit log entry
     * Useful for logging other actions besides incident resolution
     */
    createAuditLog(log: Omit<AuditLog, 'id'>): AuditLog {
        const newLog: AuditLog = {
            ...log,
            id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        };
        
        this.auditLogs.unshift(newLog); // Add to beginning (newest first)
        return newLog;
    }

    /**
     * Reset database to initial seed data
     * Useful for testing
     */
    reset() {
        this.initialize();
    }
}

// export a singleton instance so all handlers can access the same database instance
export const db = new Database();

// initialize the database with the seed data
db.initialize();