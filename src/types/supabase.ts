export type Database = {
  public: {
    Tables: {
      Attendance: {
        Row: {
          classId: string
          createdAt: string
          date: string
          id: string
          isPresent: boolean
          studentId: string
        }
        Insert: {
          classId: string
          createdAt?: string
          date: string
          id?: string
          isPresent: boolean
          studentId: string
        }
        Update: {
          classId?: string
          createdAt?: string
          date?: string
          id?: string
          isPresent?: boolean
          studentId?: string
        }
      }
      Class: {
        Row: {
          createdAt: string
          id: string
          name: string
          updatedAt: string
        }
        Insert: {
          createdAt?: string
          id?: string
          name: string
          updatedAt?: string
        }
        Update: {
          createdAt?: string
          id?: string
          name?: string
          updatedAt?: string
        }
      }
      Fee: {
        Row: {
          amount: number
          createdAt: string
          dueDate: string
          id: string
          isPaid: boolean
          studentId: string
          updatedAt: string
        }
        Insert: {
          amount: number
          createdAt?: string
          dueDate: string
          id?: string
          isPaid?: boolean
          studentId: string
          updatedAt?: string
        }
        Update: {
          amount?: number
          createdAt?: string
          dueDate?: string
          id?: string
          isPaid?: boolean
          studentId?: string
          updatedAt?: string
        }
      }
      Homework: {
        Row: {
          classId: string
          createdAt: string
          description: string
          dueDate: string
          id: string
          subjectId: string
          title: string
          updatedAt: string
        }
        Insert: {
          classId: string
          createdAt?: string
          description: string
          dueDate: string
          id?: string
          subjectId: string
          title: string
          updatedAt?: string
        }
        Update: {
          classId?: string
          createdAt?: string
          description?: string
          dueDate?: string
          id?: string
          subjectId?: string
          title?: string
          updatedAt?: string
        }
      }
      HomeworkSubmission: {
        Row: {
          createdAt: string
          homeworkId: string
          id: string
          studentId: string
          submissionDate: string | null
          submissionText: string | null
          updatedAt: string
        }
        Insert: {
          createdAt?: string
          homeworkId: string
          id?: string
          studentId: string
          submissionDate?: string | null
          submissionText?: string | null
          updatedAt?: string
        }
        Update: {
          createdAt?: string
          homeworkId?: string
          id?: string
          studentId?: string
          submissionDate?: string | null
          submissionText?: string | null
          updatedAt?: string
        }
      }
      Notification: {
        Row: {
          createdAt: string
          id: string
          message: string
          studentId: string
          title: string
          type: string
          updatedAt: string
        }
        Insert: {
          createdAt?: string
          id?: string
          message: string
          studentId: string
          title: string
          type: string
          updatedAt?: string
        }
        Update: {
          createdAt?: string
          id?: string
          message?: string
          studentId?: string
          title?: string
          type?: string
          updatedAt?: string
        }
      }
      Profile: {
        Row: {
          avatar_url: string | null
          full_name: string | null
          id: string
          updated_at: string | null
          username: string | null
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
          username?: string | null
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
          username?: string | null
          website?: string | null
        }
      }
      Student: {
        Row: {
          address: string
          admissionNumber: string
          bloodGroup: string | null
          classId: string
          contactNumber: string
          createdAt: string
          dateOfBirth: string
          gender: string
          id: string
          name: string
          parentContact: string
          parentEmail: string
          parentName: string
          updatedAt: string
        }
        Insert: {
          address: string
          admissionNumber: string
          bloodGroup?: string | null
          classId: string
          contactNumber: string
          createdAt?: string
          dateOfBirth: string
          gender: string
          id?: string
          name: string
          parentContact: string
          parentEmail: string
          parentName: string
          updatedAt?: string
        }
        Update: {
          address?: string
          admissionNumber?: string
          bloodGroup?: string | null
          classId?: string
          contactNumber?: string
          createdAt?: string
          dateOfBirth?: string
          gender?: string
          id?: string
          name?: string
          parentContact?: string
          parentEmail?: string
          parentName?: string
          updatedAt?: string
        }
      }
      Subject: {
        Row: {
          classId: string
          createdAt: string
          id: string
          name: string
          updatedAt: string
        }
        Insert: {
          classId: string
          createdAt?: string
          id?: string
          name: string
          updatedAt?: string
        }
        Update: {
          classId?: string
          createdAt?: string
          id?: string
          name?: string
          updatedAt?: string
        }
      }
      UserClassRole: {
        Row: {
          class_id: string
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          class_id: string
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          class_id?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Student = Database['public']['Tables']['Student']['Row'];
