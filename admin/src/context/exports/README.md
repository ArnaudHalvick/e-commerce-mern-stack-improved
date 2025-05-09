# Context Exports Directory

This directory contains non-component exports organized for Fast Refresh compatibility.

## Why This Structure?

React's Fast Refresh has a limitation: files that export both React components and other types of exports (hooks, contexts, constants) will cause Fast Refresh to disable itself. When Fast Refresh is disabled, the entire app reloads instead of just updating the changed component.

## Organization

We've organized exports into these categories:

- `contexts.js`: All Context objects
- `hooks.js`: All custom hooks
- `types.js`: All action type constants

## How to Import

**For components:**

```jsx
// Import components directly from their source files or from index.jsx
import { ErrorState } from "../context/index.jsx";
```

**For non-component exports:**

```jsx
// Import hooks, contexts, and types from exports directory
import { useError } from "../context/exports/hooks.js";
import { ErrorContext } from "../context/exports/contexts.js";
import { ErrorTypes } from "../context/exports/types.js";
```

## Fast Refresh Rules

1. Each component must be in its own file that only exports components
2. Non-component exports must be in separate files (like this exports directory)
3. Never mix component and non-component exports in the same file
4. Use `.js` extension for non-component files and `.jsx` for component files
