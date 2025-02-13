import { supabase } from '@/lib/api-client';
import { v4 as uuidv4 } from 'uuid';
import { fileService } from '@/services/fileService';
import { fileTableService } from '@/services/fileTableService';
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
const FILE_BUCKET = 'File';

const TABLES = {
  PROSPECTIVE_STUDENT: 'ProspectiveStudent',
  ADMISSION_PROCESS: 'AdmissionProcess',
  ADMISSION_COMMUNICATION: 'AdmissionCommunication',
  ADMISSION_NOTES: 'AdmissionNotes',
  FILE: 'File'
} as const;

const FILE_CONFIG = {
  BUCKET: FILE_BUCKET,
  MAX_SIZE: 5 * 1024 * 1024,
  ALLOWED_TYPES: ['application/pdf', 'image/jpeg', 'image/png']
} as const;

// Database interfaces
type DocumentVerificationStatus = 'pending' | 'verified' | 'rejected';

interface DbProspectiveStudent {
  id: string;
  student_name: string;
  parent_name: string;
  email: string;
  contact_number: string;
  grade_applying: string;
  gender: string;
  date_of_birth: string | null;
  address: string | null;
  status: string;
  applied_date: string;
  last_update_date: string;
  created_at: string;
  updated_at: string;
}

interface DbAdmissionProcess {
  id: string;
  prospective_student_id: string;
  documents_required: DocumentStatus;
  interview_date: string | null;
  assigned_class_id: string | null;
  created_at: string;
  updated_at: string;
}

interface DbAdmissionNote {
  id: string;
  prospective_student_id: string;
  content: string;
  created_by: string;
  created_at: string;
}

interface DbAdmissionCommunication {
  id: string;
  prospective_student_id: string;
  communication_type: string;
  notes: string | null;
  staff_id: string;
  communication_date: string;
  created_at: string;
  updated_at: string;
}

interface DbFile {
  id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  uploaded_by: string;
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
    studentName: dbStudent.student_name,
    parentName: dbStudent.parent_name,
    email: dbStudent.email,
    contactNumber: dbStudent.contact_number,
    gradeApplying: dbStudent.grade_applying,
    gender: dbStudent.gender as Gender,
    dateOfBirth: formatDate(dbStudent.date_of_birth),
    address: dbStudent.address || '',
    status: dbStudent.status as EnquiryStatus,
    appliedDate: formatDate(dbStudent.applied_date),
    lastUpdateDate: formatDate(dbStudent.last_update_date)
  };
};

