import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { KeyRound } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/api-client';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import {
  authPageStyles,
  cardStyles,
  inputStyles,
  buttonStyles,
  linkStyles,
  textStyles,
} from '@/styles/theme';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      toast.success('Password reset instructions sent to your email');
      setEmail('');
    } catch (error) {
      toast.error('Failed to send reset instructions');
      console.error('Reset password error:', error);
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
            <KeyRound className={`w-12 h-12 ${authPageStyles.iconColor}`} />
          </div>
        </div>
        <h2 className={authPageStyles.title}>
          Reset your password
        </h2>
        <p className={authPageStyles.subtitle}>
          Enter your email address and we'll send you instructions to reset your password.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className={cardStyles.container}>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className={inputStyles.label}>
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputStyles.base}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className={buttonStyles.primary}
              >
                {loading ? 'Sending...' : 'Send reset instructions'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="relative flex justify-center text-sm">
                <span className={textStyles.dividerText}>
                  Remember your password?{' '}
                  <Link to="/login" className={linkStyles.primary}>
                    Sign in
                  </Link>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;