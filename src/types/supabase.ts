export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  school: {
    Tables: {
      prospective_student: {
        Row: {
          id: string;
          student_name: string;
          parent_name: string;
          date_of_birth: string | null;
          gender: 'Male' | 'Female' | 'Other';
          email: string;
          contact_number: string;
          grade_applying: string;
          current_school: string | null;
          address: string;
          blood_group: string | null;
          status: string;
          applied_date: string;
          last_update_date: string;
          school_id: string;
          assigned_to: string | null;
        };
        Insert: {
          id?: string;
          student_name: string;
          parent_name: string;
          date_of_birth?: string | null;
          gender: 'Male' | 'Female' | 'Other';
          email: string;
          contact_number: string;
          grade_applying: string;
          current_school?: string | null;
          address: string;
          blood_group?: string | null;
          status: string;
          applied_date?: string;
          last_update_date?: string;
          school_id: string;
          assigned_to?: string | null;
        };
        Update: {
          id?: string;
          student_name?: string;
          parent_name?: string;
          date_of_birth?: string | null;
          gender?: 'Male' | 'Female' | 'Other';
          email?: string;
          contact_number?: string;
          grade_applying?: string;
          current_school?: string | null;
          address?: string;
          blood_group?: string | null;
          status?: string;
          applied_date?: string;
          last_update_date?: string;
          school_id?: string;
          assigned_to?: string | null;
        };
      };
      AdmissionNotes: {
        Row: {
          id: string;
          prospectivestudentid: string;
          content: string;
          createdby: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          prospectivestudentid: string;
          content: string;
          createdby: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          prospectivestudentid?: string;
          content?: string;
          createdby?: string;
          created_at?: string;
        };
      };
      IDCard: {
        Row: {
          id: string;
          student_name: string;
          class_id: string;
          student_photo_url: string;
          father_name: string;
          mother_name: string;
          father_photo_url: string;
          mother_photo_url: string;
          father_mobile: string;
          mother_mobile: string;
          address: string;
          created_at: string;
          download_count: number;
        };
        Insert: {
          id?: string;
          student_name: string;
          class_id: string;
          student_photo_url?: string;
          father_name: string;
          mother_name: string;
          father_photo_url?: string;
          mother_photo_url?: string;
          father_mobile: string;
          mother_mobile: string;
          address: string;
          created_at?: string;
          download_count?: number;
        };
        Update: {
          id?: string;
          student_name?: string;
          class_id?: string;
          student_photo_url?: string;
          father_name?: string;
          mother_name?: string;
          father_photo_url?: string;
          mother_photo_url?: string;
          father_mobile?: string;
          mother_mobile?: string;
          address?: string;
          created_at?: string;
          download_count?: number;
        };
      };
    };
  };
  
  public: {
    Tables: {
      Attendance: {
        Row: {
          id: string;
          date: string;
          status: 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY';
          studentid: string;
          classid: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          date: string;
          status: 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY';
          studentid: string;
          classid: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          date?: string;
          status?: 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY';
          studentid?: string;
          classid?: string;
          created_at?: string;
          updated_at?: string;
        };
      };

      Staff: {
        Row: {
          id: string;
          role: 'TEACHER' | 'ADMIN' | 'PRINCIPAL' | 'ACCOUNTANT';
          name: string;
          email: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;

          role: 'TEACHER' | 'ADMIN' | 'PRINCIPAL' | 'ACCOUNTANT';
          name: string;
          email: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          role?: 'TEACHER' | 'ADMIN' | 'PRINCIPAL' | 'ACCOUNTANT';
          name?: string;
          email?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}