const mapDbProcessToFrontend = (dbProcess: DbAdmissionProcess): AdmissionProcess => {
  return {
    id: dbProcess.id,
    prospectiveStudentId: dbProcess.prospective_student_id,
    documentsRequired: dbProcess.documents_required,
    interviewDate: formatOptionalDate(dbProcess.interview_date),
    assignedClassId: dbProcess.assigned_class_id || undefined,
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
    const id = uuidv4();
    const now = new Date().toISOString();
    
    const dbData = {
      id,
      student_name: data.studentName,
      parent_name: data.parentName,
      email: data.email,
      contact_number: data.contactNumber,
      grade_applying: data.gradeApplying,
      gender: data.gender,
      date_of_birth: data.dateOfBirth?.toISOString() || null,
      address: data.address || null,
      status: ADMISSION_STATUS.NEW,
      applied_date: now,
      last_update_date: now,
      created_at: now,
      updated_at: now
    };

    const { data: newEnquiry, error } = await supabase
      .schema(SCHEMA)
      .from(TABLES.PROSPECTIVE_STUDENT)
      .insert([dbData])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create enquiry: ${error.message}`);
    }

    // Create initial admission process entry
    const { error: processError } = await supabase
      .schema(SCHEMA)
      .from(TABLES.ADMISSION_PROCESS)
      .insert([{
        id: uuidv4(),
        prospective_student_id: id,
        documents_required: REQUIRED_DOCUMENTS.reduce((acc, doc) => ({
          ...acc,
          [doc]: { status: 'pending', url: null }
        }), {}),
        interview_date: null,
        assigned_class_id: null,
        created_at: now,
        updated_at: now
      }]);

    if (processError) {
      throw new Error(`Failed to create admission process: ${processError.message}`);
    }

    return mapDbStudentToFrontend(newEnquiry);
  },

  async updateEnquiry(id: string, data: Partial<ProspectiveStudentData>): Promise<ProspectiveStudent> {
    const dbData = {
      student_name: data.studentName,
      parent_name: data.parentName,
      email: data.email,
      contact_number: data.contactNumber,
      grade_applying: data.gradeApplying,
      gender: data.gender,
      date_of_birth: data.dateOfBirth?.toISOString(),
      address: data.address,
      last_update_date: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: updatedEnquiry, error } = await supabase
      .schema(SCHEMA)
      .from(TABLES.PROSPECTIVE_STUDENT)
      .update(dbData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update enquiry: ${error.message}`);
    }

    return mapDbStudentToFrontend(updatedEnquiry);
  },

  async updateEnquiryStatus(id: string, status: EnquiryStatus): Promise<void> {
    const now = new Date().toISOString();
    const { error } = await supabase
      .schema(SCHEMA)
      .from(TABLES.PROSPECTIVE_STUDENT)
      .update({ 
        status, 
        last_update_date: now,
        updated_at: now 
      })
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to update enquiry status: ${error.message}`);
    }
  },

  async getEnquiryById(id: string): Promise<{
    student: ProspectiveStudent;
    process: AdmissionProcess;
    timeline: AdmissionTimelineStep[];
  }> {
    const { data: enquiry, error } = await supabase
      .schema(SCHEMA)
      .from(TABLES.PROSPECTIVE_STUDENT)
      .select(`
        *,
        ${TABLES.ADMISSION_PROCESS}(*)
      `)
      .eq('id', id)
      .single();

    if (error || !enquiry) {
      throw new Error(`Failed to fetch enquiry: ${error?.message || 'Not found'}`);
    }

    const student = mapDbStudentToFrontend(enquiry);
    const process = mapDbProcessToFrontend(enquiry[TABLES.ADMISSION_PROCESS][0]);
    const timeline = generateAdmissionTimeline(student.status);

    return { student, process, timeline };
  },

  async getAllEnquiries(params: SearchParams) {
    let query = supabase
      .schema(SCHEMA)
      .from(TABLES.PROSPECTIVE_STUDENT)
      .select('*', { count: 'exact' });

    // Apply filters
    if (params.status) {
      query = query.eq('status', params.status);
    }
    if (params.search) {
      query = query.or(`
        student_name.ilike.%${params.search}%,
        parent_name.ilike.%${params.search}%,
        email.ilike.%${params.search}%,
        contact_number.ilike.%${params.search}%
      `);
    }
    if (params.fromDate) {
      query = query.gte('applied_date', params.fromDate.toISOString());
    }
    if (params.toDate) {
      query = query.lte('applied_date', params.toDate.toISOString());
    }
    if (params.grade) {
      query = query.eq('grade_applying', params.grade);
    }

    // Apply sorting
    const sortColumn = params.sortBy || 'applied_date';
    const sortOrder = params.sortOrder || 'desc';
    query = query.order(sortColumn, { ascending: sortOrder === 'asc' });

    // Apply pagination
    const page = params.page || 1;
    const limit = params.limit || 10;
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Failed to fetch enquiries: ${error.message}`);
    }

    return {
      enquiries: data.map(mapDbStudentToFrontend),
      total: count || 0,
      page,
      limit
    };
  },

  async addEnquiryNote(id: string, content: string, createdBy: string): Promise<Note> {
    const noteId = uuidv4();
    const now = new Date().toISOString();

    const { data: note, error } = await supabase
      .schema(SCHEMA)
      .from(TABLES.ADMISSION_NOTES)
      .insert([{
        id: noteId,
        prospective_student_id: id,
        content,
        created_by: createdBy,
        created_at: now
      }])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to add note: ${error.message}`);
    }

    return {
      id: note.id,
      content: note.content,
      createdBy: note.created_by,
      createdAt: formatDate(note.created_at)
    };
  },

  async getEnquiryNotes(id: string): Promise<Note[]> {
    const { data: notes, error } = await supabase
      .schema(SCHEMA)
      .from(TABLES.ADMISSION_NOTES)
      .select('*')
      .eq('prospective_student_id', id)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch notes: ${error.message}`);
    }

    return notes.map(note => ({
      id: note.id,
      content: note.content,
      createdBy: note.created_by,
      createdAt: formatDate(note.created_at)
    }));
  },

  async uploadDocument(id: string, file: File, documentType: RequiredDocument): Promise<void> {
    try {
      // Validate file using fileService
      const validation = fileService.validateFile(file);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      // Upload file using fileService
      const filePath = `admission/${id}/${documentType}`;
      const uploadedFile = await fileService.uploadFile(file, filePath);
      
      if (!uploadedFile) {
        throw new Error('Failed to upload file');
      }

      // Create file record
      const fileId = uuidv4();
      const now = new Date().toISOString();
      
      const { error: fileError } = await supabase
        .schema(SCHEMA)
        .from(TABLES.FILE)
        .insert([{
          id: fileId,
          file_name: file.name,
          file_path: uploadedFile.path,
          file_type: file.type,
          file_size: file.size,
          uploaded_by: 'admission',
          created_at: now,
          updated_at: now
        }]);

      if (fileError) {
        throw new Error(`Failed to create file record: ${fileError.message}`);
      }

      // Update admission process
      const { data: process, error: processError } = await supabase
        .schema(SCHEMA)
        .from(TABLES.ADMISSION_PROCESS)
        .select('documents_required')
        .eq('prospective_student_id', id)
        .single();

      if (processError || !process) {
        throw new Error(`Failed to fetch process: ${processError?.message || 'Not found'}`);
      }

      const documentsRequired = {
        ...process.documents_required,
        [documentType]: {
          status: 'pending' as DocumentVerificationStatus,
          url: uploadedFile.path,
          fileId
        }
      };

      const { error: updateError } = await supabase
        .schema(SCHEMA)
        .from(TABLES.ADMISSION_PROCESS)
        .update({
          documents_required: documentsRequired,
          updated_at: now
        })
        .eq('prospective_student_id', id);

      if (updateError) {
        throw new Error(`Failed to update document status: ${updateError.message}`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to upload document';
      throw new Error(message);
    }
  },

  async getDocumentUrl(filePath: string): Promise<string> {
    try {
      return await fileService.getSignedUrl(filePath);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get document URL';
      throw new Error(message);
    }
  },

  async getAllDocuments(id: string): Promise<Record<RequiredDocument, DocumentStatus>> {
    const { data: process, error } = await supabase
      .schema(SCHEMA)
      .from(TABLES.ADMISSION_PROCESS)
      .select('documents_required')
      .eq('prospective_student_id', id)
      .single();

    if (error || !process) {
      throw new Error(`Failed to fetch documents: ${error?.message || 'Not found'}`);
    }

    return process.documents_required;
  },

  async getCommunicationHistory(id: string): Promise<Communication[]> {
    const { data: communications, error } = await supabase
      .schema(SCHEMA)
      .from(TABLES.ADMISSION_COMMUNICATION)
      .select('*')
      .eq('prospective_student_id', id)
      .order('communication_date', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch communication history: ${error.message}`);
    }

    return communications.map(comm => ({
      id: comm.id,
      type: comm.communication_type,
      notes: comm.notes || '',
      staffId: comm.staff_id,
      communicationDate: formatDate(comm.communication_date),
      createdAt: formatDate(comm.created_at),
      updatedAt: formatDate(comm.updated_at)
    }));
  },

  async addCommunication(
    id: string,
    communication: Omit<Communication, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<void> {
    const now = new Date().toISOString();
    
    const { error } = await supabase
      .schema(SCHEMA)
      .from(TABLES.ADMISSION_COMMUNICATION)
      .insert([{
        id: uuidv4(),
        prospective_student_id: id,
        communication_type: communication.type,
        notes: communication.notes,
        staff_id: communication.staffId,
        communication_date: communication.communicationDate.toISOString(),
        created_at: now,
        updated_at: now
      }]);

    if (error) {
      throw new Error(`Failed to add communication: ${error.message}`);
    }
  },

  async scheduleInterview(
    id: string,
    interviewDate: Date,
    assignedClassId?: string
  ): Promise<void> {
    const { error } = await supabase
      .schema(SCHEMA)
      .from(TABLES.ADMISSION_PROCESS)
      .update({
        interview_date: interviewDate.toISOString(),
        assigned_class_id: assignedClassId,
        updated_at: new Date().toISOString()
      })
      .eq('prospective_student_id', id);

    if (error) {
      throw new Error(`Failed to schedule interview: ${error.message}`);
    }
  },

  async verifyDocument(
    id: string,
    documentType: RequiredDocument,
    status: DocumentVerificationStatus
  ): Promise<void> {
    const { data: process, error: fetchError } = await supabase
      .schema(SCHEMA)
      .from(TABLES.ADMISSION_PROCESS)
      .select('documents_required')
      .eq('prospective_student_id', id)
      .single();

    if (fetchError || !process) {
      throw new Error(`Failed to fetch process: ${fetchError?.message || 'Not found'}`);
    }

    const documentsRequired = {
      ...process.documents_required,
      [documentType]: {
        ...process.documents_required[documentType],
        status
      }
    };

    const { error: updateError } = await supabase
      .schema(SCHEMA)
      .from(TABLES.ADMISSION_PROCESS)
      .update({
        documents_required: documentsRequired,
        updated_at: new Date().toISOString()
      })
      .eq('prospective_student_id', id);

    if (updateError) {
      throw new Error(`Failed to verify document: ${updateError.message}`);
    }
  }
};
