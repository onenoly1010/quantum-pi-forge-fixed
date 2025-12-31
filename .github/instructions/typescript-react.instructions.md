---
description: "TypeScript and React component guidelines for Quantum Pi Forge"
applyTo: "**/*.{ts,tsx}"
---

# TypeScript React Component Instructions

## Component Structure

### Functional Components Only
```typescript
'use client'; // Use when client-side interactivity is needed

import { useState, useEffect } from 'react';

interface ComponentProps {
  // Define all props with explicit types
  title: string;
  onAction?: () => void;
}

export default function Component({ title, onAction }: ComponentProps) {
  const [state, setState] = useState<string>('');

  useEffect(() => {
    // Side effects here
  }, []);

  return (
    <div className="...">
      {/* Tailwind CSS classes */}
    </div>
  );
}
```

## Styling Guidelines

- **Use Tailwind CSS utility classes** for all styling
- Follow the **glassmorphism pattern** established in dashboard
- Use **shadcn/ui components** for consistency
- Apply **responsive design** with mobile-first approach

Example:
```typescript
<div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-lg p-6">
  {/* Glassmorphism effect */}
</div>
```

## State Management

- Use `useState` for local component state
- Use `useEffect` for side effects (API calls, subscriptions)
- Avoid prop drilling - consider context for deeply nested state
- Keep state as close to where it's used as possible

## Type Safety

- **Always** define interfaces for props
- Use TypeScript's strict mode features
- Prefer explicit types over `any`
- Use union types for variants: `type Status = 'idle' | 'loading' | 'success' | 'error'`

## Web3 Integration

When working with Ethers.js:
```typescript
import { ethers } from 'ethers';

// For MetaMask
const provider = new ethers.BrowserProvider(window.ethereum);

// For RPC
const provider = new ethers.JsonRpcProvider(rpcUrl);
```

## Error Handling

```typescript
try {
  // Risky operation
} catch (error) {
  console.error('Descriptive error message:', error);
  // Show user-friendly error (no sensitive data)
}
```

## Common Patterns

### Loading States
```typescript
const [isLoading, setIsLoading] = useState(false);

const handleAction = async () => {
  setIsLoading(true);
  try {
    await performAction();
  } finally {
    setIsLoading(false);
  }
};
```

### Conditional Rendering
```typescript
{isLoading ? (
  <LoadingSpinner />
) : data ? (
  <DataDisplay data={data} />
) : (
  <EmptyState />
)}
```

## Import Path Alias

Use `@/` for imports:
```typescript
import { Button } from '@/components/ui/button';
import { formatAddress } from '@/lib/utils';
```

## DON'Ts

- ❌ Don't use class components
- ❌ Don't use `var` (use `const` or `let`)
- ❌ Don't mutate state directly
- ❌ Don't forget to clean up effects
- ❌ Don't ignore TypeScript errors
