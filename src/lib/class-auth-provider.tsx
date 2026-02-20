// Class-based Authentication Provider
import * as React from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from './api-client';
import toast from 'react-hot-toast';

// Define the shape of our authentication context
interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, role: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
}

// Create the context with default values
const AuthContext = React.createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
});

// Class-based AuthProvider to avoid hooks issues
export class ClassAuthProvider extends React.Component<{
  children: React.ReactNode;
}> {
  state = {
    user: null as User | null,
    loading: true,
  };

  // Auth state change subscription
  private authSubscription: { unsubscribe: () => void } | null = null;

  async componentDidMount() {
    // Check active sessions and set the user
    try {
      const { data } = await supabase.auth.getSession();
      this.setState({
        user: data.session?.user ?? null,
        loading: false,
      });

      // Listen for changes on auth state
      const { data: authData } = supabase.auth.onAuthStateChange((_event, session) => {
        this.setState({
          user: session?.user ?? null,
          loading: false,
        });
      });

      this.authSubscription = authData.subscription;
    } catch (error) {
      console.error('Error initializing auth:', error);
      this.setState({ loading: false });
    }
  }

  componentWillUnmount() {
    // Clean up subscription
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  // Sign in function
  signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign in');
      throw error;
    }
  };

  // Sign up function — role is forced to a safe default to prevent privilege escalation.
  // Only an admin can later promote a user via the dashboard.
  signUp = async (email: string, password: string, _role: string, fullName: string) => {
    const SAFE_DEFAULT_ROLE = 'STUDENT';

    try {
      // First create the auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      if (authData?.user) {
        // Then create the profile with a safe default role
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            user_id: authData.user.id,
            full_name: fullName,
            role: SAFE_DEFAULT_ROLE,
          });

        if (profileError) throw profileError;
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign up');
      throw error;
    }
  };

  // Sign out function
  signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign out');
      throw error;
    }
  };

  render() {
    const { user, loading } = this.state;
    
    const value: AuthContextType = {
      user,
      loading,
      signIn: this.signIn,
      signUp: this.signUp,
      signOut: this.signOut,
    };

    return (
      <AuthContext.Provider value={value}>
        {!loading && this.props.children}
      </AuthContext.Provider>
    );
  }
}

// Custom hook to use auth context
export const useClassAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useClassAuth must be used within a ClassAuthProvider');
  }
  return context;
};
