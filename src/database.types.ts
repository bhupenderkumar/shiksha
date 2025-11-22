export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  school: {
    Tables: {
      AcademicYear: {
        Row: {
          created_at: string | null
          end_date: string
          id: string
          start_date: string
          status: string | null
          updated_at: string | null
          year_name: string
        }
        Insert: {
          created_at?: string | null
          end_date: string
          id?: string
          start_date: string
          status?: string | null
          updated_at?: string | null
          year_name: string
        }
        Update: {
          created_at?: string | null
          end_date?: string
          id?: string
          start_date?: string
          status?: string | null
          updated_at?: string | null
          year_name?: string
        }
        Relationships: []
      }
      admissioncommunication: {
        Row: {
          communicationdate: string
          communicationtype: string
          created_at: string
          id: string
          notes: string | null
          prospectivestudentid: string
          staffid: string
          updated_at: string
        }
        Insert: {
          communicationdate?: string
          communicationtype: string
          created_at?: string
          id: string
          notes?: string | null
          prospectivestudentid: string
          staffid: string
          updated_at?: string
        }
        Update: {
          communicationdate?: string
          communicationtype?: string
          created_at?: string
          id?: string
          notes?: string | null
          prospectivestudentid?: string
          staffid?: string
          updated_at?: string
        }
        Relationships: []
      }
      AdmissionCommunication: {
        Row: {
          communicationDate: string
          communicationType: string
          createdAt: string
          id: string
          notes: string
          prospectiveStudentId: string
          staffId: string
          updatedAt: string
        }
        Insert: {
          communicationDate?: string
          communicationType: string
          createdAt?: string
          id: string
          notes: string
          prospectiveStudentId: string
          staffId: string
          updatedAt?: string
        }
        Update: {
          communicationDate?: string
          communicationType?: string
          createdAt?: string
          id?: string
          notes?: string
          prospectiveStudentId?: string
          staffId?: string
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "AdmissionCommunication_prospectiveStudentId_fkey"
            columns: ["prospectiveStudentId"]
            isOneToOne: false
            referencedRelation: "ProspectiveStudent"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "AdmissionCommunication_staffId_fkey"
            columns: ["staffId"]
            isOneToOne: false
            referencedRelation: "Staff"
            referencedColumns: ["id"]
          },
        ]
      }
      admissionnotes: {
        Row: {
          content: string
          createdat: string
          createdby: string
          id: string
          prospectivestudentid: string
        }
        Insert: {
          content: string
          createdat?: string
          createdby: string
          id: string
          prospectivestudentid: string
        }
        Update: {
          content?: string
          createdat?: string
          createdby?: string
          id?: string
          prospectivestudentid?: string
        }
        Relationships: []
      }
      AdmissionNotes: {
        Row: {
          content: string
          createdat: string
          createdby: string
          id: string
          prospectivestudentid: string
        }
        Insert: {
          content: string
          createdat?: string
          createdby: string
          id: string
          prospectivestudentid: string
        }
        Update: {
          content?: string
          createdat?: string
          createdby?: string
          id?: string
          prospectivestudentid?: string
        }
        Relationships: []
      }
      admissionprocess: {
        Row: {
          assignedclass: string | null
          createdat: string
          documentsrequired: Json
          id: string
          interviewdate: string | null
          prospectivestudentid: string
          updatedat: string
        }
        Insert: {
          assignedclass?: string | null
          createdat?: string
          documentsrequired?: Json
          id: string
          interviewdate?: string | null
          prospectivestudentid: string
          updatedat?: string
        }
        Update: {
          assignedclass?: string | null
          createdat?: string
          documentsrequired?: Json
          id?: string
          interviewdate?: string | null
          prospectivestudentid?: string
          updatedat?: string
        }
        Relationships: []
      }
      AdmissionProcess: {
        Row: {
          admissionNumber: string | null
          approvedBy: string | null
          assignedClassId: string | null
          createdAt: string
          documentsRequired: Json | null
          documentsSubmitted: Json | null
          feeDetails: Json | null
          id: string
          interviewDate: string | null
          interviewNotes: string | null
          prospectiveStudentId: string
          studentId: string | null
          updatedAt: string
        }
        Insert: {
          admissionNumber?: string | null
          approvedBy?: string | null
          assignedClassId?: string | null
          createdAt?: string
          documentsRequired?: Json | null
          documentsSubmitted?: Json | null
          feeDetails?: Json | null
          id: string
          interviewDate?: string | null
          interviewNotes?: string | null
          prospectiveStudentId: string
          studentId?: string | null
          updatedAt?: string
        }
        Update: {
          admissionNumber?: string | null
          approvedBy?: string | null
          assignedClassId?: string | null
          createdAt?: string
          documentsRequired?: Json | null
          documentsSubmitted?: Json | null
          feeDetails?: Json | null
          id?: string
          interviewDate?: string | null
          interviewNotes?: string | null
          prospectiveStudentId?: string
          studentId?: string | null
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "AdmissionProcess_approvedBy_fkey"
            columns: ["approvedBy"]
            isOneToOne: false
            referencedRelation: "Staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "AdmissionProcess_assignedClassId_fkey"
            columns: ["assignedClassId"]
            isOneToOne: false
            referencedRelation: "Class"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "AdmissionProcess_prospectiveStudentId_fkey"
            columns: ["prospectiveStudentId"]
            isOneToOne: false
            referencedRelation: "ProspectiveStudent"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "AdmissionProcess_studentId_fkey"
            columns: ["studentId"]
            isOneToOne: true
            referencedRelation: "Student"
            referencedColumns: ["id"]
          },
        ]
      }
      anonymoususer: {
        Row: {
          created_at: string | null
          id: string
          last_active: string | null
          mobile_number: string | null
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_active?: string | null
          mobile_number?: string | null
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          last_active?: string | null
          mobile_number?: string | null
          name?: string
        }
        Relationships: []
      }
      anonymoususerprogress: {
        Row: {
          assignment_id: number
          completed: boolean | null
          completed_at: string | null
          id: string
          responses: Json | null
          score: number | null
          started_at: string | null
          user_id: string
        }
        Insert: {
          assignment_id: number
          completed?: boolean | null
          completed_at?: string | null
          id?: string
          responses?: Json | null
          score?: number | null
          started_at?: string | null
          user_id: string
        }
        Update: {
          assignment_id?: number
          completed?: boolean | null
          completed_at?: string | null
          id?: string
          responses?: Json | null
          score?: number | null
          started_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "anonymoususerprogress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "anonymoususer"
            referencedColumns: ["id"]
          },
        ]
      }
      Attendance: {
        Row: {
          classId: string | null
          createdAt: string | null
          createdBy: string | null
          date: string | null
          description: string | null
          id: string
          lastModifiedBy: string | null
          status: Database["school"]["Enums"]["AttendanceStatus"] | null
          studentId: string | null
          updatedAt: string | null
        }
        Insert: {
          classId?: string | null
          createdAt?: string | null
          createdBy?: string | null
          date?: string | null
          description?: string | null
          id: string
          lastModifiedBy?: string | null
          status?: Database["school"]["Enums"]["AttendanceStatus"] | null
          studentId?: string | null
          updatedAt?: string | null
        }
        Update: {
          classId?: string | null
          createdAt?: string | null
          createdBy?: string | null
          date?: string | null
          description?: string | null
          id?: string
          lastModifiedBy?: string | null
          status?: Database["school"]["Enums"]["AttendanceStatus"] | null
          studentId?: string | null
          updatedAt?: string | null
        }
        Relationships: []
      }
      Attendance_Backup: {
        Row: {
          classId: string | null
          createdAt: string | null
          createdBy: string | null
          date: string | null
          description: string | null
          id: string | null
          lastModifiedBy: string | null
          status: Database["school"]["Enums"]["AttendanceStatus"] | null
          studentId: string | null
          updatedAt: string | null
        }
        Insert: {
          classId?: string | null
          createdAt?: string | null
          createdBy?: string | null
          date?: string | null
          description?: string | null
          id?: string | null
          lastModifiedBy?: string | null
          status?: Database["school"]["Enums"]["AttendanceStatus"] | null
          studentId?: string | null
          updatedAt?: string | null
        }
        Update: {
          classId?: string | null
          createdAt?: string | null
          createdBy?: string | null
          date?: string | null
          description?: string | null
          id?: string | null
          lastModifiedBy?: string | null
          status?: Database["school"]["Enums"]["AttendanceStatus"] | null
          studentId?: string | null
          updatedAt?: string | null
        }
        Relationships: []
      }
      birthday_messages: {
        Row: {
          created_at: string | null
          id: string
          message_content: string
          phone_number: string | null
          sent_at: string | null
          sent_to: string
          student_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message_content: string
          phone_number?: string | null
          sent_at?: string | null
          sent_to: string
          student_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message_content?: string
          phone_number?: string | null
          sent_at?: string | null
          sent_to?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "birthday_messages_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "idcard"
            referencedColumns: ["id"]
          },
        ]
      }
      Class: {
        Row: {
          capacity: number
          createdAt: string
          id: string
          name: string
          roomNumber: string | null
          schoolId: string
          section: string
          updatedAt: string
        }
        Insert: {
          capacity: number
          createdAt: string
          id: string
          name: string
          roomNumber?: string | null
          schoolId: string
          section: string
          updatedAt: string
        }
        Update: {
          capacity?: number
          createdAt?: string
          id?: string
          name?: string
          roomNumber?: string | null
          schoolId?: string
          section?: string
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "Class_schoolId_fkey"
            columns: ["schoolId"]
            isOneToOne: false
            referencedRelation: "School"
            referencedColumns: ["id"]
          },
        ]
      }
      ClassTransition: {
        Row: {
          academic_year_id: string
          created_at: string | null
          id: string
          next_class_id: string
          previous_class_id: string
          remarks: string | null
          student_id: string
          transition_date: string | null
          transition_status: string | null
          updated_at: string | null
        }
        Insert: {
          academic_year_id: string
          created_at?: string | null
          id?: string
          next_class_id: string
          previous_class_id: string
          remarks?: string | null
          student_id: string
          transition_date?: string | null
          transition_status?: string | null
          updated_at?: string | null
        }
        Update: {
          academic_year_id?: string
          created_at?: string | null
          id?: string
          next_class_id?: string
          previous_class_id?: string
          remarks?: string | null
          student_id?: string
          transition_date?: string | null
          transition_status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ClassTransition_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "AcademicYear"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ClassTransition_next_class_id_fkey"
            columns: ["next_class_id"]
            isOneToOne: false
            referencedRelation: "Class"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ClassTransition_previous_class_id_fkey"
            columns: ["previous_class_id"]
            isOneToOne: false
            referencedRelation: "Class"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ClassTransition_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "Student"
            referencedColumns: ["id"]
          },
        ]
      }
      Classwork: {
        Row: {
          classId: string
          createdAt: string
          date: string
          description: string
          id: string
          title: string
          updatedAt: string
        }
        Insert: {
          classId: string
          createdAt: string
          date: string
          description: string
          id: string
          title: string
          updatedAt: string
        }
        Update: {
          classId?: string
          createdAt?: string
          date?: string
          description?: string
          id?: string
          title?: string
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "Classwork_classId_fkey"
            columns: ["classId"]
            isOneToOne: false
            referencedRelation: "Class"
            referencedColumns: ["id"]
          },
        ]
      }
      CompletionMilestone: {
        Row: {
          assignment_id: number
          id: number
          milestone_date: string | null
          milestone_description: string | null
        }
        Insert: {
          assignment_id: number
          id?: never
          milestone_date?: string | null
          milestone_description?: string | null
        }
        Update: {
          assignment_id?: number
          id?: never
          milestone_date?: string | null
          milestone_description?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "CompletionMilestone_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "InteractiveAssignment"
            referencedColumns: ["id"]
          },
        ]
      }
      Fee: {
        Row: {
          amount: number
          createdAt: string
          dueDate: string
          feeType: Database["school"]["Enums"]["FeeType"]
          id: string
          paymentDate: string | null
          paymentMethod: string | null
          receiptNumber: string | null
          status: Database["school"]["Enums"]["FeeStatus"]
          studentId: string
          updatedAt: string
        }
        Insert: {
          amount: number
          createdAt: string
          dueDate: string
          feeType: Database["school"]["Enums"]["FeeType"]
          id: string
          paymentDate?: string | null
          paymentMethod?: string | null
          receiptNumber?: string | null
          status: Database["school"]["Enums"]["FeeStatus"]
          studentId: string
          updatedAt: string
        }
        Update: {
          amount?: number
          createdAt?: string
          dueDate?: string
          feeType?: Database["school"]["Enums"]["FeeType"]
          id?: string
          paymentDate?: string | null
          paymentMethod?: string | null
          receiptNumber?: string | null
          status?: Database["school"]["Enums"]["FeeStatus"]
          studentId?: string
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "Fee_studentId_fkey"
            columns: ["studentId"]
            isOneToOne: false
            referencedRelation: "Student"
            referencedColumns: ["id"]
          },
        ]
      }
      fee_history_update: {
        Row: {
          created_at: string | null
          fee_payment_id: string
          field_name: string
          id: string
          new_value: string | null
          old_value: string | null
          update_reason: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          fee_payment_id: string
          field_name: string
          id?: string
          new_value?: string | null
          old_value?: string | null
          update_reason?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          fee_payment_id?: string
          field_name?: string
          id?: string
          new_value?: string | null
          old_value?: string | null
          update_reason?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fee_history_update_fee_payment_id_fkey"
            columns: ["fee_payment_id"]
            isOneToOne: false
            referencedRelation: "fee_payments"
            referencedColumns: ["id"]
          },
        ]
      }
      fee_payments: {
        Row: {
          amount_received: number
          balance_remaining: number
          created_at: string | null
          fee_month: number | null
          fee_year: number | null
          has_updates: boolean | null
          id: string
          notes: string | null
          payment_date: string
          payment_method: string
          payment_status: string
          receipt_url: string
          student_id: string
          updated_at: string | null
        }
        Insert: {
          amount_received: number
          balance_remaining?: number
          created_at?: string | null
          fee_month?: number | null
          fee_year?: number | null
          has_updates?: boolean | null
          id?: string
          notes?: string | null
          payment_date: string
          payment_method: string
          payment_status: string
          receipt_url: string
          student_id: string
          updated_at?: string | null
        }
        Update: {
          amount_received?: number
          balance_remaining?: number
          created_at?: string | null
          fee_month?: number | null
          fee_year?: number | null
          has_updates?: boolean | null
          id?: string
          notes?: string | null
          payment_date?: string
          payment_method?: string
          payment_status?: string
          receipt_url?: string
          student_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fee_payments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "IDCard"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback: {
        Row: {
          created_at: string | null
          description: string
          id: number
          note: string | null
          status: string
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: number
          note?: string | null
          status?: string
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: number
          note?: string | null
          status?: string
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      feedback_replies: {
        Row: {
          created_at: string | null
          feedback_id: number
          id: number
          reply: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          feedback_id: number
          id?: number
          reply: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          feedback_id?: number
          id?: number
          reply?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedback_replies_feedback_id_fkey"
            columns: ["feedback_id"]
            isOneToOne: false
            referencedRelation: "feedback"
            referencedColumns: ["id"]
          },
        ]
      }
      FeedbackCertificate: {
        Row: {
          certificate_url: string | null
          created_at: string | null
          download_count: number | null
          feedback_id: string
          id: string
          updated_at: string | null
        }
        Insert: {
          certificate_url?: string | null
          created_at?: string | null
          download_count?: number | null
          feedback_id: string
          id?: string
          updated_at?: string | null
        }
        Update: {
          certificate_url?: string | null
          created_at?: string | null
          download_count?: number | null
          feedback_id?: string
          id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "FeedbackCertificate_feedback_id_fkey"
            columns: ["feedback_id"]
            isOneToOne: false
            referencedRelation: "ParentFeedback"
            referencedColumns: ["id"]
          },
        ]
      }
      FeedbackTemplate: {
        Row: {
          assignment_type: string | null
          created_at: string | null
          id: string
          performance_level: string | null
          teacher_id: string
          template_name: string
          template_text: string
        }
        Insert: {
          assignment_type?: string | null
          created_at?: string | null
          id?: string
          performance_level?: string | null
          teacher_id: string
          template_name: string
          template_text: string
        }
        Update: {
          assignment_type?: string | null
          created_at?: string | null
          id?: string
          performance_level?: string | null
          teacher_id?: string
          template_name?: string
          template_text?: string
        }
        Relationships: []
      }
      File: {
        Row: {
          classworkId: string | null
          feeId: string | null
          fileName: string
          filePath: string
          fileType: string
          grievanceId: string | null
          homeworkId: string | null
          homeworkSubmissionId: string | null
          id: string
          interactiveAssignmentId: number | null
          schoolId: string | null
          uploadedAt: string
          uploadedBy: string
        }
        Insert: {
          classworkId?: string | null
          feeId?: string | null
          fileName: string
          filePath: string
          fileType: string
          grievanceId?: string | null
          homeworkId?: string | null
          homeworkSubmissionId?: string | null
          id: string
          interactiveAssignmentId?: number | null
          schoolId?: string | null
          uploadedAt: string
          uploadedBy: string
        }
        Update: {
          classworkId?: string | null
          feeId?: string | null
          fileName?: string
          filePath?: string
          fileType?: string
          grievanceId?: string | null
          homeworkId?: string | null
          homeworkSubmissionId?: string | null
          id?: string
          interactiveAssignmentId?: number | null
          schoolId?: string | null
          uploadedAt?: string
          uploadedBy?: string
        }
        Relationships: [
          {
            foreignKeyName: "File_classworkId_fkey"
            columns: ["classworkId"]
            isOneToOne: false
            referencedRelation: "Classwork"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "File_feeId_fkey"
            columns: ["feeId"]
            isOneToOne: false
            referencedRelation: "Fee"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "File_grievanceId_fkey"
            columns: ["grievanceId"]
            isOneToOne: false
            referencedRelation: "Grievance"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "File_homeworkId_fkey"
            columns: ["homeworkId"]
            isOneToOne: false
            referencedRelation: "Homework"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "File_homeworkSubmissionId_fkey"
            columns: ["homeworkSubmissionId"]
            isOneToOne: false
            referencedRelation: "HomeworkSubmission"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "File_interactiveAssignmentId_fkey"
            columns: ["interactiveAssignmentId"]
            isOneToOne: false
            referencedRelation: "InteractiveAssignment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "File_schoolId_fkey"
            columns: ["schoolId"]
            isOneToOne: true
            referencedRelation: "School"
            referencedColumns: ["id"]
          },
        ]
      }
      Grievance: {
        Row: {
          createdAt: string
          description: string
          id: string
          resolution: string | null
          status: Database["school"]["Enums"]["GrievanceStatus"]
          studentId: string
          title: string
          updatedAt: string
        }
        Insert: {
          createdAt: string
          description: string
          id: string
          resolution?: string | null
          status: Database["school"]["Enums"]["GrievanceStatus"]
          studentId: string
          title: string
          updatedAt: string
        }
        Update: {
          createdAt?: string
          description?: string
          id?: string
          resolution?: string | null
          status?: Database["school"]["Enums"]["GrievanceStatus"]
          studentId?: string
          title?: string
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "Grievance_studentId_fkey"
            columns: ["studentId"]
            isOneToOne: false
            referencedRelation: "Student"
            referencedColumns: ["id"]
          },
        ]
      }
      Homework: {
        Row: {
          classId: string | null
          createdAt: string
          description: string
          dueDate: string
          id: string
          status: Database["school"]["Enums"]["HomeworkStatus"]
          subjectId: string
          title: string
          updatedAt: string
        }
        Insert: {
          classId?: string | null
          createdAt: string
          description: string
          dueDate: string
          id: string
          status: Database["school"]["Enums"]["HomeworkStatus"]
          subjectId: string
          title: string
          updatedAt: string
        }
        Update: {
          classId?: string | null
          createdAt?: string
          description?: string
          dueDate?: string
          id?: string
          status?: Database["school"]["Enums"]["HomeworkStatus"]
          subjectId?: string
          title?: string
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "Homework_classId_fkey"
            columns: ["classId"]
            isOneToOne: false
            referencedRelation: "Class"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Homework_subjectId_fkey"
            columns: ["subjectId"]
            isOneToOne: false
            referencedRelation: "Subject"
            referencedColumns: ["id"]
          },
        ]
      }
      HomeworkSubmission: {
        Row: {
          homeworkId: string
          id: string
          status: Database["school"]["Enums"]["HomeworkStatus"]
          studentId: string
          submittedAt: string
        }
        Insert: {
          homeworkId: string
          id: string
          status: Database["school"]["Enums"]["HomeworkStatus"]
          studentId: string
          submittedAt: string
        }
        Update: {
          homeworkId?: string
          id?: string
          status?: Database["school"]["Enums"]["HomeworkStatus"]
          studentId?: string
          submittedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "HomeworkSubmission_homeworkId_fkey"
            columns: ["homeworkId"]
            isOneToOne: false
            referencedRelation: "Homework"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "HomeworkSubmission_studentId_fkey"
            columns: ["studentId"]
            isOneToOne: false
            referencedRelation: "Student"
            referencedColumns: ["id"]
          },
        ]
      }
      idcard: {
        Row: {
          address: string | null
          class_id: string | null
          created_at: string | null
          date_of_birth: string | null
          download_count: number | null
          father_mobile: string | null
          father_name: string
          father_photo_url: string | null
          id: string
          mother_mobile: string | null
          mother_name: string
          mother_photo_url: string | null
          student_name: string
          student_photo_url: string | null
        }
        Insert: {
          address?: string | null
          class_id?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          download_count?: number | null
          father_mobile?: string | null
          father_name: string
          father_photo_url?: string | null
          id: string
          mother_mobile?: string | null
          mother_name: string
          mother_photo_url?: string | null
          student_name: string
          student_photo_url?: string | null
        }
        Update: {
          address?: string | null
          class_id?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          download_count?: number | null
          father_mobile?: string | null
          father_name?: string
          father_photo_url?: string | null
          id?: string
          mother_mobile?: string | null
          mother_name?: string
          mother_photo_url?: string | null
          student_name?: string
          student_photo_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "idcard_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "Class"
            referencedColumns: ["id"]
          },
        ]
      }
      IDCard: {
        Row: {
          address: string | null
          class_id: string | null
          created_at: string | null
          date_of_birth: string | null
          download_count: number | null
          father_mobile: string | null
          father_name: string
          father_photo_url: string | null
          id: string
          mother_mobile: string | null
          mother_name: string
          mother_photo_url: string | null
          student_name: string
          student_photo_url: string | null
        }
        Insert: {
          address?: string | null
          class_id?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          download_count?: number | null
          father_mobile?: string | null
          father_name: string
          father_photo_url?: string | null
          id: string
          mother_mobile?: string | null
          mother_name: string
          mother_photo_url?: string | null
          student_name: string
          student_photo_url?: string | null
        }
        Update: {
          address?: string | null
          class_id?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          download_count?: number | null
          father_mobile?: string | null
          father_name?: string
          father_photo_url?: string | null
          id?: string
          mother_mobile?: string | null
          mother_name?: string
          mother_photo_url?: string | null
          student_name?: string
          student_photo_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "IDCard_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "Class"
            referencedColumns: ["id"]
          },
        ]
      }
      InteractiveAssignment: {
        Row: {
          ageGroup: string | null
          assignmentId: number | null
          audioInstructions: string | null
          classId: string | null
          createdAt: string | null
          createdBy: string | null
          description: string | null
          difficulty_level: string | null
          difficultyLevel: string | null
          due_date: string | null
          dueDate: string | null
          estimated_time_minutes: number | null
          estimatedTimeMinutes: number | null
          has_audio_feedback: boolean | null
          has_celebration: boolean | null
          hasAudioFeedback: boolean | null
          hasCelebration: boolean | null
          id: number
          requires_parent_help: boolean | null
          requiresParentHelp: boolean | null
          shareable_link: string | null
          shareable_link_expires_at: string | null
          shareableLink: string | null
          shareableLinkExpiresAt: string | null
          status: string | null
          subjectId: string | null
          title: string
          type: string | null
          updatedAt: string | null
        }
        Insert: {
          ageGroup?: string | null
          assignmentId?: number | null
          audioInstructions?: string | null
          classId?: string | null
          createdAt?: string | null
          createdBy?: string | null
          description?: string | null
          difficulty_level?: string | null
          difficultyLevel?: string | null
          due_date?: string | null
          dueDate?: string | null
          estimated_time_minutes?: number | null
          estimatedTimeMinutes?: number | null
          has_audio_feedback?: boolean | null
          has_celebration?: boolean | null
          hasAudioFeedback?: boolean | null
          hasCelebration?: boolean | null
          id?: number
          requires_parent_help?: boolean | null
          requiresParentHelp?: boolean | null
          shareable_link?: string | null
          shareable_link_expires_at?: string | null
          shareableLink?: string | null
          shareableLinkExpiresAt?: string | null
          status?: string | null
          subjectId?: string | null
          title: string
          type?: string | null
          updatedAt?: string | null
        }
        Update: {
          ageGroup?: string | null
          assignmentId?: number | null
          audioInstructions?: string | null
          classId?: string | null
          createdAt?: string | null
          createdBy?: string | null
          description?: string | null
          difficulty_level?: string | null
          difficultyLevel?: string | null
          due_date?: string | null
          dueDate?: string | null
          estimated_time_minutes?: number | null
          estimatedTimeMinutes?: number | null
          has_audio_feedback?: boolean | null
          has_celebration?: boolean | null
          hasAudioFeedback?: boolean | null
          hasCelebration?: boolean | null
          id?: number
          requires_parent_help?: boolean | null
          requiresParentHelp?: boolean | null
          shareable_link?: string | null
          shareable_link_expires_at?: string | null
          shareableLink?: string | null
          shareableLinkExpiresAt?: string | null
          status?: string | null
          subjectId?: string | null
          title?: string
          type?: string | null
          updatedAt?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "InteractiveAssignment_classId_fkey"
            columns: ["classId"]
            isOneToOne: false
            referencedRelation: "Class"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "InteractiveAssignment_subjectId_fkey"
            columns: ["subjectId"]
            isOneToOne: false
            referencedRelation: "Subject"
            referencedColumns: ["id"]
          },
        ]
      }
      InteractiveQuestion: {
        Row: {
          assignment_id: string | null
          assignmentId: number
          audio_instructions: string | null
          audioInstructions: string | null
          feedback_correct: string | null
          feedback_incorrect: string | null
          feedbackCorrect: string | null
          feedbackIncorrect: string | null
          hint_image_url: string | null
          hint_text: string | null
          hintImageUrl: string | null
          hintText: string | null
          id: string
          order: string | null
          question_data: Json | null
          question_order: number
          question_text: string
          question_type: string
          questionData: Json | null
          questionOrder: number | null
          questionText: string | null
          questionType: string | null
        }
        Insert: {
          assignment_id?: string | null
          assignmentId: number
          audio_instructions?: string | null
          audioInstructions?: string | null
          feedback_correct?: string | null
          feedback_incorrect?: string | null
          feedbackCorrect?: string | null
          feedbackIncorrect?: string | null
          hint_image_url?: string | null
          hint_text?: string | null
          hintImageUrl?: string | null
          hintText?: string | null
          id?: string
          order?: string | null
          question_data?: Json | null
          question_order: number
          question_text: string
          question_type: string
          questionData?: Json | null
          questionOrder?: number | null
          questionText?: string | null
          questionType?: string | null
        }
        Update: {
          assignment_id?: string | null
          assignmentId?: number
          audio_instructions?: string | null
          audioInstructions?: string | null
          feedback_correct?: string | null
          feedback_incorrect?: string | null
          feedbackCorrect?: string | null
          feedbackIncorrect?: string | null
          hint_image_url?: string | null
          hint_text?: string | null
          hintImageUrl?: string | null
          hintText?: string | null
          id?: string
          order?: string | null
          question_data?: Json | null
          question_order?: number
          question_text?: string
          question_type?: string
          questionData?: Json | null
          questionOrder?: number | null
          questionText?: string | null
          questionType?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "InteractiveQuestion_assignmentId_fkey"
            columns: ["assignmentId"]
            isOneToOne: false
            referencedRelation: "InteractiveAssignment"
            referencedColumns: ["id"]
          },
        ]
      }
      InteractiveResponse: {
        Row: {
          id: string
          is_correct: boolean | null
          question_id: string
          response_data: Json | null
          submission_id: string
        }
        Insert: {
          id?: string
          is_correct?: boolean | null
          question_id: string
          response_data?: Json | null
          submission_id: string
        }
        Update: {
          id?: string
          is_correct?: boolean | null
          question_id?: string
          response_data?: Json | null
          submission_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "InteractiveResponse_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "InteractiveQuestion"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "InteractiveResponse_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "InteractiveSubmission"
            referencedColumns: ["id"]
          },
        ]
      }
      InteractiveSubmission: {
        Row: {
          assignment_id: number
          feedback: string | null
          id: string
          score: number | null
          started_at: string | null
          status: string | null
          student_id: string
          submitted_at: string | null
        }
        Insert: {
          assignment_id: number
          feedback?: string | null
          id?: string
          score?: number | null
          started_at?: string | null
          status?: string | null
          student_id: string
          submitted_at?: string | null
        }
        Update: {
          assignment_id?: number
          feedback?: string | null
          id?: string
          score?: number | null
          started_at?: string | null
          status?: string | null
          student_id?: string
          submitted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "InteractiveSubmission_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "InteractiveAssignment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "InteractiveSubmission_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "Student"
            referencedColumns: ["id"]
          },
        ]
      }
      Notification: {
        Row: {
          classId: string | null
          createdAt: string | null
          id: string
          isRead: boolean
          message: string
          studentId: string | null
          title: string
          type: Database["school"]["Enums"]["NotificationType"]
          updatedAt: string | null
        }
        Insert: {
          classId?: string | null
          createdAt?: string | null
          id?: string
          isRead?: boolean
          message: string
          studentId?: string | null
          title: string
          type: Database["school"]["Enums"]["NotificationType"]
          updatedAt?: string | null
        }
        Update: {
          classId?: string | null
          createdAt?: string | null
          id?: string
          isRead?: boolean
          message?: string
          studentId?: string | null
          title?: string
          type?: Database["school"]["Enums"]["NotificationType"]
          updatedAt?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Notification_classId_fkey"
            columns: ["classId"]
            isOneToOne: false
            referencedRelation: "Class"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Notification_studentId_fkey"
            columns: ["studentId"]
            isOneToOne: false
            referencedRelation: "Student"
            referencedColumns: ["id"]
          },
        ]
      }
      NotificationStudents: {
        Row: {
          notificationid: string
          studentid: string
        }
        Insert: {
          notificationid: string
          studentid: string
        }
        Update: {
          notificationid?: string
          studentid?: string
        }
        Relationships: [
          {
            foreignKeyName: "NotificationStudents_notificationid_fkey"
            columns: ["notificationid"]
            isOneToOne: false
            referencedRelation: "Notification"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "NotificationStudents_studentid_fkey"
            columns: ["studentid"]
            isOneToOne: false
            referencedRelation: "Student"
            referencedColumns: ["id"]
          },
        ]
      }
      ParentFeedback: {
        Row: {
          attendance_percentage: number | null
          best_can_do: string | null
          class_id: string
          created_at: string | null
          created_by: string | null
          good_things: string | null
          id: string
          month: string
          need_to_improve: string | null
          student_name: string
          student_photo_url: string | null
          updated_at: string | null
        }
        Insert: {
          attendance_percentage?: number | null
          best_can_do?: string | null
          class_id: string
          created_at?: string | null
          created_by?: string | null
          good_things?: string | null
          id?: string
          month: string
          need_to_improve?: string | null
          student_name: string
          student_photo_url?: string | null
          updated_at?: string | null
        }
        Update: {
          attendance_percentage?: number | null
          best_can_do?: string | null
          class_id?: string
          created_at?: string | null
          created_by?: string | null
          good_things?: string | null
          id?: string
          month?: string
          need_to_improve?: string | null
          student_name?: string
          student_photo_url?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ParentFeedback_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "Class"
            referencedColumns: ["id"]
          },
        ]
      }
      ParentSubmittedFeedback: {
        Row: {
          class_id: string
          created_at: string | null
          feedback: string
          home_activities: string | null
          id: string
          improvement_areas: string | null
          month: string
          parent_email: string | null
          parent_name: string
          parent_phone: string | null
          parent_relation: string
          progress_feedback: string
          questions_concerns: string | null
          status: string | null
          student_name: string
          updated_at: string | null
        }
        Insert: {
          class_id: string
          created_at?: string | null
          feedback?: string
          home_activities?: string | null
          id?: string
          improvement_areas?: string | null
          month: string
          parent_email?: string | null
          parent_name: string
          parent_phone?: string | null
          parent_relation: string
          progress_feedback: string
          questions_concerns?: string | null
          status?: string | null
          student_name: string
          updated_at?: string | null
        }
        Update: {
          class_id?: string
          created_at?: string | null
          feedback?: string
          home_activities?: string | null
          id?: string
          improvement_areas?: string | null
          month?: string
          parent_email?: string | null
          parent_name?: string
          parent_phone?: string | null
          parent_relation?: string
          progress_feedback?: string
          questions_concerns?: string | null
          status?: string | null
          student_name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ParentSubmittedFeedback_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "Class"
            referencedColumns: ["id"]
          },
        ]
      }
      Profile: {
        Row: {
          avatar_url: string | null
          full_name: string | null
          id: string
          role: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          full_name?: string | null
          id: string
          role: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          full_name?: string | null
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      prospectivestudent: {
        Row: {
          address: string | null
          applieddate: string
          contactnumber: string
          created_at: string
          dateofbirth: string | null
          email: string
          gender: string
          gradeapplying: string
          id: string
          lastupdatedate: string
          parentname: string
          status: string
          studentname: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          applieddate?: string
          contactnumber: string
          created_at?: string
          dateofbirth?: string | null
          email: string
          gender: string
          gradeapplying: string
          id: string
          lastupdatedate?: string
          parentname: string
          status?: string
          studentname: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          applieddate?: string
          contactnumber?: string
          created_at?: string
          dateofbirth?: string | null
          email?: string
          gender?: string
          gradeapplying?: string
          id?: string
          lastupdatedate?: string
          parentname?: string
          status?: string
          studentname?: string
          updated_at?: string
        }
        Relationships: []
      }
      ProspectiveStudent: {
        Row: {
          address: string
          appliedDate: string | null
          assignedTo: string | null
          bloodGroup: string | null
          contactNumber: string
          createdAt: string
          currentSchool: string | null
          dateOfBirth: string
          email: string
          gender: string
          gradeApplying: string
          id: string
          lastUpdateDate: string | null
          parentName: string
          schoolId: string
          status: Database["school"]["Enums"]["EnquiryStatus"]
          studentName: string
          updatedAt: string
        }
        Insert: {
          address: string
          appliedDate?: string | null
          assignedTo?: string | null
          bloodGroup?: string | null
          contactNumber: string
          createdAt?: string
          currentSchool?: string | null
          dateOfBirth: string
          email: string
          gender: string
          gradeApplying: string
          id: string
          lastUpdateDate?: string | null
          parentName: string
          schoolId: string
          status?: Database["school"]["Enums"]["EnquiryStatus"]
          studentName: string
          updatedAt?: string
        }
        Update: {
          address?: string
          appliedDate?: string | null
          assignedTo?: string | null
          bloodGroup?: string | null
          contactNumber?: string
          createdAt?: string
          currentSchool?: string | null
          dateOfBirth?: string
          email?: string
          gender?: string
          gradeApplying?: string
          id?: string
          lastUpdateDate?: string | null
          parentName?: string
          schoolId?: string
          status?: Database["school"]["Enums"]["EnquiryStatus"]
          studentName?: string
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "ProspectiveStudent_assignedTo_fkey"
            columns: ["assignedTo"]
            isOneToOne: false
            referencedRelation: "Staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ProspectiveStudent_schoolId_fkey"
            columns: ["schoolId"]
            isOneToOne: false
            referencedRelation: "School"
            referencedColumns: ["id"]
          },
        ]
      }
      School: {
        Row: {
          id: string
          schoolAddress: string
          schoolName: string
        }
        Insert: {
          id: string
          schoolAddress: string
          schoolName: string
        }
        Update: {
          id?: string
          schoolAddress?: string
          schoolName?: string
        }
        Relationships: []
      }
      Settings: {
        Row: {
          address: string | null
          created_at: string | null
          description: string | null
          email: string | null
          id: number
          logo_url: string | null
          phone: string | null
          school_name: string
          updated_at: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          id?: number
          logo_url?: string | null
          phone?: string | null
          school_name: string
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          id?: number
          logo_url?: string | null
          phone?: string | null
          school_name?: string
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      Staff: {
        Row: {
          address: string
          contactNumber: string
          createdAt: string
          email: string
          employeeId: string
          experience: number
          id: string
          joiningDate: string
          name: string
          qualification: string
          role: Database["school"]["Enums"]["StaffRole"]
          schoolId: string
          updatedAt: string
          user_id: string | null
        }
        Insert: {
          address: string
          contactNumber: string
          createdAt: string
          email: string
          employeeId: string
          experience: number
          id: string
          joiningDate: string
          name: string
          qualification: string
          role: Database["school"]["Enums"]["StaffRole"]
          schoolId: string
          updatedAt: string
          user_id?: string | null
        }
        Update: {
          address?: string
          contactNumber?: string
          createdAt?: string
          email?: string
          employeeId?: string
          experience?: number
          id?: string
          joiningDate?: string
          name?: string
          qualification?: string
          role?: Database["school"]["Enums"]["StaffRole"]
          schoolId?: string
          updatedAt?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Staff_schoolId_fkey"
            columns: ["schoolId"]
            isOneToOne: false
            referencedRelation: "School"
            referencedColumns: ["id"]
          },
        ]
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
          user_id: string | null
        }
        Insert: {
          address: string
          admissionNumber: string
          bloodGroup?: string | null
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
          user_id?: string | null
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
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Student_classId_fkey"
            columns: ["classId"]
            isOneToOne: false
            referencedRelation: "Class"
            referencedColumns: ["id"]
          },
        ]
      }
      Student_Backup: {
        Row: {
          address: string | null
          admissionNumber: string | null
          bloodGroup: string | null
          classId: string | null
          contactNumber: string | null
          createdAt: string | null
          dateOfBirth: string | null
          gender: string | null
          id: string | null
          name: string | null
          parentContact: string | null
          parentEmail: string | null
          parentName: string | null
          updatedAt: string | null
          user_id: string | null
        }
        Insert: {
          address?: string | null
          admissionNumber?: string | null
          bloodGroup?: string | null
          classId?: string | null
          contactNumber?: string | null
          createdAt?: string | null
          dateOfBirth?: string | null
          gender?: string | null
          id?: string | null
          name?: string | null
          parentContact?: string | null
          parentEmail?: string | null
          parentName?: string | null
          updatedAt?: string | null
          user_id?: string | null
        }
        Update: {
          address?: string | null
          admissionNumber?: string | null
          bloodGroup?: string | null
          classId?: string | null
          contactNumber?: string | null
          createdAt?: string | null
          dateOfBirth?: string | null
          gender?: string | null
          id?: string | null
          name?: string | null
          parentContact?: string | null
          parentEmail?: string | null
          parentName?: string | null
          updatedAt?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      StudentProgressAnalytics: {
        Row: {
          areas_for_improvement: string[] | null
          assignment_type: string
          assignments_completed: number | null
          average_score: number | null
          average_time_spent: number | null
          id: string
          last_updated: string | null
          strengths: string[] | null
          student_id: string
        }
        Insert: {
          areas_for_improvement?: string[] | null
          assignment_type: string
          assignments_completed?: number | null
          average_score?: number | null
          average_time_spent?: number | null
          id?: string
          last_updated?: string | null
          strengths?: string[] | null
          student_id: string
        }
        Update: {
          areas_for_improvement?: string[] | null
          assignment_type?: string
          assignments_completed?: number | null
          average_score?: number | null
          average_time_spent?: number | null
          id?: string
          last_updated?: string | null
          strengths?: string[] | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "StudentProgressAnalytics_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "Student"
            referencedColumns: ["id"]
          },
        ]
      }
      Subject: {
        Row: {
          classId: string
          code: string
          createdAt: string
          id: string
          name: string
          teacherId: string
          updatedAt: string
        }
        Insert: {
          classId: string
          code: string
          createdAt: string
          id: string
          name: string
          teacherId: string
          updatedAt: string
        }
        Update: {
          classId?: string
          code?: string
          createdAt?: string
          id?: string
          name?: string
          teacherId?: string
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "Subject_classId_fkey"
            columns: ["classId"]
            isOneToOne: false
            referencedRelation: "Class"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Subject_teacherId_fkey"
            columns: ["teacherId"]
            isOneToOne: false
            referencedRelation: "Staff"
            referencedColumns: ["id"]
          },
        ]
      }
      TimeTable: {
        Row: {
          classId: string
          createdAt: string
          day: number
          endTime: string
          id: string
          startTime: string
          subjectId: string
          updatedAt: string
        }
        Insert: {
          classId: string
          createdAt: string
          day: number
          endTime: string
          id: string
          startTime: string
          subjectId: string
          updatedAt: string
        }
        Update: {
          classId?: string
          createdAt?: string
          day?: number
          endTime?: string
          id?: string
          startTime?: string
          subjectId?: string
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "TimeTable_classId_fkey"
            columns: ["classId"]
            isOneToOne: false
            referencedRelation: "Class"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "TimeTable_subjectId_fkey"
            columns: ["subjectId"]
            isOneToOne: false
            referencedRelation: "Subject"
            referencedColumns: ["id"]
          },
        ]
      }
      UserSettings: {
        Row: {
          created_at: string | null
          email_notifications: boolean | null
          id: number
          notifications: Json
          notifications_enabled: boolean | null
          security: Json
          theme: Json
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email_notifications?: boolean | null
          id?: number
          notifications: Json
          notifications_enabled?: boolean | null
          security: Json
          theme: Json
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email_notifications?: boolean | null
          id?: number
          notifications?: Json
          notifications_enabled?: boolean | null
          security?: Json
          theme?: Json
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      YearEndFeedback: {
        Row: {
          academic_performance: string | null
          academic_year_id: string
          achievements: string | null
          address: string | null
          areas_of_improvement: string | null
          attendance_record: Json | null
          behavioral_assessment: string | null
          created_at: string | null
          emergency_contact: string | null
          extracurricular_activities: string | null
          father_contact: string | null
          father_email: string | null
          father_name: string | null
          father_occupation: string | null
          father_photo_url: string | null
          feedback_status: string | null
          id: string
          medical_conditions: string | null
          mother_contact: string | null
          mother_email: string | null
          mother_name: string | null
          mother_occupation: string | null
          mother_photo_url: string | null
          next_class_recommendation: string
          parent_feedback: string | null
          strengths: string | null
          student_feedback: string | null
          student_id: string
          student_photo_url: string | null
          submitted_at: string | null
          teacher_feedback: string | null
          updated_at: string | null
        }
        Insert: {
          academic_performance?: string | null
          academic_year_id: string
          achievements?: string | null
          address?: string | null
          areas_of_improvement?: string | null
          attendance_record?: Json | null
          behavioral_assessment?: string | null
          created_at?: string | null
          emergency_contact?: string | null
          extracurricular_activities?: string | null
          father_contact?: string | null
          father_email?: string | null
          father_name?: string | null
          father_occupation?: string | null
          father_photo_url?: string | null
          feedback_status?: string | null
          id?: string
          medical_conditions?: string | null
          mother_contact?: string | null
          mother_email?: string | null
          mother_name?: string | null
          mother_occupation?: string | null
          mother_photo_url?: string | null
          next_class_recommendation: string
          parent_feedback?: string | null
          strengths?: string | null
          student_feedback?: string | null
          student_id: string
          student_photo_url?: string | null
          submitted_at?: string | null
          teacher_feedback?: string | null
          updated_at?: string | null
        }
        Update: {
          academic_performance?: string | null
          academic_year_id?: string
          achievements?: string | null
          address?: string | null
          areas_of_improvement?: string | null
          attendance_record?: Json | null
          behavioral_assessment?: string | null
          created_at?: string | null
          emergency_contact?: string | null
          extracurricular_activities?: string | null
          father_contact?: string | null
          father_email?: string | null
          father_name?: string | null
          father_occupation?: string | null
          father_photo_url?: string | null
          feedback_status?: string | null
          id?: string
          medical_conditions?: string | null
          mother_contact?: string | null
          mother_email?: string | null
          mother_name?: string | null
          mother_occupation?: string | null
          mother_photo_url?: string | null
          next_class_recommendation?: string
          parent_feedback?: string | null
          strengths?: string | null
          student_feedback?: string | null
          student_id?: string
          student_photo_url?: string | null
          submitted_at?: string | null
          teacher_feedback?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "YearEndFeedback_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "AcademicYear"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "YearEndFeedback_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "Student"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_auth_users_for_students: { Args: never; Returns: undefined }
      generate_admission_number: { Args: never; Returns: string }
      get_students_by_class: {
        Args: { p_class_id: string }
        Returns: {
          class_id: string
          id: string
          student_name: string
          student_photo_url: string
        }[]
      }
    }
    Enums: {
      AttendanceStatus: "PRESENT" | "ABSENT" | "LATE" | "HALF_DAY"
      EnquiryStatus:
        | "NEW"
        | "IN_REVIEW"
        | "SCHEDULED_INTERVIEW"
        | "PENDING_DOCUMENTS"
        | "APPROVED"
        | "REJECTED"
        | "ENROLLED"
      FeeStatus: "PENDING" | "PAID" | "OVERDUE" | "PARTIAL"
      FeeType:
        | "TUITION"
        | "EXAMINATION"
        | "TRANSPORT"
        | "LIBRARY"
        | "LABORATORY"
        | "MISCELLANEOUS"
      GrievanceStatus: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED"
      HomeworkStatus: "PENDING" | "COMPLETED" | "OVERDUE" | "SUBMITTED"
      InteractiveAssignmentType:
        | "SORTING"
        | "HANDWRITING"
        | "LETTER_TRACING"
        | "NUMBER_RECOGNITION"
        | "PICTURE_WORD_MATCHING"
        | "PATTERN_COMPLETION"
        | "CATEGORIZATION"
      NotificationType:
        | "HOMEWORK"
        | "ATTENDANCE"
        | "FEE"
        | "GENERAL"
        | "EXAM"
        | "EMERGENCY"
      StaffRole: "TEACHER" | "ADMIN" | "PRINCIPAL" | "ACCOUNTANT"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  school: {
    Enums: {
      AttendanceStatus: ["PRESENT", "ABSENT", "LATE", "HALF_DAY"],
      EnquiryStatus: [
        "NEW",
        "IN_REVIEW",
        "SCHEDULED_INTERVIEW",
        "PENDING_DOCUMENTS",
        "APPROVED",
        "REJECTED",
        "ENROLLED",
      ],
      FeeStatus: ["PENDING", "PAID", "OVERDUE", "PARTIAL"],
      FeeType: [
        "TUITION",
        "EXAMINATION",
        "TRANSPORT",
        "LIBRARY",
        "LABORATORY",
        "MISCELLANEOUS",
      ],
      GrievanceStatus: ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"],
      HomeworkStatus: ["PENDING", "COMPLETED", "OVERDUE", "SUBMITTED"],
      InteractiveAssignmentType: [
        "SORTING",
        "HANDWRITING",
        "LETTER_TRACING",
        "NUMBER_RECOGNITION",
        "PICTURE_WORD_MATCHING",
        "PATTERN_COMPLETION",
        "CATEGORIZATION",
      ],
      NotificationType: [
        "HOMEWORK",
        "ATTENDANCE",
        "FEE",
        "GENERAL",
        "EXAM",
        "EMERGENCY",
      ],
      StaffRole: ["TEACHER", "ADMIN", "PRINCIPAL", "ACCOUNTANT"],
    },
  },
} as const
