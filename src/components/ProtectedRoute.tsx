import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../lib/auth-provider';
import { supabase } from '../lib/api-client';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  requireAuth?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles = [],
  requireAuth = true,
}) => {
  const { user, loading } = useAuth();
  const [roleLoading, setRoleLoading] = useState(allowedRoles.length > 0);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    if (allowedRoles.length === 0 || !user) {
      setRoleLoading(false);
      setHasAccess(true);
      return;
    }

    let cancelled = false;

    const checkRole = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (cancelled) return;

        if (error || !data) {
          console.error('Failed to fetch user role:', error);
          setHasAccess(false);
        } else {
          setHasAccess(allowedRoles.includes(data.role));
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Role check error:', err);
          setHasAccess(false);
        }
      } finally {
        if (!cancelled) setRoleLoading(false);
      }
    };

    checkRole();
    return () => {
      cancelled = true;
    };
  }, [user, allowedRoles]);

  if (loading || roleLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (requireAuth && !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !hasAccess) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;