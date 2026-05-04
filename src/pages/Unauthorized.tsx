import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-provider';
import { supabase } from '@/lib/api-client';
import { SCHEMA, PROFILE_TABLE } from '@/lib/constants';

import { alertStyles } from '@/styles/theme';

const Unauthorized: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fetchUserRole = async () => {
      if (!user) {
        if (!cancelled) setLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .schema(SCHEMA)
          .from(PROFILE_TABLE)
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (cancelled) return;
        if (error) {
          console.error('Error fetching user role:', error);
        } else {
          setUserRole(data?.role || null);
        }
      } catch (err) {
        if (!cancelled) console.error('Error in role fetch:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchUserRole();
    return () => {
      cancelled = true;
    };
  }, [user]);

  // If we discover the user actually has an allowed role, bounce them back
  // to the page they tried to reach. This handles the race where the role
  // check on the protected route ran before the supabase auth header was
  // attached.
  useEffect(() => {
    if (loading || retrying || !userRole) return;
    if (['ADMIN', 'TEACHER'].includes(userRole)) {
      setRetrying(true);
      const t = setTimeout(() => navigate(-1), 600);
      return () => clearTimeout(t);
    }
  }, [loading, userRole, retrying, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center bg-background transition-colors duration-300">


      <div className="max-w-md">
        <h1 className={alertStyles.errorTitle}>Access Denied</h1>
        <div className={alertStyles.error}>
          <p className={alertStyles.errorText}>
            You don't have permission to access this page.
          </p>
          <p className="text-muted-foreground mb-4">
            This area requires specific permissions that your account doesn't have.
          </p>

          {user && (
            <div className={alertStyles.debugBox}>
              <h3 className={alertStyles.debugTitle}>Debug Information</h3>
              <p className={alertStyles.debugText}>User ID: {user.id}</p>
              <p className={alertStyles.debugText}>Email: {user.email}</p>
              <p className={alertStyles.debugText}>
                Current Role: {loading ? 'Loading...' : userRole || 'No role assigned'}
              </p>
              <p className={`${alertStyles.debugText} mt-2`}>
                Required Roles: TEACHER, ADMIN
              </p>
            </div>
          )}
        </div>
        <div className="flex flex-col space-y-4">
          <Button asChild variant="default">
            <Link to="/dashboard">Go to Dashboard</Link>
          </Button>
          {user && (
            <Button asChild variant="outline">
              <Link to="/interactive-assignments/create">Try Interactive Assignments Again</Link>
            </Button>
          )}
          {!user && (
            <Button asChild variant="outline">
              <Link to="/login">Log In</Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
