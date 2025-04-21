import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { supabase } from '../lib/api-client';
import { SCHEMA } from '@/lib/constants';

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
  const [userRole, setUserRole] = useState<string | null>(null);
  const [roleLoading, setRoleLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (user) {
        try {
          const { data, error } = await supabase
          .schema(SCHEMA)
            .from('Profile')
            .select('role')
            .eq('user_id', user.id)
            .single();

          if (error) {
            console.error('Error fetching user role:', error);
          } else {
            setUserRole(data?.role || null);
          }
        } catch (err) {
          console.error('Error in role fetch:', err);
        }
      }
      setRoleLoading(false);
    };

    fetchUserRole();
  }, [user]);

  if (loading || roleLoading) {
    return <div className="h-screen w-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
    </div>;
  }

  if (requireAuth && !user) {
    return <Navigate to="/login" replace />;
  }

  // Temporarily disabled role checking - uncomment when ready to enforce roles
  // if (allowedRoles.length > 0 && (!userRole || !allowedRoles.includes(userRole))) {
  //   return <Navigate to="/unauthorized" replace />;
  // }

  // For debugging: Log role information but allow access
  if (allowedRoles.length > 0) {
    console.log('Role check (disabled):', {
      userRole,
      allowedRoles,
      wouldHaveAccess: userRole && allowedRoles.includes(userRole)
    });
  }

  return <>{children}</>;
}

export default ProtectedRoute;