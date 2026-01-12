# React Query Overview

## What is React Query
React Query (TanStack Query) is a powerful data-fetching library for React that:
- **Manages Server state** (data from APIs)
- **Caches API responses** automatically
- **Handles loading/error states** for you
- **Refetches data** when needed (stale-while-revalidate pattern)
- **Reduces boilerplate** vs useState/useEffect patterns

## Why it fits this project
Instead of manually managing:
```js
// ❌ Manual aproach (lots of boilerplate)
const [assets, setAssets] = useState<Asset[]>([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState<Error | null>(null);

useEffect(() => {
    setLoading(true);
    listAssets()
        .then(setAssets)
        .catch(setError)
        .finally(() => setLoading(false));
}, []);
```

ReaactQuery gives you:

```tsx
// ✅ React Query (clean and powerful)
const ( data: assets, isLoading, error ) = useQuery({
    queryKey: ['assets'],
    queryFn: () => listAssets(),
})
```

## Key Concepts
### 1. QueryClient & QueryClientProvider
#### Setup (once in your app):
```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes - data stays fresh
            refetchOnWindowFocus: false, // Dont refetch when window regains focus
        },
    },
});
// Wrap you app
<QueryClientProvider client={qieryClient}>
    <App />
</QueryClientProvider>
```

### 2. useQuery Hook
#### Basic usage:
```tsx
import { useQuery } from '@tanstack/react-query';
import { listAssets } from '../api/client';

const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['assets'], // Unique key for caching
    queryFn: () => listAssets(), // Function that returns a Promise
});
```

#### With Parameters

```tsx
const { data: assets } = useQuery({
    queryKey: ['assets', { site, status, severity }], // Include params in key
    queryFn: () => listAssets({ site, status, severity }),
    enabled: !!site, // only run if site is truthy
});
```

#### REturn Values: 
- `data`: The fetched data (undefined while loading)
- `isLoading`: true on first fetch
- `isFEtching`: true whenever fetching (including refetches)
- `error`: Error object if fetch failed
- `refetch`: Function to manually refetch
- `isError`: Boolean for error state
- `isSuccess`: Boolean for success state

### #. Query Keys
Query keys uniquely identify cached data:
```tsx
// simple key
['assets']

// With parameters (importabt for filtering)
['assets', { site: 'warehouse-1' }]
['assets', { site: 'warehouse-1', status: 'missing' }]

// nested keys
['assets', assetId, 'detail']
```
**Rule**: Different keys = different cace entries, Same key = shared cache

### 4. useMutation Hook
For POST/PUT/DELETE operation
```tsx
import { useMutation, useQueryClient } from '@tanstack/react-query';

const queryClient = useQueryClient();

const mutation = useMutation({
    mutationFn: (input: CreateScanInput) => createScan(input),
    onSuccess: () => {
        // Invalidate and refetch assets after creating a scan
        queryClient.invalidateQueries({ queryKey: ['assets'] });
    },
});

// use it
mutation.mutate({ assetId: '123', site: 'wqarehouse-1', readerId: 'reader-1' });
```

## Usage in this App


