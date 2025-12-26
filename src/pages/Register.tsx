import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { UserPlus } from 'lucide-react';
import { signUp } from '@/services/authservice';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import {
  authPageStyles,
  cardStyles,
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
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className={authPageStyles.iconWrapper}>
            <UserPlus className={`w-12 h-12 ${authPageStyles.iconColor}`} />
          </div>
        </div>
        <h2 className={authPageStyles.title}>
          Create your account
        </h2>
        <p className={authPageStyles.subtitle}>
          Join our community today
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className={cardStyles.container}>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label htmlFor="fullName" className={inputStyles.label}>
                Full Name
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={inputStyles.base}
                placeholder="Enter your full name"
              />
            </div>

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
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputStyles.base}
                placeholder="Create a password"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="role" className={inputStyles.label}>
                I am a
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('student')}
                  className={role === 'student' ? buttonStyles.roleActive : buttonStyles.roleInactive}
                >
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => setRole('teacher')}
                  className={role === 'teacher' ? buttonStyles.roleActive : buttonStyles.roleInactive}
                >
                  Teacher
                </button>
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
                    Creating account...
                  </div>
                ) : (
                  'Create account'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="relative flex justify-center text-sm">
                <span className={textStyles.dividerText}>
                  Already have an account?{' '}
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

export default Register;
