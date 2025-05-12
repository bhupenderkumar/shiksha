// New authentication provider file to avoid caching issues
// This file re-exports the class-based auth provider directly

import { useClassAuth, ClassAuthProvider } from './class-auth-provider';

// Re-export the hook for backward compatibility
export const useAuth = useClassAuth;

// Re-export the class-based provider directly
export const AuthProvider = ClassAuthProvider;
