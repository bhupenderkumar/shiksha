import { Gender } from './admission';

export interface IDCardData {
  // Student Information
  id?: string;
  studentName: string;
  classId: string;
  className?: string;
  section?: string;
  admissionNumber?: string;
  dateOfBirth?: string;
  studentPhoto: File | string;
  
  // Parent Information
  fatherName: string;
  motherName: string;
  fatherPhoto: File | string;
  motherPhoto: File | string;
  fatherMobile: string;
  motherMobile: string;
  address: string;
  
  // Metadata
  createdAt?: Date;
  downloadCount?: number;
}

export interface IDCardRow {
  id: string;
  student_name: string;
  class_id: string;
  student_photo_url: string;
  date_of_birth?: string;
  father_name: string;
  mother_name: string;
  father_photo_url: string;
  mother_photo_url: string;
  father_mobile: string;
  mother_mobile: string;
  address: string;
  created_at: string;
  download_count: number;
}

export interface ClassOption {
  id: string;
  name: string;
  section: string;
}

export type PhotoType = 'student' | 'father' | 'mother';