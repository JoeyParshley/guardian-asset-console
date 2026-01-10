# General Interview Assessment Application Checklist

## Universal Guide for Building Full-Stack Interview Projects

### Pre-Development Phase (10-15 min)

- [ ] **Read requirements carefully**
  - [ ] Identify core features (must-haves)
  - [ ] Identify nice-to-haves (if time permits)
  - [ ] Note any technical constraints (specific libraries, patterns)
  - [ ] Clarify time limit and submission format

- [ ] **Plan architecture**
  - [ ] Sketch data model (entities and relationships)
  - [ ] Identify state management needs
  - [ ] Choose tech stack (based on requirements or expertise)
  - [ ] Plan component hierarchy
  - [ ] Determine if API/backend is needed

- [ ] **Set up time boxes**
  - [ ] Core functionality: 60-70% of time
  - [ ] Styling/UX: 15-20% of time
  - [ ] Testing/Polish: 10-15% of time
  - [ ] Leave 15 min buffer for unexpected issues

### Phase 1: Project Initialization (10-15 min)

- [ ] **Initialize project**
  - [ ] Choose build tool: Vite (fast) or Create React App (standard)
  - [ ] Select template: TypeScript recommended
  - [ ] Initialize git repository
  - [ ] Create initial commit

- [ ] **Install dependencies**
  - [ ] UI library (MUI, Tailwind, Chakra, or vanilla CSS)
  - [ ] State management (Zustand, Redux, Context API)
  - [ ] Additional libraries based on requirements
  - [ ] Keep bundle size in mind

- [ ] **Set up folder structure**
  ```
  src/
  ├── components/     # Reusable UI components
  ├── features/       # Feature-specific components
  ├── types/          # TypeScript interfaces
  ├── store/          # State management
  ├── lib/            # Utilities and helpers
  ├── hooks/          # Custom React hooks
  └── assets/         # Images, fonts, etc.
  ```

### Phase 2: Data Layer (20-30 min)

- [ ] **Define data models**
  - [ ] Create TypeScript interfaces for all entities
  - [ ] Define relationship between entities
  - [ ] Consider edge cases (empty states, nulls)
  - [ ] Add proper type safety

- [ ] **Set up state management**
  - [ ] Choose approach: Zustand (simple), Redux (complex), Context (small apps)
  - [ ] Define initial state
  - [ ] Create actions/reducers for CRUD operations
  - [ ] Add persistence if needed (localStorage, sessionStorage)
  - [ ] Implement optimistic updates for better UX

- [ ] **Create utility functions**
  - [ ] Date formatting helpers
  - [ ] Data validation functions
  - [ ] ID generation (UUID or nanoid)
  - [ ] Sorting/filtering utilities
  - [ ] Any domain-specific helpers

### Phase 3: Core Components (60-90 min)

- [ ] **Build component hierarchy**
  - [ ] Start with layout components (Header, Sidebar, Footer)
  - [ ] Create container components (pages/views)
  - [ ] Build feature components (main functionality)
  - [ ] Add presentational components (UI elements)

- [ ] **Implement core functionality first**
  - [ ] Focus on MVP (Minimum Viable Product)
  - [ ] Get basic CRUD operations working
  - [ ] Ensure data flows correctly
  - [ ] Skip styling initially (functionality > looks)

- [ ] **Component checklist per feature:**
  - [ ] Define props interface
  - [ ] Add TypeScript types
  - [ ] Implement state management
  - [ ] Handle edge cases (loading, error, empty)
  - [ ] Add basic styling
  - [ ] Test functionality manually

### Phase 4: User Interactions (30-45 min)

- [ ] **Forms and inputs**
  - [ ] Add controlled components
  - [ ] Implement form validation
  - [ ] Show error messages clearly
  - [ ] Disable submit until valid
  - [ ] Add loading states during submission

- [ ] **User feedback**
  - [ ] Loading spinners for async operations
  - [ ] Success/error messages (toast, snackbar, inline)
  - [ ] Confirmation dialogs for destructive actions
  - [ ] Visual feedback on interactions (hover, active states)

- [ ] **Keyboard and accessibility**
  - [ ] Tab navigation works correctly
  - [ ] Enter key submits forms
  - [ ] ESC closes modals
  - [ ] Focus management in dialogs
  - [ ] ARIA labels where appropriate

### Phase 5: Styling & Polish (30-45 min)

- [ ] **Apply consistent design**
  - [ ] Choose color palette (2-3 main colors)
  - [ ] Define spacing scale (4px, 8px, 16px, 24px, etc.)
  - [ ] Set typography hierarchy
  - [ ] Use consistent border radius
  - [ ] Limit shadow usage (flat > overly shadowed)

