import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../lib/auth-provider';
import { LogIn } from 'lucide-react';
import toast from 'react-hot-toast';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import {
  authPageStyles,
  cardStyles,
  inputStyles,
  buttonStyles,
  linkStyles,
  textStyles,
  dividerStyles,
  loadingStyles,
} from '@/styles/theme';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, signIn } = useAuth();

  useEffect(() => {
    if (user) {
      window.location.href = '/dashboard';
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signIn(email, password);
      toast.success('Successfully signed in!');
      window.location.href = '/dashboard';
    } catch (error: any) {
      toast.error('Failed to sign in. Please check your credentials.');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={authPageStyles.container}>
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className={authPageStyles.iconWrapper}>
            <LogIn className={`w-12 h-12 ${authPageStyles.iconColor}`} />
          </div>
        </div>
        <h2 className={authPageStyles.title}>
          Welcome back
        </h2>
        <p className={authPageStyles.subtitle}>
          Sign in to continue to your account
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className={cardStyles.container}>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label htmlFor="email" className={inputStyles.label}>
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputStyles.base}
                placeholder="Enter your email"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className={inputStyles.label}>
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputStyles.base}
                placeholder="Enter your password"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <Link to="/forgot-password" className={linkStyles.primary}>
                  Forgot your password?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className={buttonStyles.primary}
              >
                {loading ? (
                  <div className={loadingStyles.wrapper}>
                    <div className={loadingStyles.spinner}></div>
                    Signing in...
                  </div>
                ) : (
                  'Sign in'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className={textStyles.muted}>
              Don't have an account?{' '}
              <Link to="/register" className={linkStyles.primary}>
                Register here
              </Link>
            </p>
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className={dividerStyles.line}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
