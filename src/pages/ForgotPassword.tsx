import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/api-client';
import { SCHOOL_INFO } from '@/lib/constants';

import {
  authPageStyles,
  inputStyles,
  buttonStyles,
  loadingStyles,
} from '@/styles/theme';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      toast.success('Password reset instructions sent to your email');
      setSent(true);
    } catch (error) {
      toast.error('Failed to send reset instructions');
      console.error('Reset password error:', error);
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
        {sent ? (
          <div className="text-center py-4">
            <div className="w-14 h-14 mx-auto bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
              <Mail className="w-6 h-6 text-gray-600" />
            </div>
            <h2 className={authPageStyles.formTitle}>Check your email</h2>
            <p className="mt-2 text-sm text-gray-400 leading-relaxed">
              We sent reset instructions to<br />
              <span className="font-medium text-gray-700">{email}</span>
            </p>
            <Link
              to="/login"
              className={`${buttonStyles.secondary} mt-6 inline-flex items-center justify-center gap-2`}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Sign In
            </Link>
          </div>
        ) : (
          <>
            <h2 className={authPageStyles.formTitle}>Reset password</h2>
            <p className={authPageStyles.formSubtitle}>
              Enter your email to receive reset instructions
            </p>

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

              <button type="submit" disabled={loading} className={buttonStyles.primary}>
                {loading ? (
                  <div className={loadingStyles.wrapper}>
                    <div className={loadingStyles.spinner}></div>
                    Sending...
                  </div>
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-400">
              Remember your password?{' '}
              <Link to="/login" className="font-medium text-gray-900 hover:text-gray-700">
                Sign In
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;