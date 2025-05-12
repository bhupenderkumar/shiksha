import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../lib/auth-provider';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  requireAuth?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles = [],
  requireAuth = true
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="h-screen w-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
    </div>;
  }

  if (requireAuth && !user) {
    return <Navigate to="/login" replace />;
  }

  // Role checking completely disabled
  // Just log that we're skipping the role check
  if (allowedRoles.length > 0) {
    console.log('Role check bypassed:', {
      allowedRoles,
      message: 'Role checking is disabled to avoid Profile API calls'
    });
  }

  return <>{children}</>;
}

export default ProtectedRoute;