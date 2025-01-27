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
