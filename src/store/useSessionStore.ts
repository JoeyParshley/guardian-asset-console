/**
 * Stores the current user role (operator, admin, auditor) and theme (light, dark)
 * Persists in localStorage
 * 
 * Zustand store for session management
 * 
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Role } from '../domain/types';

// define the state interface will hhave two properties: role and themeMode with setters for each
interface SessionState {
    role: Role;
    themeMode: 'light' | 'dark';
    setRole: (role: Role) => void;
    setThemeMode: (mode: 'light' | 'dark') => void;

}

// create the store with peristendce using Zustand's create function and persist middleware
export const useSessionStore = create<SessionState>()(
    persist(
        (set) => ({
            role: 'operator',
            themeMode: 'light',
            setRole: (role) => set({ role }),
            setThemeMode: (mode) => set({ themeMode: mode }),
        }),
        {
            name: 'guardian-session',
        } // Persist config
    )
);

