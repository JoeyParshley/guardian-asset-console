# Guardian Asset Console — Build Checklist (Frontend-Only)

## Goal

Build a production-grade React + TypeScript logistics console that simulates RFID asset tracking across distributed sites with:

* Calm, trustworthy UI
* Master/detail investigation workflow
* RBAC (Operator/Admin/Auditor)
* Audit logging for sensitive actions
* Mock REST API + event ingestion simulator
* Unit + component tests
* FedRAMP/IL5-minded documentation

---

## Constraints

* Frontend-only (no real backend)
* Use React + TypeScript + Vite
* Use MUI (Material UI) + MUI DataGrid
* Use MSW (Mock Service Worker) to implement a realistic mock REST API
* Keep state simple: derived lists + local store where needed
* Avoid over-engineering (no Redux unless absolutely required)
* All timestamps stored as ISO8601 UTC strings

---

## Acceptance Criteria

* Operator can triage assets in <10 seconds (filter/search + select)
* Detail panel supports investigation (timeline + metadata + related events)
* Admin-only “Resolve incident” requires a reason and emits an audit event
* Auditor can view audit trail and filter it
* Mock API endpoints exist and UI uses async fetching
* Tests cover filtering, selection → detail updates, and RBAC/audit behavior
* README includes FedRAMP-style sections (informal mapping + secure design)

---

## Phase 0 — Repo + Bootstrap

### Steps
[ ] Create repo: `guardian-asset-console`
[ ] Scaffold app:

```bash
npm create vite@latest . -- --template react-ts
npm install
npm run dev
```

- [ ] Add deps:

```bash
npm i @mui/material @mui/icons-material @emotion/react @emotion/styled
npm i @mui/x-data-grid
npm i @tanstack/react-query
npm i msw
npm i date-fns
npm i zustand
npm i -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

- [ ] Add scripts (package.json):

  - [ ] `test` runs vitest
- [ ] Create folders:

```text
src/
  app/
  api/
  components/
    layout/
    assets/
    audit/
    simulator/
  data/
  domain/
  pages/
  store/
  styles/
  utils/
```

### Ask Claude (Cursor Prompt)

> Phase 0: apply changes directly. Add dependencies, update package scripts for vitest + jsdom, create folder structure, and verify dev server runs.

---

## Phase 1 — Domain Models + Seed Data

### Files to create

- [x] `src/domain/types.ts`
- [x] `src/domain/permissions.ts`
- [x] `src/data/seed.ts`
- [x] `src/utils/time.ts`
- [x] `src/utils/severity.ts`
- [x] `src/utils/filterSort.ts`

### Ask Claude

> Phase 1: create the domain types, permissions helper, and seed data generator. Make the seed data deterministic (fixed RNG seed) so tests are stable.

---

## Phase 2 — Mock API (MSW) + Client

### Endpoints

- [x] `GET /api/assets`
- [x] `GET /api/assets/:id`
- [x] `POST /api/scans`
- [x] `POST /api/incidents/:assetId/resolve`
- [x] `GET /api/audit`

### Files

- [x] `src/api/db.ts`
- [x] `src/api/handlers.ts`
- [x] `src/api/browser.ts`
- [x] `src/api/server.ts`
- [x] `src/api/client.ts`

### Ask Claude

> Phase 2: implement MSW mock REST API with an in-memory DB and typed client functions. Make role-based auth simulated via a request header `x-guardian-role` set by the UI.

---

## Phase 3 — App Shell + Theme

### Files

- [x] `src/app/theme.ts`
- [x] `src/app/AppShell.tsx`
- [x] `src/store/useSessionStore.ts`

### Ask Claude

> Phase 3: implement AppShell + theme with calm styling and a role selector. Persist role and theme. Ensure MUI DataGrid styling won’t look default.

---

## Phase 4 — Main Page Layout

### Files

- [x] `src/pages/AssetConsolePage.tsx`
- [x] `src/components/layout/MainLayout.tsx`
- [x] `src/components/assets/FiltersBar.tsx`
- [x] `src/components/assets/AssetTable.tsx`
- [x] `src/components/assets/AssetDetailPanel.tsx`

### Ask Claude

> Phase 4: implement the master/detail page skeleton with placeholder components and clean layout. No real data yet.

---

## Phase 5 — Data Fetching + Asset Table

### Files

- [ ] `src/components/assets/SeverityBadge.tsx`
- [ ] `src/components/assets/AssetTable.tsx`

### Ask Claude

> Phase 5: implement AssetTable using DataGrid with custom cells and calm styling. Wire it to listAssets() via React Query, including role header. Add selection behavior.

---

## Phase 6 — Filters + Derived UX

### Files

- [ ] Implement `FiltersBar.tsx`

### Ask Claude

> Phase 6: implement FiltersBar and wire it into the assets query. Keep state minimal and derived. Add empty states.

---

## Phase 7 — Detail Panel

### Files

- [ ] Implement `AssetDetailPanel.tsx`

### Ask Claude

> Phase 7: implement AssetDetailPanel with a calm investigation layout. Fetch asset detail via React Query. Include a timeline list and a related section.

---

## Phase 8 — RBAC Actions + Audit Events

### Files

- [ ] `src/components/assets/ResolveDialog.tsx`

### Ask Claude

>


---

## Phase 9 — Audit Log Page

### Files

- [ ] `src/pages/AuditLogPage.tsx`
- [ ] `src/components/audit/AuditTable.tsx`
- [ ] `src/components/audit/AuditDetailDrawer.tsx`

### Ask Claude

> Phase 9: implement AuditLogPage with RBAC gating, audit query, filtering, and a detail drawer.

---

## Phase 10 — Scan Simulator

### Files

- [ ] `src/pages/ScanSimulatorPage.tsx`
- [ ] `src/components/simulator/ScanForm.tsx`
- [ ] `src/components/simulator/SimulatorControls.tsx`

### Ask Claude

> Phase 10: implement Scan Simulator page that posts scans to the mock API and updates assets. Add auto-stream and anomaly injection.

---

## Phase 11 — Testing

### Ask Claude

> Phase 11: add vitest + RTL setup, MSW server in tests, and the 4 key tests listed in CHECKLIST.md. Keep tests stable and deterministic.

---

## Phase 12 — Documentation

### Ask Claude

> Phase 12: write a FedRAMP-minded README for Guardian based on the app we built. Keep it honest (informal mapping, not claiming certification).

---

## Claude Workflow Rules

- [ ] Build one phase at a time.
- [ ] After each phase:

  - [ ] Run `npm run dev`
  - [ ] If tests exist, run `npm test`
  - [ ] Fix issues before moving on
  - [ ] Commit with a clean message

### Standard Cursor Prompt Template

> You are Claude in Cursor. Apply changes directly to workspace files. Follow CHECKLIST.md exactly. Implement Phase X only. After finishing, stop and tell me what commands to run to validate.
