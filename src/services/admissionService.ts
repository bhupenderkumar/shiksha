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

// Database interfaces - using camelCase to match DB schema
type DocumentVerificationStatus = 'pending' | 'verified' | 'rejected';

interface DbProspectiveStudent {
  id: string;
  studentName: string;
  parentName: string;
  email: string;
  contactNumber: string;
  gradeApplying: string;
  gender: string;
  dateOfBirth: string | null;
  address: string | null;
  status: string;
  appliedDate: string | null;
  lastUpdateDate: string | null;
  createdAt: string;
  updatedAt: string;
  schoolId: string;
}

interface DbAdmissionProcess {
  id: string;
  prospectiveStudentId: string;
  documentsRequired: DocumentStatus;
  interviewDate: string | null;
  assignedClassId: string | null;
  createdAt: string;
  updatedAt: string;
}

interface DbAdmissionNote {
  id: string;
  prospectiveStudentId: string;
  content: string;
  createdBy: string;
  createdAt: string;
}

interface DbAdmissionCommunication {
  id: string;
  prospectiveStudentId: string;
  communicationType: string;
  notes: string | null;
  staffId: string;
  communicationDate: string;
  createdAt: string;
  updatedAt: string;
}

interface DbFile {
  id: string;
  fileName: string;
  filePath: string;
  fileType: string;
  fileSize: number;
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
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
    studentName: dbStudent.studentName,
    parentName: dbStudent.parentName,
    email: dbStudent.email,
    contactNumber: dbStudent.contactNumber,
    gradeApplying: dbStudent.gradeApplying,
    gender: dbStudent.gender as Gender,
    dateOfBirth: formatDate(dbStudent.dateOfBirth),
    address: dbStudent.address || '',
    status: dbStudent.status as EnquiryStatus,
    appliedDate: formatDate(dbStudent.appliedDate),
    lastUpdateDate: formatDate(dbStudent.lastUpdateDate)
  };
};

const mapDbProcessToFrontend = (dbProcess: DbAdmissionProcess): AdmissionProcess => {
  return {
    id: dbProcess.id,
    prospectiveStudentId: dbProcess.prospectiveStudentId,
    documentsRequired: dbProcess.documentsRequired,
    interviewDate: formatOptionalDate(dbProcess.interviewDate),
    assignedClassId: dbProcess.assignedClassId || undefined,
    createdAt: formatDate(dbProcess.createdAt),
    updatedAt: formatDate(dbProcess.updatedAt)
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
    
    // Database uses camelCase column names
    const dbData = {
      id,
      studentName: data.studentName,
      parentName: data.parentName,
      email: data.email,
      contactNumber: data.contactNumber,
      gradeApplying: data.gradeApplying,
      gender: data.gender,
      dateOfBirth: data.dateOfBirth?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
      address: data.address || '',
      status: ADMISSION_STATUS.NEW,
      appliedDate: now,
      lastUpdateDate: now,
      createdAt: now,
      updatedAt: now,
      schoolId: '00000000-0000-0000-0000-000000000001' // Default school ID
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
        prospectiveStudentId: id,
        documentsRequired: REQUIRED_DOCUMENTS.reduce((acc, doc) => ({
          ...acc,
          [doc]: { status: 'pending', url: null }
        }), {}),
        interviewDate: null,
        assignedClassId: null,
        createdAt: now,
        updatedAt: now
      }]);

    if (processError) {
      // Log but don't fail - the main enquiry was created
      console.warn(`Failed to create admission process: ${processError.message}`);
    }

    return mapDbStudentToFrontend(newEnquiry);
  },

  async updateEnquiry(id: string, data: Partial<ProspectiveStudentData>): Promise<ProspectiveStudent> {
    const now = new Date().toISOString();
    const dbData: Record<string, unknown> = {
      lastUpdateDate: now,
      updatedAt: now
    };
    
    if (data.studentName) dbData.studentName = data.studentName;
    if (data.parentName) dbData.parentName = data.parentName;
    if (data.email) dbData.email = data.email;
    if (data.contactNumber) dbData.contactNumber = data.contactNumber;
    if (data.gradeApplying) dbData.gradeApplying = data.gradeApplying;
    if (data.gender) dbData.gender = data.gender;
    if (data.dateOfBirth) dbData.dateOfBirth = data.dateOfBirth.toISOString().split('T')[0];
    if (data.address) dbData.address = data.address;

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
        lastUpdateDate: now,
        updatedAt: now 
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
