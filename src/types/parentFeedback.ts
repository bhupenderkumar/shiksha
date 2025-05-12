// Types for parent feedback and certificates

export interface ParentFeedback {
  id: string;
  class_id: string;
  student_name: string;
  month: string;
  good_things: string;
  need_to_improve: string;
  best_can_do: string;
  attendance_percentage: number;
  student_photo_url?: string;
  father_photo_url?: string;
  mother_photo_url?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  className?: string; // Joined field
  classSection?: string; // Joined field
}

export interface FeedbackCertificate {
  id: string;
  feedback_id: string;
  certificate_url?: string;
  download_count: number;
  created_at: string;
  updated_at: string;
}

export interface ParentFeedbackFormData {
  class_id: string;
  student_name: string;
  month: string;
  good_things: string;
  need_to_improve: string;
  best_can_do: string;
  attendance_percentage: number;
  student_photo_url?: string;
}

export interface FeedbackSearchParams {
  class_id?: string;
  student_name?: string;
  month?: string;
}

// Types for parent submitted feedback
export interface ParentSubmittedFeedback {
  id: string;
  class_id: string;
  student_name: string;
  parent_name: string;
  parent_relation: string;
  month: string;
  feedback: string;
  progress_feedback: string;
  admin_feedback?: string; // Optional admin feedback
  admin_feedback_date?: string; // Date when admin feedback was added
  created_at: string;
  updated_at: string;
  status: 'PENDING' | 'REVIEWED' | 'RESPONDED';
  className?: string; // Joined field
  classSection?: string; // Joined field
}

export interface ParentSubmittedFeedbackFormData {
  class_id: string;
  student_name: string;
  parent_name: string;
  parent_relation: string;
  month: string;
  feedback: string;
  progress_feedback: string; // Added progress_feedback field
}

export interface CertificateData {
  studentName: string;
  className: string;
  classSection?: string;
  month: string;
  goodThings: string;
  needToImprove: string;
  bestCanDo: string;
  attendancePercentage: number;
  studentPhotoUrl?: string;
  fatherPhotoUrl?: string;
  motherPhotoUrl?: string;
  schoolName: string;
  schoolAddress: string;
  date: string;
}

export interface ClassOption {
  id: string;
  name: string;
  section: string;
}

export const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
];
