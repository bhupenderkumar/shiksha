# Shiksha - School Management System

## Architecture Overview

This is a **React + Vite + TypeScript** frontend that connects to **Supabase** (PostgreSQL) as backend. All database operations use the `school` schema, not `public`.

### Key Layers
- **Pages** (`src/pages/`): Route components, lazy-loaded in `App.tsx`
- **Backend Services** (`src/backend/`): Supabase data access layer (legacy location)
- **Services** (`src/services/`): Newer service layer with `BaseService` class pattern
- **UI Components** (`src/components/ui/`): shadcn/ui components (Radix + Tailwind)
- **Hooks** (`src/hooks/`): Custom React hooks for data fetching

## Critical Patterns

### Supabase Schema Usage
Always use the `school` schema, never `public`:
```typescript
import { supabase } from '@/lib/api-client';
import { SCHEMA } from '@/lib/constants';

// Correct pattern
const { data } = await supabase
  .schema(SCHEMA)  // SCHEMA = 'school'
  .from(TABLE_NAME)
  .select('*');
```

### Table Name Constants
Use constants from `src/lib/constants.ts` for table names:
```typescript
import { CLASS_TABLE, STUDENT_TABLE, HOMEWORK_TABLE } from '@/lib/constants';
```

### Type Generation
Database types are in `src/database.types.ts` (auto-generated) and `src/types/supabase.ts` (manual). Run:
```bash
npm run supabase:generate-types
```

### Path Aliases
Use `@/` prefix for imports (maps to `src/`):
```typescript
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/api-client';
```

## Authentication

Uses Supabase Auth with a **class-based provider** (`src/lib/class-auth-provider.tsx`):
```typescript
import { useAuth } from '@/lib/auth-provider';
const { user, signIn, signOut, loading } = useAuth();
```

**Note**: Role-based access control is currently bypassed in `ProtectedRoute.tsx`.

## UI Component Conventions

### shadcn/ui Components
Located in `src/components/ui/`. Use the `cn()` utility for conditional classes:
```typescript
import { cn } from '@/lib/utils';
<div className={cn("base-class", condition && "conditional-class")} />
```

### Loading States
Use `LoadingSpinner` component:
```typescript
import { LoadingSpinner } from '@/components/ui/loading-spinner';
```

### Notifications
Use `react-hot-toast`:
```typescript
import { toast } from 'react-hot-toast';
toast.success('Saved!');
toast.error('Failed to save');
```

## Common Commands

```bash
npm run dev          # Start dev server (port 3000)
npm run build        # Production build
npm run test         # Run vitest tests
npm run lint         # ESLint
```

## Service Layer Pattern

For new services, extend `BaseService` in `src/services/`:
```typescript
import { BaseService } from './base.service';

class MyService extends BaseService {
  constructor() {
    super('TableName', 'school');
  }
}
```

For simpler cases, follow the object pattern in `src/backend/`:
```typescript
export const myService = {
  async getAll() {
    const { data, error } = await supabase
      .schema(SCHEMA)
      .from(TABLE_NAME)
      .select('*');
    if (error) throw error;
    return data;
  }
};
```

## File Structure Conventions

- **Pages**: One component per file in `src/pages/`, lazy-loaded
- **Routes**: Defined in `ROUTES` constant (`src/constants/app-constants.ts`)
- **SQL Migrations**: `supabase/migrations/` and root-level `.sql` files

## Key Files Reference

| Purpose | Location |
|---------|----------|
| Supabase client | `src/lib/api-client.ts` |
| Auth provider | `src/lib/class-auth-provider.tsx` |
| Constants/Tables | `src/lib/constants.ts` |
| Routes | `src/constants/app-constants.ts` |
| Database types | `src/database.types.ts` |
| Base service | `src/services/base.service.ts` |
