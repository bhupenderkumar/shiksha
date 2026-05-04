import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../lib/auth-provider';
import { supabase } from '../lib/api-client';
import { SCHEMA } from '../lib/constants';

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
      // Try up to 2 times with a short delay — defends against the race
      // where the supabase client hasn't yet attached the JWT after a
      // fresh login, which would otherwise return 0 rows under RLS.
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const { data, error } = await supabase
            .schema(SCHEMA)
            .from('Profile')
            .select('role')
            .eq('user_id', user.id)
            .maybeSingle();

          if (cancelled) return;

          if (!error && data?.role) {
            setHasAccess(allowedRoles.includes(data.role));
            setRoleLoading(false);
            return;
          }

          if (error && attempt === 0) {
            console.warn('Role check attempt 1 failed, retrying:', error);
            await new Promise((r) => setTimeout(r, 300));
            continue;
          }

          if (!data && attempt === 0) {
            // No row yet — could be the auth-header race. Wait & retry.
            await new Promise((r) => setTimeout(r, 300));
            continue;
          }

          // Final attempt failed — deny.
          if (error) console.error('Failed to fetch user role:', error);
          setHasAccess(false);
          setRoleLoading(false);
          return;
        } catch (err) {
          if (cancelled) return;
          if (attempt === 0) {
            await new Promise((r) => setTimeout(r, 300));
            continue;
          }
          console.error('Role check error:', err);
          setHasAccess(false);
          setRoleLoading(false);
          return;
        }
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