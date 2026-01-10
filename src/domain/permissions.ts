import type { Role } from './types';

/**
 * Permission actions that can be checked
 */
export type PermissionAction =
  | 'view_assets'
  | 'view_asset_detail'
  | 'resolve_incident'
  | 'view_audit'
  | 'create_scan'
  | 'filter_assets'
  | 'search_assets';

/**
 * Check if a role has permission to perform an action
 */
export function can(role: Role, action: PermissionAction): boolean {
  // Admin can do everything
  if (role === 'admin') {
    return true;
  }

  // Operator permissions
  if (role === 'operator') {
    return [
      'view_assets',
      'view_asset_detail',
      'filter_assets',
      'search_assets',
      'create_scan',
    ].includes(action);
  }

  // Auditor permissions (read-only)
  if (role === 'auditor') {
    return [
      'view_assets',
      'view_asset_detail',
      'view_audit',
      'filter_assets',
      'search_assets',
    ].includes(action);
  }

  return false;
}

/**
 * Get all actions a role can perform
 */
export function getRolePermissions(role: Role): PermissionAction[] {
  const allActions: PermissionAction[] = [
    'view_assets',
    'view_asset_detail',
    'resolve_incident',
    'view_audit',
    'create_scan',
    'filter_assets',
    'search_assets',
  ];

  return allActions.filter((action) => can(role, action));
}
