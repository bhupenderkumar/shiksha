
import { supabase } from '@/lib/api-client';
import { v4 as uuidv4 } from 'uuid';
import { fileService } from './fileService';
import { ADMISSION_STATUS, COMMUNICATION_TYPES, REQUIRED_DOCUMENTS } from '@/lib/constants';
import { toast } from '@/components/ui/toast';
import {
  ProspectiveStudent,
  ProspectiveStudentData,
  AdmissionProcess,
  DocumentStatus,
  FeeDetails,
  AdmissionCommunication,
  RequiredDocument,
  Gender,
  EnquiryStatus,
  Note,
  AdmissionTimelineStep,
  AdmissionProgress,
  SearchParams,
  FilteredEnquiry,
  EnquiryUpdateData,
  ProspectiveStudentRow,
  AdmissionProcessRow
} from '@/types/admission';

// Constants
const SCHEMA = 'school';

type AllowedFileType = 'image/jpeg' | 'image/png' | 'application/pdf';

const FILE_CONFIG = {
  BUCKET: 'File',
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'application/pdf'] as AllowedFileType[]
} as const;

const TABLES = {
  PROSPECTIVE_STUDENT: 'ProspectiveStudent',
  ADMISSION_PROCESS: 'AdmissionProcess',
  ADMISSION_COMMUNICATION: 'AdmissionCommunication',
  ADMISSION_NOTES: 'AdmissionNotes'
} as const;

// Helper Functions
const validateFile = (file: File) => {
  if (!FILE_CONFIG.ALLOWED_TYPES.includes(file.type as AllowedFileType)) {
    throw new Error('Invalid file type. Please upload a JPG, PNG or PDF file.');
  }

  if (file.size > FILE_CONFIG.MAX_SIZE) {
    throw new Error('File size too large. Maximum size is 5MB.');
  }
};

const getDocumentPath = (prospectiveStudentId: string, documentType: RequiredDocument) => {
  return `admission/${prospectiveStudentId}/${documentType}`;
};

const normalizeGender = (gender: 'Male' | 'Female' | 'Other'): Gender => gender;
const formatDate = (date: string | Date) => new Date(date);
const toISOString = (date: Date) => date.toISOString();

