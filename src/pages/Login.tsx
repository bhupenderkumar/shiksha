import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth-provider';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { SCHOOL_INFO } from '@/lib/constants';

import {
  authPageStyles,
  inputStyles,
  buttonStyles,
  linkStyles,
  textStyles,
  loadingStyles,
} from '@/styles/theme';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user, signIn } = useAuth();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/dashboard';

  useEffect(() => {
    if (user) {
      window.location.href = from;
    }
  }, [user, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signIn(email, password);
      toast.success('Successfully signed in!');
      window.location.href = from;
    } catch (error: any) {
      toast.error('Failed to sign in. Please check your credentials.');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={authPageStyles.container}>
      {/* ── Branding ── */}
      <div className={authPageStyles.brandingArea}>
        <div className={authPageStyles.logoWrapper}>
          <img
            src={SCHOOL_INFO.logo}
            alt={SCHOOL_INFO.name}
            className={authPageStyles.logoImage}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
        <h1 className={authPageStyles.schoolName}>{SCHOOL_INFO.name}</h1>
        <p className={authPageStyles.schoolTagline}>{SCHOOL_INFO.tagline}</p>
      </div>

      {/* ── Form ── */}
      <div className={authPageStyles.formCard}>
        <h2 className={authPageStyles.formTitle}>Welcome back</h2>
        <p className={authPageStyles.formSubtitle}>Sign in to your account</p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className={inputStyles.label}>Email</label>
            <div className="relative">
              <div className={inputStyles.iconWrapper}>
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputStyles.withIcon}
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className={inputStyles.label}>Password</label>
            <div className="relative">
              <div className={inputStyles.iconWrapper}>
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputStyles.withIcon}
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-xs text-gray-400 hover:text-gray-600">
              Forgot password?
            </Link>
          </div>

          <button type="submit" disabled={loading} className={buttonStyles.primary}>
            {loading ? (
              <div className={loadingStyles.wrapper}>
                <div className={loadingStyles.spinner}></div>
                Signing in...
              </div>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-400">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-gray-900 hover:text-gray-700">
            Create Account
          </Link>
        </p>
        <p className="mt-3 text-center">
          <Link to="/" className="text-xs text-gray-400 hover:text-violet-600 transition-colors">
            ← Back to Homepage
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
