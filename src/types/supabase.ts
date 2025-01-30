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
      ProspectiveStudent: {
        Row: {
          id: string;
          studentname: string;
          parentname: string;
          email: string;
          contactnumber: string;
          gradeapplying: string;
          gender: string;
          dateofbirth: string | null;
          address: string;
          status: string;
          applieddate: string;
          lastupdatedate: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          studentname: string;
          parentname: string;
          email: string;
          contactnumber: string;
          gradeapplying: string;
          gender: string;
          dateofbirth?: string | null;
          address: string;
          status?: string;
          applieddate?: string;
          lastupdatedate?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          studentname?: string;
          parentname?: string;
          email?: string;
          contactnumber?: string;
          gradeapplying?: string;
          gender?: string;
          dateofbirth?: string | null;
          address?: string;
          status?: string;
          applieddate?: string;
          lastupdatedate?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      AdmissionProcess: {
        Row: {
          id: string;
          prospectivestudentid: string;
          documentsrequired: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          prospectivestudentid: string;
          documentsrequired?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          prospectivestudentid?: string;
          documentsrequired?: Json;
          created_at?: string;
          updated_at?: string;
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

          date: string;
          status: 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY';
          studentid: string;
          classid: string;
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
