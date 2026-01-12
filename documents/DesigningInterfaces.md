# Design process for component props

## 1. Identify what the compnent needs to render
- for this MainLayoutProps
The MainLayout should display:
- Filters bar (top)
- Asset Table (left)
- Detail Panel (right)

## 2. Look at similar patterns in your codebase
in `AppShell.tsx` we can see:
```tsx
interface AppShellProps {
    children: React.ReactNode;
}
```

This uses a single `chidren prop` because it wraps one thing
For `MainLayout` you need three distinct sections, so you have two options:

### Option A: Named props (what you have)
```tsx
interface MainLayoutProps {
    filters: React.ReactNode;
    table: React.ReactNode;
    detail: React.ReactNode;
}
```
- Clear and explicit
- Each section has a name
- Good for complex layouts

### Option B: Single children (like AppShell)
```tsx
interface MainLayoutProps {
    children: React.ReactNode; // would need to pass an object or array
}
```

simpler but less clear for mulitple sections

## 3. Think about the component's responsibility
`MainLayout` is a layout component it should:
- Arrange UI pieces
- Not know sbout data or business logic
- accept components to render

So React.ReactNode is appropriate because:
- It accepts any renderable content (components, elements, strings, etc)
- It's flexible
- It keeps the layout component simple

## 4. Consider future needs
Ask:
- Will these sections always be the smae type? -> `React.ReacNode` works
- Do you need to pass data to them? -> No, they're self-contained components
- Could they be optional? -> Maybe later but not now

Current interface is correct:
```tsx
interface MainLayout {
    filters: React.ReactNode;
    table: React.ReactNode;
    detail: React.ReactNode;
}
```

This is a good choice because:
1. Clear intent -- each prop has a purpose
2. Type-safe -- TypeScript will catch missing props
3. Flexible -- accepts any React content
4. Follows React patterns -- similar to how MUI component work

## General rule of thumb
When designing component props:
1. What does the component need to display? -> That becomes a prop
2. Is it a single child or multiple sections? -> Single = children, Mulitple = named props
3. Does it need data or just UI? -> Data = spacific types, UI = React.ReactNode
4. Could it be optional? -> Add ? if optional