- [ ] **Responsive design**
  - [ ] Test on mobile viewport
  - [ ] Stack elements vertically on small screens
  - [ ] Ensure touch targets are 44x44px minimum
  - [ ] Test with browser DevTools device emulation

- [ ] **Visual polish**
  - [ ] Add subtle transitions (200-300ms)
  - [ ] Hover effects on interactive elements
  - [ ] Focus indicators visible
  - [ ] Consistent spacing throughout
  - [ ] Empty states with helpful messages

### Phase 6: Data Persistence (if required) (20-30 min)

- [ ] **Choose persistence strategy**
  - [ ] localStorage: Simple, client-side only
  - [ ] sessionStorage: Temporary, per-tab
  - [ ] IndexedDB: Large amounts of data
  - [ ] Backend API: True persistence, multi-user

- [ ] **Implement persistence**
  - [ ] Save on every state change (debounced)
  - [ ] Load on app initialization
  - [ ] Handle quota exceeded errors
  - [ ] Provide export/import if helpful

### Phase 7: Testing & Edge Cases (20-30 min)

- [ ] **Manual testing checklist**
  - [ ] Test happy path (normal usage)
  - [ ] Test error cases (network failures, invalid input)
  - [ ] Test edge cases (empty data, very long strings, special chars)
  - [ ] Test browser refresh (data persistence)
  - [ ] Test on different browsers (Chrome, Firefox, Safari)

- [ ] **Edge cases to consider**
  - [ ] Empty initial state
  - [ ] Very long text/strings
  - [ ] Special characters in input
  - [ ] Rapid successive actions
  - [ ] Network errors (if using API)
  - [ ] localStorage quota exceeded

### Phase 8: Code Quality (15-20 min)

- [ ] **Clean up code**
  - [ ] Remove console.logs
  - [ ] Delete unused imports
  - [ ] Fix TypeScript errors/warnings
  - [ ] Remove commented-out code
  - [ ] Consistent formatting (Prettier recommended)

- [ ] **Add comments where needed**
  - [ ] Complex algorithms
  - [ ] Non-obvious business logic
  - [ ] Workarounds or hacks
  - [ ] TODO items if time-constrained

- [ ] **Check for common issues**
  - [ ] No memory leaks (cleanup in useEffect)
  - [ ] No infinite re-renders
  - [ ] Proper key props in lists
  - [ ] No direct state mutations

### Phase 9: Documentation (10-15 min)

- [ ] **Update README**
  - [ ] Project description
  - [ ] Features implemented
  - [ ] Tech stack used
  - [ ] Setup instructions
  - [ ] How to run the project
  - [ ] Any assumptions or trade-offs made

- [ ] **Add inline documentation**
  - [ ] Document complex components
  - [ ] Explain non-obvious decisions
  - [ ] Note any limitations

### Phase 10: Final Review (10-15 min)

- [ ] **Final checks**
  - [ ] All requirements met
  - [ ] App runs without errors
  - [ ] No console warnings
  - [ ] Responsive on mobile
  - [ ] Good performance (no lag)

- [ ] **Git commits**
  - [ ] Meaningful commit messages
  - [ ] Logical commit history
  - [ ] No sensitive data committed
  - [ ] Final commit pushed

- [ ] **Submission**
  - [ ] Follow submission instructions exactly
  - [ ] Include all required files
  - [ ] Test deployed version (if applicable)
  - [ ] Send on time

## Time Management Tips

### For 4-Hour Assessment
- **Hour 1**: Setup, data model, state management
- **Hour 2**: Core functionality, basic UI
- **Hour 3**: Complete features, styling
- **Hour 4**: Polish, testing, documentation

### For 8-Hour Assessment
- **Hours 1-2**: Setup, planning, data layer
- **Hours 3-5**: Core features implementation
- **Hours 6-7**: Polish, responsive design, edge cases
- **Hour 8**: Testing, documentation, submission

### For Take-Home (Days)
- **Day 1**: Planning, setup, core functionality
- **Day 2**: Complete features, styling, testing
- **Day 3**: Polish, documentation, extra features

## Common Interview App Types

### CRUD Application
- [ ] List view with items
- [ ] Create new item form
- [ ] Edit existing item
- [ ] Delete with confirmation
- [ ] Filter/search functionality
- [ ] Sort options

