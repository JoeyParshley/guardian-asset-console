# Guardian Asset Console

A production-grade React + TypeScript logistics console for RFID asset tracking across distributed sites. This application demonstrates secure design patterns suitable for regulated environments.

> **Disclaimer**: This is a demonstration application with an informal mapping to FedRAMP controls. It is not FedRAMP certified and should not be used for actual FedRAMP compliance without proper assessment and authorization.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [Security Architecture](#security-architecture)
  - [Role-Based Access Control](#role-based-access-control)
  - [Audit Logging](#audit-logging)
  - [Data Classification](#data-classification)
- [FedRAMP Control Mapping](#fedramp-control-mapping-informal)
- [Testing](#testing)
- [Project Structure](#project-structure)

---

## Overview

Guardian Asset Console provides a secure, calm investigation workflow for tracking physical assets via RFID across multiple sites. The application supports:

- Real-time asset visibility with status tracking
- Incident detection and resolution workflows
- Comprehensive audit trail for sensitive actions
- Role-segregated access for operators, administrators, and auditors

## Features

- **Master/Detail Investigation Workflow**: Efficiently triage assets using filters and search, then investigate details in context
- **Asset Status Tracking**: Monitor assets across states (active, missing, anomaly, resolved)
- **Severity Classification**: Prioritize incidents by severity (critical, high, medium, low, info)
- **Incident Resolution**: Admin-only workflow requiring documented resolution reasons
- **Audit Log Viewer**: Auditor-accessible log of all sensitive actions
- **Scan Simulator**: Testing tool for simulating RFID scan events and anomalies

## Technology Stack

| Category | Technology |
|----------|------------|
| Framework | React 19 + TypeScript |
| Build Tool | Vite |
| UI Components | Material UI (MUI) + MUI DataGrid |
| State Management | Zustand (session), React Query (server state) |
| Mock API | MSW (Mock Service Worker) |
| Testing | Vitest + React Testing Library |
| Date Handling | date-fns |

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
npm install
```

### Development Server

```bash
npm run dev
```

### Run Tests

```bash
npm test
```

### Build for Production

```bash
npm run build
```

---

## Security Architecture

### Role-Based Access Control

Guardian implements a three-role RBAC model with least-privilege access:

| Role | Description | Permissions |
|------|-------------|-------------|
| **Operator** | Day-to-day asset tracking | View assets, view details, filter/search, create scans |
| **Admin** | Full system access | All operator permissions + resolve incidents + view audit |
| **Auditor** | Compliance review | View assets, view details, filter/search, view audit (read-only) |

#### Permission Matrix

| Action | Operator | Admin | Auditor |
|--------|:--------:|:-----:|:-------:|
| `view_assets` | Yes | Yes | Yes |
| `view_asset_detail` | Yes | Yes | Yes |
| `filter_assets` | Yes | Yes | Yes |
| `search_assets` | Yes | Yes | Yes |
| `create_scan` | Yes | Yes | No |
| `resolve_incident` | No | **Yes** | No |
| `view_audit` | No | Yes | Yes |

#### Implementation

- Role is transmitted via `x-guardian-role` request header
- Server-side handlers validate permissions before executing actions
- UI components conditionally render based on `can(role, action)` helper
- 403 Forbidden returned for unauthorized requests

### Audit Logging

All sensitive actions generate immutable audit log entries containing:

| Field | Description |
|-------|-------------|
| `id` | Unique log entry identifier |
| `userId` | User who performed the action |
| `action` | Action type (e.g., `incident.resolve`) |
| `resourceType` | Type of resource affected |
| `resourceId` | Identifier of affected resource |
| `details` | Additional context (e.g., resolution reason) |
| `timestamp` | ISO8601 UTC timestamp |

#### Audited Actions

- `incident.resolve` - Incident resolution with reason and asset context

### Data Classification

| Data Type | Classification | Handling |
|-----------|---------------|----------|
| Asset metadata | Unclassified | Standard access controls |
| Audit logs | Sensitive | Restricted to Admin/Auditor |
| Resolution reasons | Sensitive | Required for compliance |

---

## FedRAMP Control Mapping (Informal)

This section provides an informal mapping of Guardian's security features to FedRAMP control families. This is for educational purposes and does not constitute a formal Security Assessment Report (SAR).

### AC - Access Control

| Control | Implementation |
|---------|---------------|
| AC-2 Account Management | Role assignment via session store with explicit role types |
| AC-3 Access Enforcement | `can()` permission helper enforces action-level authorization |
| AC-5 Separation of Duties | Operator cannot resolve incidents; Auditor cannot modify data |
| AC-6 Least Privilege | Each role has minimum permissions needed for function |

### AU - Audit and Accountability

| Control | Implementation |
|---------|---------------|
| AU-2 Audit Events | Sensitive actions (incident resolution) generate audit entries |
| AU-3 Content of Audit Records | Logs include who, what, when, and context details |
| AU-6 Audit Review | Auditor role can view and filter audit logs |
| AU-9 Protection of Audit Information | Audit logs are append-only; no delete capability exposed |
| AU-12 Audit Generation | Server handlers automatically emit audit events |

### IA - Identification and Authentication

| Control | Implementation |
|---------|---------------|
| IA-2 Identification and Authentication | User ID transmitted with role in session context |
| IA-8 Identification (Non-Org Users) | Mock implementation; production would integrate IdP |

### SC - System and Communications Protection

| Control | Implementation |
|---------|---------------|
| SC-8 Transmission Confidentiality | Production deployment would use HTTPS (mock uses localhost) |
| SC-13 Cryptographic Protection | Timestamps use ISO8601 UTC for integrity |

### SI - System and Information Integrity

| Control | Implementation |
|---------|---------------|
| SI-4 Information System Monitoring | Audit log provides activity monitoring |
| SI-10 Information Input Validation | TypeScript types enforce data structure validity |

### CM - Configuration Management

| Control | Implementation |
|---------|---------------|
| CM-7 Least Functionality | UI renders only permitted actions per role |
| CM-8 Information System Component Inventory | Asset inventory with full metadata tracking |

---

## Testing

Guardian includes a comprehensive test suite covering security-critical functionality:

### Test Coverage

| Test File | Coverage Area |
|-----------|--------------|
| `filtering.test.tsx` | Filter controls, search behavior, clear functionality |
| `selection.test.tsx` | Asset selection, detail panel loading, state transitions |
| `rbac.test.tsx` | Permission enforcement for all roles |
| `audit.test.tsx` | Audit log creation, access control, filtering |

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Architecture

- **MSW Server**: Mock API runs in test environment
- **Deterministic Seed Data**: Fixed RNG seed ensures stable tests
- **Provider Wrapper**: Tests include QueryClient and ThemeProvider

---

## Project Structure

```
src/
  api/           # MSW handlers, client functions, in-memory DB
  app/           # App shell, theme configuration
  components/
    assets/      # Asset table, filters, detail panel, dialogs
    audit/       # Audit log table and detail drawer
    layout/      # Main layout components
    simulator/   # Scan form and simulator controls
  data/          # Seed data generation
  domain/        # Types and permission helpers
  pages/         # Page components (Console, Audit, Simulator)
  store/         # Zustand session store
  test/          # Test utilities and setup
  utils/         # Time formatting, severity helpers
```

---

## API Endpoints

| Method | Endpoint | Description | Required Role |
|--------|----------|-------------|---------------|
| GET | `/api/assets` | List assets with filtering | Any |
| GET | `/api/assets/:id` | Get asset details with timeline | Any |
| POST | `/api/scans` | Create scan event | Operator, Admin |
| POST | `/api/incidents/:assetId/resolve` | Resolve incident | Admin |
| GET | `/api/audit` | List audit logs | Admin, Auditor |
| POST | `/api/incidents` | Create incident (simulator) | Any |

---

## Limitations

This demonstration application has the following limitations:

1. **No Persistent Storage**: Data resets on page reload (in-memory only)
2. **Mock Authentication**: Role is user-selectable, not authenticated
3. **No Encryption at Rest**: Browser storage is unencrypted
4. **Single-Tenant**: No multi-organization support
5. **No Real RFID Integration**: Scans are simulated

For production use in a FedRAMP environment, additional controls would be required including:

- Integration with FedRAMP-authorized identity provider
- Encrypted data storage
- Network security controls
- Continuous monitoring
- Incident response procedures
- Configuration management

---

## License

This project is for demonstration purposes.

---

## Contact

For questions about this demonstration, please open an issue in the repository.
