import { supabase } from '@/lib/api-client';
import { v4 as uuidv4 } from 'uuid';
import { fileService } from './fileService';
import { fileTableService } from './fileTableService';
import { ADMISSION_STATUS, COMMUNICATION_TYPES, REQUIRED_DOCUMENTS } from '@/lib/constants';
import { toast } from '@/components/ui/toast';
import type {
  AdmissionCommunication as Communication,
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
  async createEnquiry(data: ProspectiveStudentData): Promise<ProspectiveStudent> {
    const { data: newEnquiry, error } = await supabase
      .schema(SCHEMA)
      .from(TABLES.PROSPECTIVE_STUDENT)
      .insert([data])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create enquiry: ${error.message}`);
    }

    return mapDbStudentToFrontend(newEnquiry);
  },

  async updateEnquiry(id: string, data: Partial<ProspectiveStudentData>): Promise<ProspectiveStudent> {
    const { data: updatedEnquiry, error } = await supabase
      .schema(SCHEMA)
      .from(TABLES.PROSPECTIVE_STUDENT)
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update enquiry: ${error.message}`);
    }

    return mapDbStudentToFrontend(updatedEnquiry);
  },

  async updateEnquiryStatus(id: string, status: EnquiryStatus): Promise<void> {
    const { error } = await supabase
      .schema(SCHEMA)
      .from(TABLES.PROSPECTIVE_STUDENT)
      .update({ status, lastupdatedate: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to update enquiry status: ${error.message}`);
    }
  },

  async getEnquiryById(id: string): Promise<ProspectiveStudent> {
    const { data: enquiry, error } = await supabase
      .schema(SCHEMA)
      .from(TABLES.PROSPECTIVE_STUDENT)
      .select()
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Failed to fetch enquiry: ${error.message}`);
    }

    return mapDbStudentToFrontend(enquiry);
  },

  async getAllEnquiries(params: SearchParams) {
    let query = supabase
      .schema(SCHEMA)
      .from(TABLES.PROSPECTIVE_STUDENT)
      .select('*, AdmissionProcess(*)');

    // Apply filters
    if (params.status && params.status.length > 0) {
      query = query.in('status', params.status);
    }

    if (params.searchTerm) {
      query = query.or(
        `studentname.ilike.%${params.searchTerm}%,email.ilike.%${params.searchTerm}%,parentname.ilike.%${params.searchTerm}%`
      );
    }

    if (params.dateRange) {
      query = query
        .gte('applieddate', params.dateRange.start.toISOString())
        .lte('applieddate', params.dateRange.end.toISOString());
    }

    if (params.gradeApplying) {
      query = query.eq('gradeapplying', params.gradeApplying);
    }

    // Get total count using a separate query
    const countQuery = supabase
      .schema(SCHEMA)
      .from(TABLES.PROSPECTIVE_STUDENT)
      .select('id', { count: 'exact', head: true });

    // Apply the same filters to count query
    if (params.status && params.status.length > 0) {
      countQuery.in('status', params.status);
    }
    if (params.searchTerm) {
      countQuery.or(
        `studentname.ilike.%${params.searchTerm}%,email.ilike.%${params.searchTerm}%,parentname.ilike.%${params.searchTerm}%`
      );
    }
    if (params.dateRange) {
      countQuery
        .gte('applieddate', params.dateRange.start.toISOString())
        .lte('applieddate', params.dateRange.end.toISOString());
    }
    if (params.gradeApplying) {
      countQuery.eq('gradeapplying', params.gradeApplying);
    }

    const [{ count }, { data, error }] = await Promise.all([
      countQuery,
      // Apply pagination to main query
      params.page && params.limit
        ? query.range((params.page - 1) * params.limit, params.page * params.limit - 1)
        : query
    ]);

    if (error) {
      throw new Error(`Failed to fetch enquiries: ${error.message}`);
    }

    return {
      data: data.map(item => ({
        ...mapDbStudentToFrontend(item),
        AdmissionProcess: item.AdmissionProcess ? mapDbProcessToFrontend(item.AdmissionProcess) : null
      })),
      total: count || 0
    };
  },

  async addEnquiryNote(id: string, content: string): Promise<Note> {
    const { data: newNote, error } = await supabase
      .schema(SCHEMA)
      .from(TABLES.ADMISSION_NOTES)
      .insert([{ prospectivestudentid: id, content }])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to add note: ${error.message}`);
    }

    return newNote;
  },

  async getEnquiryNotes(id: string): Promise<Note[]> {
    const { data: notes, error } = await supabase
      .schema(SCHEMA)
      .from(TABLES.ADMISSION_NOTES)
      .select()
      .eq('prospectivestudentid', id);

    if (error) {
      throw new Error(`Failed to fetch notes: ${error.message}`);
    }

    return notes;
  },

  async uploadDocument(id: string, file: File, documentType: RequiredDocument): Promise<void> {
    const filePath = `${FILE_CONFIG.BUCKET}/${id}/${documentType}/${file.name}`;
    const { error: uploadError } = await supabase.storage.from(FILE_CONFIG.BUCKET).upload(filePath, file);

    if (uploadError) {
      throw new Error(`Failed to upload document: ${uploadError.message}`);
    }

    // Get current documents status
    const { data: currentProcess, error: fetchError } = await supabase
      .schema(SCHEMA)
      .from(TABLES.ADMISSION_PROCESS)
      .select('documentsrequired')
      .eq('prospectivestudentid', id)
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch current document status: ${fetchError.message}`);
    }

    // Update document status
    const currentDocs = currentProcess?.documentsrequired || {};
    const updatedDocs = {
      ...currentDocs,
      [documentType]: {
        ...currentDocs[documentType],
        submitted: [{
          fileName: file.name,
          type: file.type,
          uploadDate: new Date(),
          status: 'pending'
        }]
      }
    };

    const { error: updateError } = await supabase
      .schema(SCHEMA)
      .from(TABLES.ADMISSION_PROCESS)
      .update({ documentsrequired: updatedDocs })
      .eq('prospectivestudentid', id);

    if (updateError) {
      throw new Error(`Failed to update document status: ${updateError.message}`);
    }
  },

  async getDocumentUrl(fileName: string): Promise<string> {
    const { data, error } = await supabase.storage
      .from(FILE_CONFIG.BUCKET)
      .createSignedUrl(fileName, 3600);

    if (error) {
      throw new Error(`Failed to get document URL: ${error.message}`);
    }

    return data.signedUrl;
  },

  async getAllDocuments(id: string): Promise<Record<RequiredDocument, DocumentStatus>> {
    const { data: documents, error } = await supabase
      .schema(SCHEMA)
      .from(TABLES.ADMISSION_PROCESS)
      .select('documentsrequired')
      .eq('prospectivestudentid', id)
      .single();

    if (error) {
      throw new Error(`Failed to fetch documents: ${error.message}`);
    }

    return documents.documentsrequired;
  },

  async getCommunicationHistory(id: string): Promise<Communication[]> {
    const { data: communications, error } = await supabase
      .schema(SCHEMA)
      .from(TABLES.ADMISSION_COMMUNICATION)
      .select()
      .eq('prospectivestudentid', id);

    if (error) {
      throw new Error(`Failed to fetch communications: ${error.message}`);
    }

    return communications;
  },

  async addCommunication(id: string, communication: Omit<Communication, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> {
    const { error } = await supabase
      .schema(SCHEMA)
      .from(TABLES.ADMISSION_COMMUNICATION)
      .insert([{ ...communication, prospectivestudentid: id }]);

    if (error) {
      throw new Error(`Failed to add communication: ${error.message}`);
    }
  }
};
