export const ROLES = {
  ADMIN: 'ADMIN',
  TEACHER: 'TEACHER',
  STUDENT: 'STUDENT'
} as const;

export const GENDERS = {
  MALE: 'Male',
  FEMALE: 'Female',
  OTHER: 'Other'
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
export const ID_CARD_TABLE = 'IDCard';
export const SCHEMA = 'school';
export const PROFILE_TABLE = 'Profile';

export const ADMISSION_TABLES = {
  PROSPECTIVE_STUDENT: 'ProspectiveStudent',
  ADMISSION_PROCESS: 'AdmissionProcess',
  ADMISSION_COMMUNICATION: 'AdmissionCommunication',
  ADMISSION_NOTES: 'AdmissionNotes'
} as const;

export const ADMISSION_BUCKET = 'admission-documents';
export const PROSPECTIVE_STUDENT_TABLE = 'ProspectiveStudent';
export const ADMISSION_PROCESS_TABLE = 'AdmissionProcess';
export const ADMISSION_COMMUNICATION_TABLE = 'AdmissionCommunication';

export const ADMISSION_STATUS = {
  NEW: 'NEW',
  IN_REVIEW: 'IN_REVIEW',
  SCHEDULED_INTERVIEW: 'SCHEDULED_INTERVIEW',
  PENDING_DOCUMENTS: 'PENDING_DOCUMENTS',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  ENROLLED: 'ENROLLED'
} as const;

export const COMMUNICATION_TYPES = {
  PHONE: 'PHONE',
  EMAIL: 'EMAIL',
  MEETING: 'MEETING',
  SMS: 'SMS',
  WHATSAPP: 'WHATSAPP',
  IN_PERSON: 'in_person',
  OTHER: 'OTHER'
} as const;

export const REQUIRED_DOCUMENTS = [
  'birth_certificate',
  'transfer_certificate',
  'previous_marksheet',
  'report_card',
  'medical_records',
  'medical_certificate',
  'passport_photo',
  'address_proof',
  'aadhar_card',
  'parent_id_proof',
  'student_photo',
  'father_photo',
  'mother_photo'
] as const;

export const DOCUMENT_STATUS = {
  PENDING: 'pending',
  SUBMITTED: 'submitted',
  VERIFIED: 'verified',
  REJECTED: 'rejected'
} as const;

export const DOCUMENT_VERIFICATION_STATUS = {
  PENDING: 'pending',
  VERIFIED: 'verified',
  REJECTED: 'rejected'
} as const;

export const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/register',
  '/homework/view/:id',
  '/homework/:id',
  '/classwork/:id',
  '/admission-enquiry',
  '/id-card'
] as const;

// Environment variables should be used instead of hardcoding API keys
export const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
export const YOUTUBE_CHANNEL_ID = import.meta.env.VITE_YOUTUBE_CHANNEL_ID;

if (!YOUTUBE_API_KEY || !YOUTUBE_CHANNEL_ID) {
  console.warn('YouTube API configuration is missing. YouTube features will be disabled.');
}

export const SCHOOL_INFO = {
  name: 'First Step School',
  address: 'Saurabh Vihar , Delhi 110044',
  phone: '+91-9667935518, +91-9717267473',
  email: 'firststepschool22@gmail.com',
  website: 'www.myfirststepschool.com',
  principalName: 'Dr. Jyoti Sharma'
};
