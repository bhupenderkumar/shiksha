export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      Attendance: {
        Row: {
          id: string
          date: string
          status: 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY'
          studentId: string
          classId: string
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id?: string
          date: string
          status: 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY'
          studentId: string
          classId: string
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          date?: string
          status?: 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY'
          studentId?: string
          classId?: string
          createdAt?: string
          updatedAt?: string
        }
      }
      Staff: {
        Row: {
          id: string
          role: 'TEACHER' | 'ADMIN' | 'PRINCIPAL' | 'ACCOUNTANT'
          name: string
          email: string
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id?: string
          role: 'TEACHER' | 'ADMIN' | 'PRINCIPAL' | 'ACCOUNTANT'
          name: string
          email: string
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          role?: 'TEACHER' | 'ADMIN' | 'PRINCIPAL' | 'ACCOUNTANT'
          name?: string
          email?: string
          createdAt?: string
          updatedAt?: string
        }
      }
      Student: {
        Row: {
          id: string
          name: string
          email: string
          classId: string
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          classId: string
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          classId?: string
          createdAt?: string
          updatedAt?: string
        }
      }
      Profile: {
        Row: {
          id: string
          user_id: string
          full_name: string | null
          avatar_url: string | null
          role: string
        }
        Insert: {
          id?: string
          user_id: string
          full_name?: string | null
          avatar_url?: string | null
          role: string
        }
        Update: {
          id?: string
          user_id?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: string
        }
      }
      Homework: {
        Row: {
          id: string
          title: string
          description: string
          dueDate: string
          status: 'PENDING' | 'SUBMITTED' | 'GRADED' | 'LATE'
          subjectId: string
          classId: string
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          dueDate: string
          status?: 'PENDING' | 'SUBMITTED' | 'GRADED' | 'LATE'
          subjectId: string
          classId: string
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          dueDate?: string
          status?: 'PENDING' | 'SUBMITTED' | 'GRADED' | 'LATE'
          subjectId?: string
          classId?: string
          createdAt?: string
          updatedAt?: string
        }
      }
      Fee: {
        Row: {
          id: string
          amount: number
          status: 'PENDING' | 'PAID' | 'OVERDUE'
          studentId: string
          dueDate: string
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id?: string
          amount: number
          status?: 'PENDING' | 'PAID' | 'OVERDUE'
          studentId: string
          dueDate: string
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          amount?: number
          status?: 'PENDING' | 'PAID' | 'OVERDUE'
          studentId?: string
          dueDate?: string
          createdAt?: string
          updatedAt?: string
        }
      }
      File: {
        Row: {
          id: string
          fileName: string
          filePath: string
          fileType: string
          uploadedBy: string
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id?: string
          fileName: string
          filePath: string
          fileType: string
          uploadedBy: string
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          fileName?: string
          filePath?: string
          fileType?: string
          uploadedBy?: string
          createdAt?: string
          updatedAt?: string
        }
      }
    }
  }
}
