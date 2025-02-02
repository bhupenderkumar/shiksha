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

interface DocumentStatus {
  required: RequiredDocument[];
  submitted: string[];
  verificationStatus: Record<string, DocumentVerificationStatus>;
  rejectionReason: Record<string, string>;
}

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
  documentsrequired: Record<RequiredDocument, DocumentStatus>;
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

const mapDbProcessToFrontend = (dbProcess: DbAdmissionProcess): AdmissionProcess => {
  // First create the base document status for all required documents
  const documentsRequired = REQUIRED_DOCUMENTS.reduce((acc, doc) => {
    acc[doc] = {
      required: [doc],
      submitted: [],
      verificationStatus: {},
      rejectionReason: {}
    };
    return acc;
  }, {} as Record<RequiredDocument, DocumentStatus>);

  // Then merge in any existing document statuses
  if (dbProcess.documentsrequired) {
    for (const [key, value] of Object.entries(dbProcess.documentsrequired)) {
      const docKey = key as RequiredDocument;
      if (docKey in documentsRequired) {
        documentsRequired[docKey] = {
          required: value.required || [docKey],
          submitted: value.submitted || [],
          verificationStatus: value.verificationStatus || {},
          rejectionReason: value.rejectionReason || {}
        };
      }
    }
  }

  return {
    id: dbProcess.id,
    prospectiveStudentId: dbProcess.prospectivestudentid,
    documentsRequired,
    interviewDate: formatOptionalDate(dbProcess.interviewdate),
    assignedClassId: dbProcess.assignedclassid || undefined,
    createdAt: formatDate(dbProcess.created_at),
    updatedAt: formatDate(dbProcess.updated_at)
  };
};

const createInitialDocumentStatus = (): Record<RequiredDocument, DocumentStatus> => {
  const status = {} as Record<RequiredDocument, DocumentStatus>;
  REQUIRED_DOCUMENTS.forEach(doc => {
    status[doc] = {
      required: [doc],
      submitted: [],
      verificationStatus: {},
      rejectionReason: {}
    };
  });
  return status;
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
