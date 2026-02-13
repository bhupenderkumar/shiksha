export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  STUDENTS: '/students',
  HOMEWORK: '/homework',
  CLASSWORK: '/classwork',
  ATTENDANCE: '/attendance',
  FEES: '/fees',
  FEEDBACK: '/feedback',
  SETTINGS: '/settings',
  STUDENT_DETAIL: '/students/:id',
  HOMEWORK_DETAIL: '/homework/:id',
  CLASSWORK_DETAIL: '/classwork/:id',
  INTERACTIVE_ASSIGNMENTS: '/interactive-assignments',
  INTERACTIVE_ASSIGNMENT_DETAIL: '/interactive-assignments/:id',
  INTERACTIVE_ASSIGNMENT_CREATE: '/interactive-assignments/create',
  INTERACTIVE_ASSIGNMENT_EDIT: '/interactive-assignments/edit/:id',
  INTERACTIVE_ASSIGNMENT_VIEW: '/interactive-assignments/view/:id',
  PARENT_FEEDBACK_LIST: '/parent-feedback-list',
  PARENT_FEEDBACK_FORM: '/parent-feedback-form',
  PARENT_FEEDBACK_FORM_EDIT: '/parent-feedback-form/:id',
  PARENT_FEEDBACK_SEARCH: '/parent-feedback-search',
  PARENT_FEEDBACK: '/parent-feedback',
  VIEW_ALL_PARENT_FEEDBACK: '/view-all-parent-feedback',
  ADMIN_FEEDBACK: '/admin-feedback',
  BIRTHDAYS: '/birthdays',
  BIRTHDAY_DETAIL: '/birthday/:studentId',
  FEE_STRUCTURE: '/fee-structure',
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