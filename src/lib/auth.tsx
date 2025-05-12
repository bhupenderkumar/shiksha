// Authentication compatibility layer
// This file re-exports the class-based auth provider to maintain compatibility

import { useClassAuth, ClassAuthProvider } from './class-auth-provider';

// Re-export the hook for backward compatibility
export const useAuth = useClassAuth;

// Re-export the class-based provider directly
// This ensures that the component is properly exported without any wrapper
export const AuthProvider = ClassAuthProvider;
