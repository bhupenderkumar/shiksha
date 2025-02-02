import { supabase } from '@/lib/api-client';
import { v4 as uuidv4 } from 'uuid';
import { fileService } from './fileService';
import { fileTableService } from './fileTableService';
import { ADMISSION_STATUS, COMMUNICATION_TYPES, REQUIRED_DOCUMENTS } from '@/lib/constants';
import { toast } from '@/components/ui/toast';
import type {
  AdmissionCommunication,
  AdmissionProcess,
  AdmissionProcessRow,
  AdmissionProgress,
  AdmissionTimelineStep,
  DocumentStatus,
  DocumentSubmission,
  EnquiryStatus,
  EnquiryUpdateData,
  FeeDetails,
  FilteredEnquiry,
  Gender,
  Note,
  ProspectiveStudent,
  ProspectiveStudentData,
  RequiredDocument,
  SearchParams
} from '@/types/admission';

// Constants
const SCHEMA = 'school';

const TABLES = {
  PROSPECTIVE_STUDENT: 'ProspectiveStudent',
  ADMISSION_PROCESS: 'AdmissionProcess',
  ADMISSION_COMMUNICATION: 'AdmissionCommunication',
  ADMISSION_NOTES: 'AdmissionNotes'
} as const;

const FILE_CONFIG = {
  BUCKET: 'File',
  MAX_SIZE: 5 * 1024 * 1024,
  ALLOWED_TYPES: ['application/pdf', 'image/jpeg', 'image/png']
} as const;

// Database interfaces
type DocumentVerificationStatus = 'pending' | 'verified' | 'rejected';

interface DbProspectiveStudent {
  id: string;
  studentname: string;
  parentname: string;
  email: string;
  contactnumber: string;
  gradeapplying: string;
  gender: string;
  dateofbirth: string | null;
  address: string | null;
  status: string;
  applieddate: string;
  lastupdatedate: string;
  created_at: string;
  updated_at: string;
}

interface DbAdmissionProcess {
  id: string;
  prospectivestudentid: string;
  documentsrequired: DocumentStatus;
  interviewdate: string | null;
  assignedclassid: string | null;
  created_at: string;
  updated_at: string;
}

interface DbResponse<T> {
  data: T | null;
  error: any;
  count?: number;
}

// Helper functions
const formatDate = (date: string | Date | null): Date => {
  if (!date) return new Date();
  const newDate = new Date(date);
  return isNaN(newDate.getTime()) ? new Date() : newDate;
};

const formatOptionalDate = (date: string | Date | null): Date | undefined => {
  if (!date) return undefined;
  const newDate = new Date(date);
  return isNaN(newDate.getTime()) ? undefined : newDate;
};

const toISOString = (date: Date | undefined): string => {
  return date?.toISOString() ?? new Date().toISOString();
};

// Mapping functions
const mapDbStudentToFrontend = (dbStudent: DbProspectiveStudent): ProspectiveStudent => {
  return {
    id: dbStudent.id,
    studentName: dbStudent.studentname,
    parentName: dbStudent.parentname,
    email: dbStudent.email,
    contactNumber: dbStudent.contactnumber,
    gradeApplying: dbStudent.gradeapplying,
    gender: dbStudent.gender as Gender,
    dateOfBirth: formatDate(dbStudent.dateofbirth),
    address: dbStudent.address || '',
    status: dbStudent.status as EnquiryStatus,
    appliedDate: formatDate(dbStudent.applieddate),
    lastUpdateDate: formatDate(dbStudent.lastupdatedate)
  };
};

// TODO: Document status handling needs to be updated to match the types from @/types/admission
// The DocumentStatus type needs the following:
// - submitted should be DocumentSubmission[] instead of string[]
// - DocumentSubmission should include: fileName, type, uploadDate, status
const mapDbProcessToFrontend = (dbProcess: DbAdmissionProcess): AdmissionProcess => {
  return {
    id: dbProcess.id,
    prospectiveStudentId: dbProcess.prospectivestudentid,
    documentsRequired: dbProcess.documentsrequired,
    interviewDate: formatOptionalDate(dbProcess.interviewdate),
    assignedClassId: dbProcess.assignedclassid || undefined,
    createdAt: formatDate(dbProcess.created_at),
    updatedAt: formatDate(dbProcess.updated_at)
  };
};

const generateAdmissionTimeline = (currentStatus: EnquiryStatus): AdmissionTimelineStep[] => {
  const statuses = Object.values(ADMISSION_STATUS);
  return statuses.map((status, index) => ({
    step: index + 1,
    status,
    title: status,
    description: `Step ${index + 1}: ${status}`,
    completed: statuses.indexOf(currentStatus) > index,
    current: status === currentStatus,
    label: `${status} ${statuses.indexOf(currentStatus) > index ? '✓' : ''}`
  }));
};

// Export the service implementation
export const admissionService = {
  // ... service methods implementation
};

