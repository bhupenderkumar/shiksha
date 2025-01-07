export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  STUDENTS: '/students',
  TEACHERS: '/teachers',
  SUBJECTS: '/subjects',
  CLASSES: '/classes',
  FEES: '/fees',
  HOMEWORK: '/homework',
  CLASSWORK: '/classwork',
  ATTENDANCE: '/attendance',
  SETTINGS: '/settings',
} as const;

export const API_ENDPOINTS = {
  STUDENTS: 'students',
  TEACHERS: 'teachers',
  SUBJECTS: 'subjects',
  CLASSES: 'classes',
  FEES: 'fees',
  HOMEWORK: 'homework',
  ATTENDANCE: 'attendance',
} as const;

export const ROLES = {
  ADMIN: 'ADMIN',
  TEACHER: 'TEACHER',
  STUDENT: 'STUDENT',
} as const;

export const STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  PENDING: 'PENDING',
} as const;

export const FORM_VALIDATION = {
  NAME: {
    required: 'Name is required',
    minLength: { value: 2, message: 'Name must be at least 2 characters' },
    maxLength: { value: 50, message: 'Name must not exceed 50 characters' },
  },
  EMAIL: {
    required: 'Email is required',
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message: 'Invalid email address',
    },
  },
  PHONE: {
    required: 'Phone number is required',
    pattern: {
      value: /^[0-9]{10}$/,
      message: 'Invalid phone number',
    },
  },
} as const; 