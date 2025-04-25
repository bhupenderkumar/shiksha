import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/api-client';

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
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <div className="max-w-md">
        <h1 className="text-4xl font-bold text-red-600 mb-4">Access Denied</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
          <p className="text-lg mb-4">
            You don't have permission to access this page.
          </p>
          <p className="text-gray-600 mb-4">
            This area requires specific permissions that your account doesn't have.
          </p>

          {user && (
            <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
              <h3 className="font-medium text-gray-800 mb-2">Debug Information</h3>
              <p className="text-sm text-gray-600 mb-1">User ID: {user.id}</p>
              <p className="text-sm text-gray-600 mb-1">Email: {user.email}</p>
              <p className="text-sm text-gray-600">
                Current Role: {loading ? 'Loading...' : userRole || 'No role assigned'}
              </p>
              <p className="text-sm text-gray-600 mt-2">
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
