// Types for student feedback and certificates

export interface StudentFeedback {
  id: string;
  class_id: string;
  student_name: string;
  month: string;
  good_things: string;
  need_to_improve: string;
  best_can_do: string;
  attendance_percentage: number;
  student_photo_url?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  className?: string; // Joined field
}

export interface FeedbackCertificate {
  id: string;
  feedback_id: string;
  certificate_url?: string;
  download_count: number;
  created_at: string;
  updated_at: string;
}

export interface StudentFeedbackFormData {
  class_id: string;
  student_name: string;
  month: string;
  good_things: string;
  need_to_improve: string;
  best_can_do: string;
  attendance_percentage: number;
  student_photo?: File | string;
}

export interface FeedbackSearchParams {
  class_id?: string;
  student_name?: string;
  month?: string;
}

export interface CertificateData {
  studentName: string;
  className: string;
  month: string;
  goodThings: string;
  needToImprove: string;
  bestCanDo: string;
  attendancePercentage: number;
  studentPhotoUrl?: string;
  schoolName: string;
  schoolAddress: string;
  date: string;
}
