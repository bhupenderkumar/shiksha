export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      Attendance: {
        Row: {
          id: string;
          date: string;
          status: 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY';
          studentId: string;
          classId: string;
          createdAt: string;
          updatedAt: string;
        };
        Insert: {
          id?: string;
          date: string;
          status: 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY';
          studentId: string;
          classId: string;
          createdAt?: string;
          updatedAt?: string;
        };
        Update: {
          id?: string;
          date?: string;
          status?: 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY';
          studentId?: string;
          classId?: string;
          createdAt?: string;
          updatedAt?: string;
        };
      };
      Staff: {
        Row: {
          id: string;
          role: 'TEACHER' | 'ADMIN' | 'PRINCIPAL' | 'ACCOUNTANT';
          name: string;
          email: string;
          createdAt: string;
          updatedAt: string;
        };
        Insert: {
          id?: string;
          role: 'TEACHER' | 'ADMIN' | 'PRINCIPAL' | 'ACCOUNTANT';
          name: string;
          email: string;
          createdAt?: string;
          updatedAt?: string;
        };
        Update: {
          id?: string;
          role?: 'TEACHER' | 'ADMIN' | 'PRINCIPAL' | 'ACCOUNTANT';
          name?: string;
          email?: string;
          createdAt?: string;
          updatedAt?: string;
        };
      };
      Student: {
        Row: {
          id: string;
          name: string;
          email: string;
          classId: string;
          createdAt: string;
          updatedAt: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          classId: string;
          createdAt?: string;
          updatedAt?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          classId?: string;
          createdAt?: string;
          updatedAt?: string;
        };
      };
      Profile: {
        Row: {
          id: string;
          user_id: string;
          full_name: string | null;
          avatar_url: string | null;
          role: string;
          classId: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role: string;
          classId: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: string;
          classId?: string;
        };
      };
      File: {
        Row: {
          id: string;
          fileName: string;
          filePath: string;
          fileType: string;
          uploadedBy: string;
          createdAt: string;
          updatedAt: string;
        };
        Insert: {
          id?: string;
          fileName: string;
          filePath: string;
          fileType: string;
          uploadedBy: string;
          createdAt?: string;
          updatedAt?: string;
        };
        Update: {
          id?: string;
          fileName?: string;
          filePath?: string;
          fileType?: string;
          uploadedBy?: string;
          createdAt?: string;
          updatedAt?: string;
        };
      };
    };
  };
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
          created_at: string;
          updated_at: string;
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
          created_at?: string;
          updated_at?: string;
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
          created_at?: string;
          updated_at?: string;
        };
      };
      admission_process: {
        Row: {
          id: string;
          prospective_student_id: string;
          assigned_class_id: string | null;
          admission_number: string | null;
          documents_required: Json;
          documents_submitted: Json;
          interview_date: string | null;
          interview_notes: string | null;
          fee_details: Json | null;
          approved_by: string | null;
          student_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          prospective_student_id: string;
          assigned_class_id?: string | null;
          admission_number?: string | null;
          documents_required?: Json;
          documents_submitted?: Json;
          interview_date?: string | null;
          interview_notes?: string | null;
          fee_details?: Json | null;
          approved_by?: string | null;
          student_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          prospective_student_id?: string;
          assigned_class_id?: string | null;
          admission_number?: string | null;
          documents_required?: Json;
          documents_submitted?: Json;
          interview_date?: string | null;
          interview_notes?: string | null;
          fee_details?: Json | null;
          approved_by?: string | null;
          student_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      admission_communication: {
        Row: {
          id: string;
          prospective_student_id: string;
          communication_type: string;
          notes: string;
          staff_id: string;
          communication_date: string;
          direction: 'incoming' | 'outgoing';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          prospective_student_id: string;
          communication_type: string;
          notes: string;
          staff_id: string;
          communication_date?: string;
          direction?: 'incoming' | 'outgoing';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          prospective_student_id?: string;
          communication_type?: string;
          notes?: string;
          staff_id?: string;
          communication_date?: string;
          direction?: 'incoming' | 'outgoing';
          created_at?: string;
          updated_at?: string;
        };
      };
      admission_notes: {
        Row: {
          id: string;
          prospective_student_id: string;
          content: string;
          created_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          prospective_student_id: string;
          content: string;
          created_by: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          prospective_student_id?: string;
          content?: string;
          created_by?: string;
          created_at?: string;
        };
      };
    };
  };
}
