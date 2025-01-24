import { supabase } from '@/lib/api-client';
import { v4 as uuidv4 } from 'uuid';
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
  AdmissionProgress,
  Note
} from '@/types/admission';
import {
  ADMISSION_STATUS,
  REQUIRED_DOCUMENTS,
  SCHEMA
} from '@/lib/constants';

// Constants
const TABLES = {
  PROSPECTIVE_STUDENT: 'ProspectiveStudent',
  ADMISSION_PROCESS: 'AdmissionProcess',
  ADMISSION_COMMUNICATION: 'AdmissionCommunication',
  ADMISSION_NOTES: 'AdmissionNotes'
} as const;

interface AdmissionQueryParams {
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

const FILE_CONFIG = {
  BUCKET: 'admission-documents',
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'application/pdf'] as const
} as const;

// Utils
const toISOString = (date: Date) => date.toISOString();

const validateFile = (file: File): void => {
  if (file.size > FILE_CONFIG.MAX_SIZE) {
    throw new Error(`File ${file.name} exceeds maximum size of 5MB`);
  }
  if (!FILE_CONFIG.ALLOWED_TYPES.includes(file.type as typeof FILE_CONFIG.ALLOWED_TYPES[number])) {
    throw new Error(`Unsupported file type: ${file.type}`);
  }
};

const normalizeGender = (gender: 'Male' | 'Female' | 'Other'): Gender => gender;

const formatDate = (date: string | Date) => new Date(date);

const createInitialDocumentStatus = (): DocumentStatus => ({
  required: [...REQUIRED_DOCUMENTS] as RequiredDocument[],
  submitted: [],
  verificationStatus: Object.fromEntries(
    [...REQUIRED_DOCUMENTS].map(doc => [doc, 'pending'])
  ) as Record<RequiredDocument, 'pending' | 'verified' | 'rejected'>
});

