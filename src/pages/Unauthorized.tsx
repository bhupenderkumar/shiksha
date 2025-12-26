import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-provider';
import { supabase } from '@/lib/api-client';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { alertStyles } from '@/styles/theme';

const Unauthorized: React.FC = () => {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (user) {
        try {
          const { data, error } = await supabase
            .from('profiles')
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
      setLoading(false);
    };

    fetchUserRole();
  }, [user]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center bg-background transition-colors duration-300">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

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
