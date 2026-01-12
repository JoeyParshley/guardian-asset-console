import { describe, it, expect } from 'vitest';
import { can, getRolePermissions } from '../domain/permissions';
import type { Role } from '../domain/types';

describe('RBAC Permissions', () => {
  describe('can() function', () => {
    it('admin can perform all actions', () => {
      const role: Role = 'admin';

      expect(can(role, 'view_assets')).toBe(true);
      expect(can(role, 'view_asset_detail')).toBe(true);
      expect(can(role, 'resolve_incident')).toBe(true);
      expect(can(role, 'view_audit')).toBe(true);
      expect(can(role, 'create_scan')).toBe(true);
      expect(can(role, 'filter_assets')).toBe(true);
      expect(can(role, 'search_assets')).toBe(true);
    });

    it('operator can view assets but not resolve incidents or view audit', () => {
      const role: Role = 'operator';

      // Can do
      expect(can(role, 'view_assets')).toBe(true);
      expect(can(role, 'view_asset_detail')).toBe(true);
      expect(can(role, 'create_scan')).toBe(true);
      expect(can(role, 'filter_assets')).toBe(true);
      expect(can(role, 'search_assets')).toBe(true);

      // Cannot do
      expect(can(role, 'resolve_incident')).toBe(false);
      expect(can(role, 'view_audit')).toBe(false);
    });

    it('auditor can view assets and audit but not resolve incidents or create scans', () => {
      const role: Role = 'auditor';

      // Can do
      expect(can(role, 'view_assets')).toBe(true);
      expect(can(role, 'view_asset_detail')).toBe(true);
      expect(can(role, 'view_audit')).toBe(true);
      expect(can(role, 'filter_assets')).toBe(true);
      expect(can(role, 'search_assets')).toBe(true);

      // Cannot do
      expect(can(role, 'resolve_incident')).toBe(false);
      expect(can(role, 'create_scan')).toBe(false);
    });
  });

  describe('getRolePermissions() function', () => {
    it('returns all permissions for admin', () => {
      const permissions = getRolePermissions('admin');

      expect(permissions).toContain('view_assets');
      expect(permissions).toContain('view_asset_detail');
      expect(permissions).toContain('resolve_incident');
      expect(permissions).toContain('view_audit');
      expect(permissions).toContain('create_scan');
      expect(permissions).toContain('filter_assets');
      expect(permissions).toContain('search_assets');
      expect(permissions.length).toBe(7);
    });

    it('returns correct permissions for operator', () => {
      const permissions = getRolePermissions('operator');

      expect(permissions).toContain('view_assets');
      expect(permissions).toContain('view_asset_detail');
      expect(permissions).toContain('create_scan');
      expect(permissions).toContain('filter_assets');
      expect(permissions).toContain('search_assets');
      expect(permissions).not.toContain('resolve_incident');
      expect(permissions).not.toContain('view_audit');
      expect(permissions.length).toBe(5);
    });

    it('returns correct permissions for auditor', () => {
      const permissions = getRolePermissions('auditor');

      expect(permissions).toContain('view_assets');
      expect(permissions).toContain('view_asset_detail');
      expect(permissions).toContain('view_audit');
      expect(permissions).toContain('filter_assets');
      expect(permissions).toContain('search_assets');
      expect(permissions).not.toContain('resolve_incident');
      expect(permissions).not.toContain('create_scan');
      expect(permissions.length).toBe(5);
    });
  });

  describe('Role-based access control logic', () => {
    it('only admin can resolve incidents', () => {
      const roles: Role[] = ['operator', 'admin', 'auditor'];
      const canResolve = roles.filter((role) => can(role, 'resolve_incident'));

      expect(canResolve).toEqual(['admin']);
    });

    it('only admin and auditor can view audit logs', () => {
      const roles: Role[] = ['operator', 'admin', 'auditor'];
      const canViewAudit = roles.filter((role) => can(role, 'view_audit'));

      expect(canViewAudit).toEqual(['admin', 'auditor']);
    });

    it('only operator and admin can create scans', () => {
      const roles: Role[] = ['operator', 'admin', 'auditor'];
      const canCreateScan = roles.filter((role) => can(role, 'create_scan'));

      expect(canCreateScan).toEqual(['operator', 'admin']);
    });

    it('all roles can view assets', () => {
      const roles: Role[] = ['operator', 'admin', 'auditor'];
      const canViewAssets = roles.filter((role) => can(role, 'view_assets'));

      expect(canViewAssets).toEqual(['operator', 'admin', 'auditor']);
    });
  });
});
