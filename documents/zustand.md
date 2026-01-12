## Zustand Explained

## What is Zustand?
Zustand is a small, unopinionated state mangement library for React. Its a lightweight alternative to Redux.

### Quick Facts
- Name: German for state
- Size: ~1kb
- Phiisophy: Mimimal API, no boilerplate
- Created by: Jotai team (same creators)

## Why Zustand? (vs Redux, Context API)
### Problems with Redux
```
// Redux requires:
// 1. Store setup
// 2. Actions
// 3. Reducers
// 4. Dispatch calls
// 5. Selectors
// 6. Provider wrapper
// = Lots of boilerplate
```
### Problems with Context API
```
// Context API issues:
// - Causes re-renders of ALL consumers when ANY value changes
// - No built in selectors
// - Can cause performance issues
// - Verbose setup for multipl contexts
```

### Zustand solution
```
// Zustand
// - No Provider needed (but can use one)
// - Direct store access
// - Built-in selectors (prevents unnecesssary re-renders)
// - Minimal boilerplate
// - Works outside React components
```

## Core concepts
1. Creating a Store
```js
import { create } from 'zustand';

// Basic store
const useStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
}));
```
What's happening:
- `create()` returns hook
- `set` updates state
- State and actions live in one object

2. Using the store in components

```js
function Counter() {
    // Option 1: Get everything
    const { count, increment } = useStore();

    // Options 2: Select only what you need (BEETER - prevents re-render)
    const count = useStore((state) => state.count);
    const increment = useStore((stare) => state.increment);

    return (
        <div>
            <p>{count}</p>
            <button onClick={increment}>+</button>
        </div>
    );
}
```
Why selectors matter:
- Without seleector: component re-renders on any store change
- With selector: component re-renders only when selected valye changes

3. TypeScript support
```ts
interface StoreState {
    count: number;
    name: string;
    increment: () => void;
    setName: (name: string) => void;
}

const useStore = create<StoreState>((set) => ({
    count:0,
    name: 'John',
    increment: () => set((state) => ({ count: state.count + 1 })),
    setName: (name) => set({ name }),
}));
```

## Middleware: Perist (for this project)

### What is middleware?
Middleware extends Zustand with extra features (peristence, devtools, etc)

### Perist Middleware example
```ts
import { persist } from 'zustand/middleware';

const useStore = create(
    persist(
        (set) => ({
            count: 0,
            increment: () => set((state) => ({ count: state.count + 1 })),
        }),
        {
            name: 'my-storage-key', // localStorage key
        }
    )
);
```

How it works:
1. On state change → saves to localStorage
2. on app load → reads from localStorage
3/ Automatically syncs

This project's example
```tsx
export const useSessionStore = create<SessionState>()(
    perist(
        (set) => ({
            role: 'operator',
            themeMode: 'light',
            setRole: (role) => set({ role }),
            setThemeMode: (mode) => set({ themeMode: mode }),
        }),
        {
            name: 'guardian-session', //Saves to localStorage under this key
        }
    )
);
```
## Common Patterns
### Pattern 1: Async Actions

```js
const useStore = create((set) => ({
    data: null,
    loading: false,
    error: null,

    fetchData: async () => {
        set({ loading: true, error: null });
        try {
            const response = await fetch('/api/data');
            const data = await response.json();
            set({ data, loading: false });
        } catch (error) {
            set({ error: error.message, loading: false });
        }
    }
}));
```
### Pattern 2: Computed values (derived state)
```js
const useStore = create((set) => ({
    items: [],
    addItem: (item) => set((state) => ({
        items: [...state.items, item]
    })),
}));

//  in Component - compute derived value
function Component() {
    const items = useStore((state) => state.items);
    const itemCount = items.length; // Derived, not in the store
    // Or use a selector
    const itemCount = useStore((state) => state.items.length);
}
```

### Pattern 3: Multiple Stores (Slicing)
```js
// Instead of one gient store split into slices
const useAuthStore = create((set) => ({
    user: null,
    login: (user) => set({ user }),
}));

const useCartStore = create((state) => ({
    items: [],
    addItem: (item) => set((state) => ({
        items: [...state.items, item]
    })),
}));
```

## Q & A
### Q1 Why Zustand over Redux?
Answer:
Its much simple in thisuse case. We needed global state for user session (role and theme), and Zustand requires mimimal boilerplate compared to Redux. With Redux, I need actions, reducers, and a Provider wrapper. Zustand gives us the same functionality with just a create() call. Its also smaller (1kb vs Redux's 10kb) and has built-in TypeScript Support.

### How does Zustand prevent unnecessary re-renders
Answer:
Zustand uses selectors. When you call `useStore((state) => state.count)`, the component only subscribes to changes in count. IF another part of the store changes, this component won't re-render. This is different from Context API, where any context value change causes all consumers to re-render.

### Can you use Zustand outside of React Components?
Answer:
Yes that is one of Zustand's strengths. You can access the store directly.
```js
// In a utility function or API client
const role = useSessionStore.getState().role;
useSessionSore.getStore().setRole('admin');
```

Thius is useful for API calls where you need the current rule to set headers

### How does Persist middleware work?
Answer:
The perist middleware intercepts state changes and automatically saves them to localStorage (or sessionStorge). When the app loads, it reads hte stored value and hydrates the store. In this project, this means that the users role and theme preference persist across page refreshes without any additional code.

### Whate are the limitations of Zustand
Answer:
Zustand is great for small to medium apps but for very large applications with complex state logic, Redux might be better because:
- Redux has better DevTools
- Redux has a larger ecosystem
- Redux has more middleware options
- Redux has better patterns for complex async flows

However, for most applications, Zustand's simplicity is a huge advantage.

## How it works in this project:
```ts
// 1. CREATE the store
export const useSessionStore = create<SessionState>()(
    persist(
        (set) => ({
            role: 'operator',               // State
            themeMode: 'light',             // State
            setRole: (role) => set({ role }),                   // Action
            setThemeMode: (mode) => set({ themeMode: mode }),   // Action
        }),
        { name: 'guardian-session' }        // Perist config
    )
);

// 2: USE in components
function AppShell() {
    // Read State
    const role = useSessionStore((state) => state.role);
    const themeMode = useSessionStore((store) => state.themeMode);

    // Get actions
    const setRole = useSessionStore((state) => state.setRole);
    const setThemeMode = useSessionStore((state) => state.setThemeMode);

    // Use them
    return (
        <Select value={role} onChange={(e) => setRole(e.target.value)}>
            {/* ... */}
        </Select>
    );
}
```
## Key Takeaways
1. Zustand is a lightweight state management library
2. Minimal boilerplate compared to Redux
3. Selectors prevent unnecessary re-renders
4. Works outside React components
5. Mmiddleware extends functionality (persist, devtools)
6. Good TypeScript support
7. Best for small to medium apps