export const admissionService = {
  async getAdmissionProgress(id: string): Promise<AdmissionProgress & { timeline: AdmissionTimeline[] }> {
    try {
      // Get enquiry and process data
      const { data: enquiry, error: enquiryError } = await supabase
        .schema(SCHEMA)
        .from(TABLES.PROSPECTIVE_STUDENT)
        .select(`
          *,
          ${TABLES.ADMISSION_PROCESS} (*)
        `)
        .eq('id', id)
        .single();

      if (enquiryError) throw enquiryError;

      // Get all notes/communications
      const { data: notes, error: notesError } = await supabase
        .schema(SCHEMA)
        .from(TABLES.ADMISSION_NOTES)
        .select('*')
        .eq('prospectiveStudentId', id)
        .order('createdAt', { ascending: false });

      if (notesError) throw notesError;

      // Calculate progress based on status
      const statusOrder = [
        ADMISSION_STATUS.NEW,
        ADMISSION_STATUS.IN_REVIEW,
        ADMISSION_STATUS.SCHEDULED_INTERVIEW,
        ADMISSION_STATUS.PENDING_DOCUMENTS,
        ADMISSION_STATUS.APPROVED,
        ADMISSION_STATUS.ENROLLED
      ];

      const currentStepIndex = statusOrder.indexOf(enquiry.status);
      const completedSteps = statusOrder.slice(0, currentStepIndex);
      
      // Generate timeline
      const timeline: AdmissionTimeline[] = statusOrder.map((status, index) => ({
        step: index + 1,
        status,
        title: status.replace(/_/g, ' '),
        description: getStatusDescription(status),
        completed: completedSteps.includes(status),
        current: status === enquiry.status
      }));

      const progress: AdmissionProgress & { timeline: AdmissionTimeline[] } = {
        currentStep: currentStepIndex + 1,
        lastSaved: formatDate(enquiry.lastUpdateDate),
        completedSteps: completedSteps,
        nextStep: currentStepIndex < statusOrder.length - 1 
          ? statusOrder[currentStepIndex + 1]
          : 'COMPLETED',
        timeline
      };

      return progress;
    } catch (error) {
      console.error('Error fetching admission progress:', error);
      throw error;
    }
  },

  async updateAdmissionProgress(
    id: string,
    data: {
      status?: EnquiryStatus;
      interviewDate?: Date;
      documentsStatus?: Partial<DocumentStatus>;
      notes?: string;
    }
  ): Promise<void> {
    try {
      // Start a transaction
      const { data: enquiry, error: enquiryError } = await supabase
        .schema(SCHEMA)
        .from(TABLES.PROSPECTIVE_STUDENT)
        .select('*')
        .eq('id', id)
        .single();

      if (enquiryError) throw enquiryError;

      // Update main status if provided
      if (data.status) {
        await this.updateEnquiryStatus(id, data.status);
      }

      // Update admission process
      if (data.interviewDate || data.documentsStatus) {
        const { error: processError } = await supabase
          .schema(SCHEMA)
          .from(TABLES.ADMISSION_PROCESS)
          .update({
            ...(data.interviewDate && { interviewDate: toISOString(data.interviewDate) }),
            ...(data.documentsStatus && { documentsRequired: data.documentsStatus }),
            updatedAt: toISOString(new Date())
          })
          .eq('prospectiveStudentId', id);

        if (processError) throw processError;
      }

      // Add note if provided
      if (data.notes) {
        await this.addEnquiryNote(id, data.notes);
      }
    } catch (error) {
      console.error('Error updating admission progress:', error);
      throw error;
    }
  },

  async getAllEnquiries(params?: AdmissionQueryParams) {
    try {
      let query = supabase
        .schema(SCHEMA)
        .from(TABLES.PROSPECTIVE_STUDENT)
        .select(`
          *,
          ${TABLES.ADMISSION_PROCESS} (*)
        `);

      // Apply filters
      if (params?.status && params.status.length > 0) {
        query = query.in('status', params.status);
      }

      if (params?.dateRange) {
        query = query.gte('appliedDate', params.dateRange.start.toISOString())
          .lte('appliedDate', params.dateRange.end.toISOString());
      }

      if (params?.searchTerm) {
        query = query.or(`
          studentName.ilike.%${params.searchTerm}%,
          parentName.ilike.%${params.searchTerm}%,
          email.ilike.%${params.searchTerm}%,
          contactNumber.ilike.%${params.searchTerm}%
        `);
      }

      if (params?.gradeApplying) {
        query = query.eq('gradeApplying', params.gradeApplying);
      }

      // Add pagination
      if (params?.page && params?.limit) {
        const from = (params.page - 1) * params.limit;
        const to = from + params.limit - 1;
        query = query.range(from, to);
      }

      const { data, error, count } = await query
        .order('appliedDate', { ascending: false });

      if (error) throw error;

      return {
        data: (data || []).map(item => ({
          ...item,
          appliedDate: formatDate(item.appliedDate),
          lastUpdateDate: formatDate(item.lastUpdateDate),
          createdAt: formatDate(item.createdAt),
          updatedAt: formatDate(item.updatedAt),
          dateOfBirth: item.dateOfBirth ? formatDate(item.dateOfBirth) : null
        })),
        total: count || 0
      };
    } catch (error) {
      console.error('Error fetching enquiries:', error);
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
        appliedDate: formatDate(data.appliedDate),
        lastUpdateDate: formatDate(data.lastUpdateDate),
        createdAt: formatDate(data.createdAt),
        updatedAt: formatDate(data.updatedAt),
        dateOfBirth: data.dateOfBirth ? formatDate(data.dateOfBirth) : null
      };
    } catch (error) {
      console.error('Error fetching enquiry:', error);
      throw error;
    }
  },

  async updateEnquiry(id: string, data: Partial<ProspectiveStudentData>) {
    try {
      const { data: result, error } = await supabase
        .schema(SCHEMA)
        .from(TABLES.PROSPECTIVE_STUDENT)
        .update({
          ...data,
          updatedAt: new Date().toISOString(),
          lastUpdateDate: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        ...result,
        appliedDate: formatDate(result.appliedDate),
        lastUpdateDate: formatDate(result.lastUpdateDate),
        createdAt: formatDate(result.createdAt),
        updatedAt: formatDate(result.updatedAt),
        dateOfBirth: result.dateOfBirth ? formatDate(result.dateOfBirth) : null
      };
    } catch (error) {
      console.error('Error updating enquiry:', error);
      throw error;
    }
  },

  async createEnquiry(data: ProspectiveStudentData) {
    try {
      const prospectiveStudent = {
        id: uuidv4(),
        ...data,
        status: ADMISSION_STATUS.NEW,
        appliedDate: toISOString(new Date()),
        lastUpdateDate: toISOString(new Date()),
        createdAt: toISOString(new Date()),
        updatedAt: toISOString(new Date()),
        gender: normalizeGender(data.gender)
      };

      const { data: result, error } = await supabase
        .schema(SCHEMA)
        .from(TABLES.PROSPECTIVE_STUDENT)
        .insert([prospectiveStudent])
        .select()
        .single();

      if (error) throw error;

      await this.initializeAdmissionProcess(result.id);
      
      return {
        ...result,
        appliedDate: formatDate(result.appliedDate),
        lastUpdateDate: formatDate(result.lastUpdateDate),
        createdAt: formatDate(result.createdAt),
        updatedAt: formatDate(result.updatedAt),
        dateOfBirth: result.dateOfBirth ? formatDate(result.dateOfBirth) : null
      };
    } catch (error) {
      console.error('Error creating enquiry:', error);
      throw error;
    }
  },

  async getEnquiryNotes(id: string): Promise<Note[]> {
    try {
      const { data, error } = await supabase
        .schema(SCHEMA)
        .from(TABLES.ADMISSION_NOTES)
        .select('*')
        .eq('prospectiveStudentId', id)
        .order('createdAt', { ascending: false });

      if (error) throw error;

      return (data || []).map(note => ({
        ...note,
        createdAt: formatDate(note.createdAt)
      }));
    } catch (error) {
      console.error('Error fetching notes:', error);
      throw error;
    }
  },

  async addEnquiryNote(id: string, content: string): Promise<Note> {
    try {
      const note = {
        id: uuidv4(),
        prospectiveStudentId: id,
        content,
        createdBy: 'Admin', // TODO: Get from auth context
        createdAt: toISOString(new Date())
      };

      const { data, error } = await supabase
        .schema(SCHEMA)
        .from(TABLES.ADMISSION_NOTES)
        .insert([note])
        .select()
        .single();

      if (error) throw error;

      return {
        ...data,
        createdAt: formatDate(data.createdAt)
      };
    } catch (error) {
      console.error('Error adding note:', error);
      throw error;
    }
  },

  async updateEnquiryStatus(id: string, newStatus: EnquiryStatus) {
    try {
      const { data, error } = await supabase
        .schema(SCHEMA)
        .from(TABLES.PROSPECTIVE_STUDENT)
        .update({
          status: newStatus,
          lastUpdateDate: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        ...data,
        appliedDate: formatDate(data.appliedDate),
        lastUpdateDate: formatDate(data.lastUpdateDate),
        createdAt: formatDate(data.createdAt),
        updatedAt: formatDate(data.updatedAt),
        dateOfBirth: data.dateOfBirth ? formatDate(data.dateOfBirth) : null
      };
    } catch (error) {
      console.error('Error updating enquiry status:', error);
      throw error;
    }
  },

  async initializeAdmissionProcess(prospectiveStudentId: string) {
    try {
      const admissionProcess = {
        id: uuidv4(),
        prospectiveStudentId,
        documentsRequired: createInitialDocumentStatus(),
        createdAt: toISOString(new Date()),
        updatedAt: toISOString(new Date())
      };

      const { error } = await supabase
        .schema(SCHEMA)
        .from(TABLES.ADMISSION_PROCESS)
        .insert([admissionProcess]);

      if (error) throw error;

      return admissionProcess;
    } catch (error) {
      console.error('Error initializing admission process:', error);
      throw error;
    }
  },

  // Document Management Functions
  async uploadDocument(
    prospectiveStudentId: string,
    file: File,
    documentType: RequiredDocument
  ): Promise<string> {
    try {
      validateFile(file);
      
      const fileName = `${prospectiveStudentId}/${documentType}/${uuidv4()}-${file.name}`;
      
      const { error: uploadError } = await supabase.storage
        .from(FILE_CONFIG.BUCKET)
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Update document status in admission process
      const { data: process, error: processError } = await supabase
        .schema(SCHEMA)
        .from(TABLES.ADMISSION_PROCESS)
        .select('documentsRequired')
        .eq('prospectiveStudentId', prospectiveStudentId)
        .single();

      if (processError) throw processError;

      const updatedDocs = {
        ...process.documentsRequired,
        submitted: [...process.documentsRequired.submitted, {
          type: documentType,
          fileName,
          uploadDate: new Date().toISOString(),
          status: 'pending'
        }]
      };

      const { error: updateError } = await supabase
        .schema(SCHEMA)
        .from(TABLES.ADMISSION_PROCESS)
        .update({
          documentsRequired: updatedDocs,
          updatedAt: new Date().toISOString()
        })
        .eq('prospectiveStudentId', prospectiveStudentId);

      if (updateError) throw updateError;

      return fileName;
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  },

  async getDocumentUrl(fileName: string): Promise<string> {
    try {
      const { data, error } = await supabase.storage
        .from(FILE_CONFIG.BUCKET)
        .createSignedUrl(fileName, 3600); // 1 hour expiry

      if (error) throw error;
      return data.signedUrl;
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
      const { data: process, error: processError } = await supabase
        .schema(SCHEMA)
        .from(TABLES.ADMISSION_PROCESS)
        .select('documentsRequired')
        .eq('prospectiveStudentId', prospectiveStudentId)
        .single();

      if (processError) throw processError;

      const updatedDocs = {
        ...process.documentsRequired,
        verificationStatus: {
          ...process.documentsRequired.verificationStatus,
          [documentType]: status
        }
      };

      if (remarks) {
        await this.addEnquiryNote(
          prospectiveStudentId,
          `Document ${documentType} ${status}: ${remarks}`
        );
      }

      const { error: updateError } = await supabase
        .schema(SCHEMA)
        .from(TABLES.ADMISSION_PROCESS)
        .update({
          documentsRequired: updatedDocs,
          updatedAt: new Date().toISOString()
        })
        .eq('prospectiveStudentId', prospectiveStudentId);

      if (updateError) throw updateError;
    } catch (error) {
      console.error('Error verifying document:', error);
      throw error;
    }
  },

  // Chat/Communication Functions
  async addCommunication(
    prospectiveStudentId: string,
    data: {
      message: string;
      type: 'email' | 'phone' | 'in_person';
      direction: 'incoming' | 'outgoing';
    }
  ): Promise<void> {
    try {
      const { error } = await supabase
        .schema(SCHEMA)
        .from(TABLES.ADMISSION_COMMUNICATION)
        .insert({
          id: uuidv4(),
          prospectiveStudentId,
          message: data.message,
          type: data.type,
          direction: data.direction,
          communicationDate: new Date().toISOString(),
          createdAt: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error adding communication:', error);
      throw error;
    }
  },

  async getCommunicationHistory(
    prospectiveStudentId: string,
    params?: {
      startDate?: Date;
      endDate?: Date;
      type?: 'email' | 'phone' | 'in_person';
    }
  ): Promise<AdmissionCommunication[]> {
    try {
      let query = supabase
        .schema(SCHEMA)
        .from(TABLES.ADMISSION_COMMUNICATION)
        .select('*')
        .eq('prospectiveStudentId', prospectiveStudentId)
        .order('communicationDate', { ascending: false });

      if (params?.startDate && params?.endDate) {
        query = query
          .gte('communicationDate', params.startDate.toISOString())
          .lte('communicationDate', params.endDate.toISOString());
      }

      if (params?.type) {
        query = query.eq('type', params.type);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching communication history:', error);
      throw error;
    }
  }
};
