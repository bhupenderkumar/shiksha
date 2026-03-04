import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { User, Mail, Lock, Eye, EyeOff, GraduationCap, BookOpen } from 'lucide-react';
import { signUp } from '@/services/authservice';
import { SCHOOL_INFO } from '@/lib/constants';

import {
  authPageStyles,
  inputStyles,
  buttonStyles,
  linkStyles,
  textStyles,
  loadingStyles,
} from '@/styles/theme';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('student');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      if (!email || !fullName || !role) {
        throw new Error('All fields are required');
      }

      const { error } = await signUp(email, password, role, fullName);
      if (error) throw error;

      toast.success('Registration successful! Please sign in.');
      navigate('/login');
    } catch (error: any) {
      toast.error(error.message || 'Failed to register. Please try again.');
      console.error('Registration error:', error);
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
        <h2 className={authPageStyles.formTitle}>Create account</h2>
        <p className={authPageStyles.formSubtitle}>Join our school community</p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="fullName" className={inputStyles.label}>Full Name</label>
            <div className="relative">
              <div className={inputStyles.iconWrapper}>
                <User className="w-4 h-4" />
              </div>
              <input
                id="fullName"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={inputStyles.withIcon}
                placeholder="Your full name"
              />
            </div>
          </div>

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
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputStyles.withIcon}
                placeholder="Min. 6 characters"
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

          <div>
            <label className={inputStyles.label}>I am a</label>
            <div className="flex gap-3 mt-1">
              <button
                type="button"
                onClick={() => setRole('student')}
                className={role === 'student' ? buttonStyles.roleActive : buttonStyles.roleInactive}
              >
                <span className="flex items-center justify-center gap-1.5">
                  <GraduationCap className="w-4 h-4" />
                  Student
                </span>
              </button>
              <button
                type="button"
                onClick={() => setRole('teacher')}
                className={role === 'teacher' ? buttonStyles.roleActive : buttonStyles.roleInactive}
              >
                <span className="flex items-center justify-center gap-1.5">
                  <BookOpen className="w-4 h-4" />
                  Teacher
                </span>
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className={buttonStyles.primary}>
            {loading ? (
              <div className={loadingStyles.wrapper}>
                <div className={loadingStyles.spinner}></div>
                Creating account...
              </div>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-gray-900 hover:text-gray-700">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
