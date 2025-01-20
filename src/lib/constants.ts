export const ROLES = {
  ADMIN: 'ADMIN',
  TEACHER: 'TEACHER',
  STUDENT: 'STUDENT'
} as const;

export const GENDERS = {
  MALE: 'MALE',
  FEMALE: 'FEMALE',
  OTHER: 'OTHER'
} as const;

export const STORAGE_BUCKET = 'File';
export const FILE_TABLE = 'File';
export const ASSIGNMENT_TABLE = 'Homework';
export const ATTENDANCE_TABLE = 'Attendance';
export const CLASS_TABLE = 'Class';
export const CLASSWORK_TABLE = 'Classwork';
export const DASHBOARD_TABLE = 'Dashboard';
export const FEE_TABLE = 'Fee';
export const FEEDBACK_TABLE = 'feedback';
export const HOMEWORK_TABLE = 'Homework';
export const NOTIFICATION_TABLE = 'Notification';
export const STUDENT_TABLE = 'Student';
export const SUBJECT_TABLE = 'Subject';
export const STAFF_TABLE = 'Staff';
export const SETTINGS_TABLE = 'Settings';
export const USER_SETTINGS_TABLE = 'UserSettings';
export const USER_TABLE = 'User';
export const SCHEMA = 'school';
export const PROFILE_TABLE = 'Profile'

export const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/register',
  '/homework/view/:id',
  '/homework/:id',
  '/classwork/:id'
];

// Environment variables should be used instead of hardcoding API keys
export const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
export const YOUTUBE_CHANNEL_ID = import.meta.env.VITE_YOUTUBE_CHANNEL_ID;

if (!YOUTUBE_API_KEY || !YOUTUBE_CHANNEL_ID) {
  console.warn('YouTube API configuration is missing. YouTube features will be disabled.');
}
