import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../api/db';
import { setClientConfig, listAuditLogs, resolveIncident } from '../api/client';

describe('Audit Behavior', () => {
  beforeEach(() => {
    // Reset database before each test
    db.reset();
  });

  describe('Audit log creation on incident resolution', () => {
    it('creates an audit log entry when an incident is resolved', async () => {
      // Set up as admin (required for resolve_incident)
      setClientConfig({ role: 'admin', userId: 'admin-001' });

      // Get an asset with an unresolved incident
      const assets = db.getAssets();
      const assetWithIncident = assets.find((asset) => {
        const incidents = db.getIncidentsByAssetId(asset.id);
        return incidents.some((inc) => !inc.resolvedAt);
      });

      // Skip test if no asset with unresolved incident
      if (!assetWithIncident) {
        console.log('No asset with unresolved incident found, skipping test');
        return;
      }

      // Get initial audit log count
      const initialLogs = db.getAuditLogs();
      const initialCount = initialLogs.length;

      // Resolve the incident
      await resolveIncident(assetWithIncident.id, { reason: 'Test resolution' });

      // Check that an audit log was created
      const newLogs = db.getAuditLogs();
      expect(newLogs.length).toBe(initialCount + 1);

      // Verify the audit log details
      const latestLog = newLogs[0]; // Logs are unshifted, so newest is first
      expect(latestLog.action).toBe('incident.resolve');
      expect(latestLog.userId).toBe('admin-001');
      expect(latestLog.resourceType).toBe('incident');
      expect(latestLog.details?.resolutionReason).toBe('Test resolution');
    });

    it('audit log includes asset ID in details', async () => {
      setClientConfig({ role: 'admin', userId: 'admin-001' });

      const assets = db.getAssets();
      const assetWithIncident = assets.find((asset) => {
        const incidents = db.getIncidentsByAssetId(asset.id);
        return incidents.some((inc) => !inc.resolvedAt);
      });

      if (!assetWithIncident) {
        return;
      }

      await resolveIncident(assetWithIncident.id, { reason: 'Test resolution' });

      const newLogs = db.getAuditLogs();
      const latestLog = newLogs[0];

      expect(latestLog.details?.assetId).toBe(assetWithIncident.id);
    });
  });

  describe('Audit log API access control', () => {
    it('admin can fetch audit logs', async () => {
      setClientConfig({ role: 'admin', userId: 'admin-001' });

      const logs = await listAuditLogs();
      expect(Array.isArray(logs)).toBe(true);
    });

    it('auditor can fetch audit logs', async () => {
      setClientConfig({ role: 'auditor', userId: 'auditor-001' });

      const logs = await listAuditLogs();
      expect(Array.isArray(logs)).toBe(true);
    });

    it('operator cannot fetch audit logs (403)', async () => {
      setClientConfig({ role: 'operator', userId: 'operator-001' });

      await expect(listAuditLogs()).rejects.toThrow(/Forbidden/);
    });
  });

  describe('Audit log filtering', () => {
    it('can filter audit logs by action', async () => {
      setClientConfig({ role: 'admin', userId: 'admin-001' });

      // First ensure there's at least one resolve action in logs
      const assets = db.getAssets();
      const assetWithIncident = assets.find((asset) => {
        const incidents = db.getIncidentsByAssetId(asset.id);
        return incidents.some((inc) => !inc.resolvedAt);
      });

      if (assetWithIncident) {
        await resolveIncident(assetWithIncident.id, { reason: 'Test resolution for filtering' });
      }

      const filteredLogs = await listAuditLogs({ action: 'incident.resolve' });

      // All returned logs should have the filtered action
      filteredLogs.forEach((log) => {
        expect(log.action).toBe('incident.resolve');
      });
    });

    it('can filter audit logs by userId', async () => {
      setClientConfig({ role: 'admin', userId: 'admin-001' });

      // Create an action as admin-001
      const assets = db.getAssets();
      const assetWithIncident = assets.find((asset) => {
        const incidents = db.getIncidentsByAssetId(asset.id);
        return incidents.some((inc) => !inc.resolvedAt);
      });

      if (assetWithIncident) {
        await resolveIncident(assetWithIncident.id, { reason: 'Test resolution' });
      }

      const filteredLogs = await listAuditLogs({ userId: 'admin-001' });

      // All returned logs should have the filtered userId
      filteredLogs.forEach((log) => {
        expect(log.userId).toBe('admin-001');
      });
    });

    it('can filter audit logs by resourceType', async () => {
      setClientConfig({ role: 'admin', userId: 'admin-001' });

      const filteredLogs = await listAuditLogs({ resourceType: 'incident' });

      // All returned logs should have the filtered resourceType
      filteredLogs.forEach((log) => {
        expect(log.resourceType).toBe('incident');
      });
    });

    it('can limit audit logs', async () => {
      setClientConfig({ role: 'admin', userId: 'admin-001' });

      const limitedLogs = await listAuditLogs({ limit: 5 });

      expect(limitedLogs.length).toBeLessThanOrEqual(5);
    });
  });

  describe('Database audit log operations', () => {
    it('createAuditLog adds entry to beginning of array', () => {
      const initialLength = db.getAuditLogs().length;

      const newLog = db.createAuditLog({
        userId: 'test-user',
        action: 'test.action',
        resourceType: 'test',
        resourceId: 'test-123',
        timestamp: new Date().toISOString(),
      });

      const logs = db.getAuditLogs();

      // Should be added
      expect(logs.length).toBe(initialLength + 1);

      // Should be at the beginning
      expect(logs[0].id).toBe(newLog.id);
    });

    it('audit logs have unique IDs', () => {
      const log1 = db.createAuditLog({
        userId: 'test-user',
        action: 'test.action',
        resourceType: 'test',
        resourceId: 'test-123',
        timestamp: new Date().toISOString(),
      });

      const log2 = db.createAuditLog({
        userId: 'test-user',
        action: 'test.action',
        resourceType: 'test',
        resourceId: 'test-456',
        timestamp: new Date().toISOString(),
      });

      expect(log1.id).not.toBe(log2.id);
    });
  });
});
