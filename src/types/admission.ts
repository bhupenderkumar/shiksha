import { ADMISSION_STATUS, COMMUNICATION_TYPES, REQUIRED_DOCUMENTS } from "@/lib/constants";

export type EnquiryStatus = typeof ADMISSION_STATUS[keyof typeof ADMISSION_STATUS];
export type CommunicationType = typeof COMMUNICATION_TYPES[keyof typeof COMMUNICATION_TYPES];
export type RequiredDocument = typeof REQUIRED_DOCUMENTS[number];
export type Gender = 'Male' | 'Female' | 'Other';

// Database row types (matching actual database column names)
export interface ProspectiveStudentRow {
  id: string;
  studentname: string;
  parentname: string;
  dateofbirth: string | null;
  gender: Gender;
  email: string;
  contactnumber: string;
  gradeapplying: string;
  currentschool?: string;
  address: string;
  bloodgroup?: string;
  status: EnquiryStatus;
  applieddate: string;
  lastupdatedate: string;
  schoolid: string;
  assignedto?: string;
  created_at: string;
  updated_at: string;
}

export interface AdmissionProcessRow {
  id: string;
  prospectivestudentid: string;
  documentsrequired: any;
  interviewdate: string | null;
  assignedclass: string | null;
  created_at: string;
  updated_at: string;
}

export interface Note {
  id: string;
  prospectiveStudentId: string;
  content: string;
  createdBy: string;
  createdAt: Date;
}

export interface ProspectiveStudentData {
  studentName: string;
  parentName: string;
  dateOfBirth: Date;
  gender: Gender;
  email: string;
  contactNumber: string;
  gradeApplying: string;
  currentSchool?: string;
  address: string;
  bloodGroup?: string;
}

export interface ProspectiveStudent extends ProspectiveStudentData {
  id: string;
  status: EnquiryStatus;
  appliedDate: Date;
  lastUpdateDate: Date;
  schoolId: string;
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
  documentsRequired?: DocumentStatus;
}

export interface DocumentSubmission {
  type: string;
  uploadDate: Date;
  status: string;
  fileName: string;
}

export interface DocumentStatus {
  required: RequiredDocument[];
  submitted: DocumentSubmission[];
  verificationStatus: {
    [key in RequiredDocument]?: 'pending' | 'verified' | 'rejected';
  };
  rejectionReason: {
    [key in RequiredDocument]?: string;
  };
}

export interface FeeDetails {
  applicationFee: number;
  termFee: number;
  annualFee: number;
  totalFee: number;
  discounts?: {
    type: string;
    amount: number;
    reason?: string;
  }[];
  paymentSchedule?: {
    dueDate: Date;
    amount: number;
    description: string;
  }[];
}

export interface AdmissionProcess {
  id: string;
  prospectiveStudentId: string;
  assignedClassId?: string;
  admissionNumber?: string;
  documentsRequired?: DocumentStatus;
  documentsSubmitted?: DocumentStatus;
  interviewDate?: Date;
  interviewNotes?: string;
  feeDetails?: FeeDetails;
  approvedBy?: string;
  studentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdmissionCommunication {
  id: string;
  prospectiveStudentId: string;
  communicationType: CommunicationType;
  notes: string;
  staffId: string;
  communicationDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdmissionStats {
  totalApplications: number;
  newApplications: number;
  inReview: number;
  scheduled: number;
  pendingDocuments: number;
  approved: number;
  rejected: number;
  enrolled: number;
}

export interface AdmissionTimelineStep {
  step: number;
  status: EnquiryStatus;
  title: string;
  description: string;
  completed: boolean;
  current: boolean;
  label?: string;
}

export interface AdmissionProgress {
  currentStatus: EnquiryStatus;
  currentStep: number;
  lastSaved: Date;
  completedSteps: string[];
  nextStep: string;
  timeline: AdmissionTimelineStep[];
  documentsStatus: Record<RequiredDocument, DocumentStatus>;
  interviewDate?: Date;
  assignedClass?: string;
}

export interface FilteredEnquiry extends ProspectiveStudent {
  AdmissionProcess: AdmissionProcess | null;
}

export interface SearchParams {
  status?: EnquiryStatus[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  searchTerm?: string;
  gradeApplying?: string;
  page?: number;
  limit?: number;
}

export interface EnquiryUpdateData extends Partial<ProspectiveStudentData> {
  status?: EnquiryStatus;
  interviewDate?: Date;
  documentsStatus?: Partial<Record<RequiredDocument, DocumentStatus>>;
  assignedClass?: string;
  notes?: string;
}