// Helper functions
const createInitialDocumentStatus = (): Record<RequiredDocument, DocumentStatus> => {
  const status: Record<RequiredDocument, DocumentStatus> = {} as Record<RequiredDocument, DocumentStatus>;
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

// Services
export const admissionService = {
  async getAdmissionProgress(id: string): Promise<AdmissionProgress> {
    if (!id) throw new Error('Student ID is required');

    try {
      const [processResponse, studentResponse] = await Promise.all([
        supabase
          .schema(SCHEMA)
          .from(TABLES.ADMISSION_PROCESS)
          .select('*')
          .eq('prospectivestudentid', id)
          .single(),
        supabase
          .schema(SCHEMA)
          .from(TABLES.PROSPECTIVE_STUDENT)
          .select('status')
          .eq('id', id)
          .single()
      ]);

      if (processResponse.error) throw new Error(`Process error: ${processResponse.error.message}`);
      if (studentResponse.error) throw new Error(`Student error: ${studentResponse.error.message}`);

      const processData = processResponse.data;
      const student = studentResponse.data;
      const timeline = generateAdmissionTimeline(student.status);
      const currentStep = timeline.findIndex(step => step.current) + 1;
      const completedSteps = timeline
        .filter(step => step.completed)
        .map(step => step.title);

      return {
        currentStatus: student.status,
        currentStep,
        lastSaved: new Date(),
        completedSteps,
        nextStep: timeline.find(step => step.current)?.title || timeline[0].title,
        timeline,
        documentsStatus: processData?.documentsrequired || createInitialDocumentStatus(),
        interviewDate: processData?.interviewdate ? new Date(processData.interviewdate) : undefined,
        assignedClass: processData?.assignedclass
      };
    } catch (error) {
      console.error('Error getting admission progress:', error);
      toast.error(error instanceof Error ? error.message : "Failed to get admission progress");
      throw error;
    }
  },

  async uploadDocument(
    prospectiveStudentId: string,
    file: File,
    documentType: RequiredDocument
  ): Promise<string> {
    try {
      validateFile(file);
      const timestamp = new Date().getTime();
      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filePath = `${getDocumentPath(prospectiveStudentId, documentType)}/${timestamp}_${sanitizedFileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(FILE_CONFIG.BUCKET)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: admissionProcess, error: fetchError } = await supabase
        .schema(SCHEMA)
        .from(TABLES.ADMISSION_PROCESS)
        .select('documentsrequired')
        .eq('prospectivestudentid', prospectiveStudentId)
        .single();

      if (fetchError) throw fetchError;

      const documentsRequired = admissionProcess.documentsrequired;
      documentsRequired[documentType].submitted.push(filePath);
      documentsRequired[documentType].verificationStatus[filePath] = 'pending';

      const { error: updateError } = await supabase
        .schema(SCHEMA)
        .from(TABLES.ADMISSION_PROCESS)
        .update({ documentsrequired: documentsRequired })
        .eq('prospectivestudentid', prospectiveStudentId);

      if (updateError) throw updateError;

      return filePath;
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  },

  async getDocumentUrl(filePath: string): Promise<string> {
    if (!filePath) {
      throw new Error('File path is required');
    }

    try {
      const { data } = supabase.storage
        .from(FILE_CONFIG.BUCKET)
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error getting document URL:', error);
      throw error;
    }
  },

  async verifyDocument(
    prospectiveStudentId: string,
    documentType: RequiredDocument,
    status: 'verified' | 'rejected',
    remarks?: string
  ): Promise<void> {
    try {
      const { data: admissionProcess, error: fetchError } = await supabase
        .schema(SCHEMA)
        .from(TABLES.ADMISSION_PROCESS)
        .select('documentsrequired')
        .eq('prospectivestudentid', prospectiveStudentId)
        .single();

      if (fetchError) throw new Error(fetchError.message);

      const currentDoc = admissionProcess.documentsrequired[documentType];
      const documentsRequired = {
        ...admissionProcess.documentsrequired,
        [documentType]: {
          ...currentDoc,
          verificationStatus: {
            [documentType]: status
          },
          rejectionReason: remarks ? { [documentType]: remarks } : {}
        }
      };

      const { error: updateError } = await supabase
        .schema(SCHEMA)
        .from(TABLES.ADMISSION_PROCESS)
        .update({ documentsrequired: documentsRequired })
        .eq('prospectivestudentid', prospectiveStudentId);

      if (updateError) throw new Error(`Process update error: ${updateError.message}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to verify document");
      throw error;
    }
  },

  async getAllDocuments(prospectiveStudentId: string): Promise<Record<RequiredDocument, DocumentStatus>> {
    try {
      const { data, error } = await supabase
        .schema(SCHEMA)
        .from(TABLES.ADMISSION_PROCESS)
        .select('documentsrequired')
        .eq('prospectivestudentid', prospectiveStudentId)
        .single();

      if (error) throw new Error(error.message);
      return data?.documentsrequired || createInitialDocumentStatus();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to fetch documents");
      throw error;
    }
  },

  async updateEnquiryStatus(id: string, newStatus: EnquiryStatus): Promise<void> {
    if (!id) throw new Error('Student ID is required');

    try {
      const { error: updateError } = await supabase
        .schema(SCHEMA)
        .from(TABLES.PROSPECTIVE_STUDENT)
        .update({ status: newStatus })
        .eq('id', id);

      if (updateError) throw new Error(`Status update error: ${updateError.message}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update status");
      throw error;
    }
  },

  async getEnquiryById(id: string): Promise<ProspectiveStudent> {
    try {
      const { data, error } = await supabase
        .schema(SCHEMA)
        .from(TABLES.PROSPECTIVE_STUDENT)
        .select(`
          *,
          ${TABLES.ADMISSION_PROCESS} (*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      return {
        ...data,
        appliedDate: formatDate(data.applieddate),
        lastUpdateDate: formatDate(data.lastupdatedate),
        createdAt: formatDate(data.created_at),
        updatedAt: formatDate(data.updated_at),
        dateOfBirth: data.dateofbirth ? formatDate(data.dateofbirth) : null
      };
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to fetch enquiry details");
      throw error;
    }
  },

  async getAllEnquiries(params?: SearchParams): Promise<{ data: FilteredEnquiry[]; total: number }> {
    try {
      let query = supabase
        .schema(SCHEMA)
        .from(TABLES.PROSPECTIVE_STUDENT)
        .select(`*, ${TABLES.ADMISSION_PROCESS} (*)`, { count: 'exact' });

      if (params?.status?.length) {
        query = query.in('status', params.status);
      }

      if (params?.dateRange) {
        query = query
          .gte('applieddate', params.dateRange.start.toISOString())
          .lte('applieddate', params.dateRange.end.toISOString());
      }

      if (params?.searchTerm) {
        query = query.or(
          `studentname.ilike.%${params.searchTerm}%,` +
          `parentname.ilike.%${params.searchTerm}%,` +
          `email.ilike.%${params.searchTerm}%`
        );
      }

      if (params?.gradeApplying) {
        query = query.eq('gradeapplying', params.gradeApplying);
      }

      if (params?.page !== undefined && params?.limit !== undefined) {
        const from = (params.page - 1) * params.limit;
        const to = from + params.limit - 1;
        query = query.range(from, to);
      }

      const { data, error, count } = await query.order('applieddate', { ascending: false });

      if (error) throw error;

      return {
        data: data.map(item => ({
          ...item,
          appliedDate: formatDate(item.applieddate),
          lastUpdateDate: formatDate(item.lastupdatedate),
          createdAt: formatDate(item.created_at),
          updatedAt: formatDate(item.updated_at),
          dateOfBirth: item.dateofbirth ? formatDate(item.dateofbirth) : null
        })),
        total: count || 0
      };
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to fetch enquiries");
      throw error;
    }
  },

  async createEnquiry(data: ProspectiveStudentData): Promise<ProspectiveStudent> {
    try {
      const enquiry = {
        id: uuidv4(),
        ...data,
        status: ADMISSION_STATUS.NEW,
        schoolId: '1', // TODO: Get from context
        applieddate: new Date().toISOString(),
        lastupdatedate: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: result, error } = await supabase
        .schema(SCHEMA)
        .from(TABLES.PROSPECTIVE_STUDENT)
        .insert([enquiry])
        .select()
        .single();

      if (error) throw error;

      // Initialize admission process
      await this.initializeAdmissionProcess(result.id);

      return {
        ...result,
        appliedDate: formatDate(result.applieddate),
        lastUpdateDate: formatDate(result.lastupdatedate),
        createdAt: formatDate(result.created_at),
        updatedAt: formatDate(result.updated_at),
        dateOfBirth: result.dateofbirth ? formatDate(result.dateofbirth) : null
      };
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create enquiry");
      throw error;
    }
  },

  async updateEnquiry(id: string, data: Partial<ProspectiveStudentData>): Promise<ProspectiveStudent> {
    try {
      const { data: result, error } = await supabase
        .schema(SCHEMA)
        .from(TABLES.PROSPECTIVE_STUDENT)
        .update({
          ...data,
          updated_at: new Date().toISOString(),
          lastupdatedate: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        ...result,
        appliedDate: formatDate(result.applieddate),
        lastUpdateDate: formatDate(result.lastupdatedate),
        createdAt: formatDate(result.created_at),
        updatedAt: formatDate(result.updated_at),
        dateOfBirth: result.dateofbirth ? formatDate(result.dateofbirth) : null
      };
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update enquiry");
      throw error;
    }
  },

  async getEnquiryNotes(id: string): Promise<Note[]>{
    try {
      const { data, error } = await supabase
        .schema(SCHEMA)
        .from(TABLES.ADMISSION_NOTES)
        .select('*')
        .eq('prospectivestudentid', id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map(note => ({
        id: note.id,
        prospectiveStudentId: note.prospectivestudentid,
        content: note.content,
        createdBy: note.createdby,
        createdAt: formatDate(note.created_at)
      }));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to fetch notes");
      throw error;
    }
  },

  async addEnquiryNote(prospectiveStudentId: string, content: string): Promise<Note> {
    try {
      const note = {
        id: uuidv4(),
        prospectivestudentid: prospectiveStudentId,
        content,
        createdby: 'SYSTEM', // TODO: Get from auth context
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .schema(SCHEMA)
        .from(TABLES.ADMISSION_NOTES)
        .insert([note])
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        prospectiveStudentId: data.prospectivestudentid,
        content: data.content,
        createdBy: data.createdby,
        createdAt: formatDate(data.created_at)
      };
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add note");
      throw error;
    }
  },

  async initializeAdmissionProcess(prospectiveStudentId: string): Promise<void> {
    try {
      const process = {
        id: uuidv4(),
        prospectivestudentid: prospectiveStudentId,
        documentsrequired: createInitialDocumentStatus(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .schema(SCHEMA)
        .from(TABLES.ADMISSION_PROCESS)
        .insert([process]);

      if (error) throw error;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to initialize admission process");
      throw error;
    }
  },

  async updateAdmissionProgress(
    id: string,
    data: {
      interviewDate?: Date;
      assignedClass?: string;
      documentsStatus?: Record<RequiredDocument, DocumentStatus>;
      status?: EnquiryStatus;
      notes?: string;
    }
  ): Promise<void> {
    try {
      const updateData: Partial<AdmissionProcessRow> = {};
      
      if (data.interviewDate) {
        updateData.interviewdate = data.interviewDate.toISOString();
      }
      if (data.assignedClass) {
        updateData.assignedclass = data.assignedClass;
      }
      if (data.documentsStatus) {
        updateData.documentsrequired = data.documentsStatus;
      }
      
      updateData.updated_at = new Date().toISOString();

      // Update status in ProspectiveStudent if provided
      if (data.status) {
        const { error: statusError } = await supabase
          .schema(SCHEMA)
          .from(TABLES.PROSPECTIVE_STUDENT)
          .update({ status: data.status })
          .eq('id', id);

        if (statusError) throw statusError;
      }

      // Add note if provided
      if (data.notes) {
        await this.addEnquiryNote(id, data.notes);
      }

      const { error } = await supabase
        .schema(SCHEMA)
        .from(TABLES.ADMISSION_PROCESS)
        .update(updateData)
        .eq('prospectivestudentid', id);

      if (error) throw error;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update admission progress");
      throw error;
    }
  },

  async getCommunicationHistory(id: string): Promise<AdmissionCommunication[]> {
    try {
      const { data, error } = await supabase
        .schema(SCHEMA)
        .from(TABLES.ADMISSION_COMMUNICATION)
        .select('*')
        .eq('prospectivestudentid', id)
        .order('communicationdate', { ascending: false });

      if (error) throw error;

      return data.map(comm => ({
        id: comm.id,
        prospectiveStudentId: comm.prospectivestudentid,
        communicationType: comm.communicationtype,
        notes: comm.notes,
        staffId: comm.staffid,
        communicationDate: formatDate(comm.communicationdate),
        createdAt: formatDate(comm.created_at),
        updatedAt: formatDate(comm.updated_at)
      }));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to fetch communication history");
      throw error;
    }
  },

  async addCommunication(
    prospectiveStudentId: string,
    data: {
      type: 'email' | 'phone' | 'in_person';
      message: string;
      direction?: 'incoming' | 'outgoing';
      notes?: string;
      staffId?: string;
    }
  ): Promise<AdmissionCommunication> {
    try {
      // Convert type to match COMMUNICATION_TYPES
      const typeMap = {
        'email': COMMUNICATION_TYPES.EMAIL,
        'phone': COMMUNICATION_TYPES.PHONE,
        'in_person': COMMUNICATION_TYPES.MEETING
      };

      const communication = {
        id: uuidv4(),
        prospectivestudentid: prospectiveStudentId,
        communicationtype: typeMap[data.type],
        notes: data.message + (data.notes ? `\n\nAdditional Notes: ${data.notes}` : ''),
        staffid: data.staffId || 'SYSTEM', // Default to SYSTEM if no staffId provided
        direction: data.direction || 'outgoing', // Default to outgoing if not specified
        communicationdate: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: result, error } = await supabase
        .schema(SCHEMA)
        .from(TABLES.ADMISSION_COMMUNICATION)
        .insert([communication])
        .select()
        .single();

      if (error) throw error;

      return {
        id: result.id,
        prospectiveStudentId: result.prospectivestudentid,
        communicationType: result.communicationtype,
        notes: result.notes,
        staffId: result.staffid,
        communicationDate: formatDate(result.communicationdate),
        createdAt: formatDate(result.created_at),
        updatedAt: formatDate(result.updated_at)
      };
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add communication");
      throw error;
    }
  }
};
