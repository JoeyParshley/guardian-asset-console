# Guardian Asset Console - Folder Structure

## Project Overview
A React + TypeScript application built with Vite, Material-UI, and Zustand for managing and monitoring assets with role-based access control (operator, admin, auditor).

## Root Structure

```
guardian-asset-console/
├── documents/          # Project documentation
├── public/             # Static assets and MSW service worker
├── src/                # Source code
├── index.html          # Entry HTML file
├── package.json        # Dependencies and scripts
└── vite.config.ts      # Vite configuration
```

## Source Code Structure (`src/`)

### `/api/` - API Layer
Mock API layer using MSW (Mock Service Worker):
- `browser.ts` - Browser-specific MSW setup
- `client.ts` - API client functions
- `db.ts` - In-memory database/mock data store
- `handlers.ts` - MSW request handlers
- `server.ts` - Server-specific MSW setup

### `/app/` - Application Core
Core application configuration and layout:
- `AppShell.tsx` - Main layout component (see details below)
- `theme.ts` - Material-UI theme configuration (light/dark modes)

### `/components/` - Reusable Components
Organized by feature domain (currently empty, ready for future components):
- `assets/` - Asset-related components
- `audit/` - Audit log components
- `layout/` - Layout components
- `simulator/` - Simulator components

### `/data/` - Data Management
- `seed.ts` - Seed data for development/testing

### `/domain/` - Domain Models
TypeScript type definitions and domain logic:
- `types.ts` - Core domain types (Role, Asset, Scan, Incident, AuditLog, etc.)
- `permissions.ts` - Permission/authorization logic

### `/pages/` - Page Components
Route-level page components (currently empty, ready for routing implementation)

### `/store/` - State Management
Zustand stores for global state:
- `useSessionStore.ts` - Session state (role, theme mode) with localStorage persistence

### `/utils/` - Utility Functions
Helper functions organized by concern:
- `filterSort.ts` - Filtering and sorting utilities
- `severity.ts` - Severity-related utilities
- `time.ts` - Time/date formatting utilities

### Root Files
- `App.tsx` - Root React component (wraps app in ThemeProvider and AppShell)
- `main.tsx` - Application entry point
- `App.css` - Global styles
- `index.css` - Base CSS styles

---

## AppShell Component

### Purpose
`AppShell` is the main layout component that provides the consistent structure and navigation for the entire application. It wraps all page content and provides a persistent header with user controls.

### Location
`src/app/AppShell.tsx`

### Key Features

1. **Persistent App Bar**
   - Displays "Guardian Asset Console" title
   - Always visible at the top of the application

2. **Role Selector**
   - Dropdown menu to switch between user roles:
     - Operator
     - Admin
     - Auditor
   - Role state is managed by Zustand store (`useSessionStore`)
   - Persists to localStorage

3. **Theme Toggle**
   - Switch between Light and Dark themes
   - Theme state managed by Zustand store
   - Persists to localStorage
   - Updates the entire app theme in real-time

4. **Content Container**
   - Main content area that wraps all child components
   - Provides consistent padding and layout
   - Uses Material-UI Box component for flexible layout

### Technical Details

- **State Management**: Uses Zustand's `useSessionStore` for:
  - Current role (`role`)
  - Theme mode (`themeMode`)
  - Role setter (`setRole`)
  - Theme setter (`setThemeMode`)

- **Styling**: Material-UI components:
  - `AppBar` - Top navigation bar
  - `Toolbar` - Container for header controls
  - `Typography` - App title
  - `FormControl` + `Select` - Role selector
  - `FormControlLabel` + `Switch` - Theme toggle
  - `Box` - Layout containers

- **Props**: Accepts `children` (React.ReactNode) to render page content

### Usage
```tsx
<AppShell>
  {/* Page content goes here */}
  <YourPageComponent />
</AppShell>
```

The AppShell is used in `App.tsx` as the wrapper for all application content, ensuring consistent layout and controls across all pages.