### Kanban/Task Board
- [ ] Multiple columns/states
- [ ] Drag-and-drop between columns
- [ ] Add/edit/delete tasks
- [ ] Persistence across sessions
- [ ] Optional: filtering, search

### Dashboard/Analytics
- [ ] Data visualization (charts)
- [ ] Multiple views/tabs
- [ ] Filter by date/category
- [ ] Summary statistics
- [ ] Export functionality

### E-commerce/Shopping
- [ ] Product listing
- [ ] Shopping cart
- [ ] Add/remove items
- [ ] Quantity management
- [ ] Total calculation
- [ ] Checkout flow

### Social Media Feed
- [ ] List of posts/items
- [ ] Like/comment functionality
- [ ] Create new post
- [ ] Real-time updates
- [ ] Infinite scroll or pagination

## Tech Stack Decision Matrix

### UI Framework
- **React**: Most common, largest ecosystem
- **Vue**: Simpler, faster to learn
- **Svelte**: Minimal boilerplate, fast

### State Management
- **Zustand**: Simple, modern, small bundle
- **Redux Toolkit**: Enterprise standard, verbose
- **Context API**: Built-in, good for small apps
- **Jotai/Recoil**: Atomic state, flexible

### UI Library
- **Material-UI**: Complete, professional, large bundle
- **Tailwind CSS**: Utility-first, flexible, requires more work
- **Chakra UI**: Good defaults, accessible, smaller than MUI
- **Headless UI + Tailwind**: Maximum flexibility
- **Vanilla CSS**: Shows CSS skills, takes longer

### Styling Approach
- **CSS Modules**: Scoped, traditional
- **Styled Components**: CSS-in-JS, dynamic
- **Tailwind**: Utility classes, fast development
- **SCSS/SASS**: Enhanced CSS, familiar

## Red Flags to Avoid

❌ **Don't:**
- Submit without testing
- Ignore TypeScript errors
- Have console errors in production
- Use inline styles everywhere
- Have inconsistent naming conventions
- Commit node_modules
- Have unclear variable names (x, temp, data1)
- Skip README instructions
- Miss stated requirements
- Over-engineer simple solutions
- Add features not requested (time waste)

✅ **Do:**
- Follow requirements exactly
- Write clean, readable code
- Add helpful comments
- Test thoroughly
- Make it responsive
- Handle edge cases
- Update README
- Show your thought process
- Commit regularly with good messages
- Keep it simple and functional

## Evaluation Criteria (What Reviewers Look For)

### Technical Skills (40%)
- Code organization and structure
- TypeScript usage and type safety
- State management implementation
- Component design and reusability
- Performance considerations

### Functionality (30%)
- Requirements met completely
- Features work as expected
- Edge cases handled
- Error handling implemented
- User experience is smooth

### Code Quality (20%)
- Clean, readable code
- Consistent naming conventions
- Proper comments where needed
- No obvious bugs or warnings
- Good practices followed

### Presentation (10%)
- UI is polished and professional
- Responsive design
- Attention to detail
- README is clear and complete
- Easy to run and test

## Practice Exercise Ideas

1. **Todo App with Categories** (2-3 hours)
   - CRUD operations
   - Filter by category
   - Mark complete
   - localStorage persistence

2. **Weather Dashboard** (3-4 hours)
   - API integration
   - Multiple city search
   - Data visualization
   - Responsive layout

3. **Recipe Book** (4-5 hours)
   - List/grid view
   - Search and filter
   - Add/edit recipes
   - Image upload
   - Print view

4. **Expense Tracker** (4-5 hours)
   - Add transactions
   - Categories
   - Charts/graphs
   - Date filtering
   - Summary statistics

5. **Habit Tracker** (3-4 hours)
   - Calendar view
   - Mark complete
   - Streaks
   - Multiple habits
   - Progress visualization

## Resources to Study

- **React Docs**: reactjs.org
- **TypeScript Handbook**: typescriptlang.org/docs
- **MUI Documentation**: mui.com
- **State Management**: zustand, Redux Toolkit docs
- **CSS Layout**: flexbox, grid tutorials
- **Accessibility**: WCAG guidelines basics

---

## Quick Reference: Essential Patterns

### Custom Hook Pattern
```typescript
function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initial;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
}
```

### Debounce Pattern
```typescript
useEffect(() => {
  const timer = setTimeout(() => {
    // Perform action
  }, 500);
  return () => clearTimeout(timer);
}, [dependency]);
```

### Error Boundary Pattern
```typescript
class ErrorBoundary extends Component {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) return <ErrorFallback />;
    return this.props.children;
  }
}
```

Good luck with your interview assessments! 🚀
