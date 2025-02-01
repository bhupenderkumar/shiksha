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
          .eq('prospectiveStudentId', id)
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
        documentsStatus: processData?.documentsRequired || createInitialDocumentStatus(),
        interviewDate: processData?.interviewDate ? new Date(processData.interviewDate) : undefined,
        assignedClass: processData?.assignedClassId
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
        .select('documentsRequired')
        .eq('prospectiveStudentId', prospectiveStudentId)
        .single();

      if (fetchError) throw fetchError;

      const documentsRequired = admissionProcess.documentsRequired;
      documentsRequired[documentType].submitted.push(filePath);
      documentsRequired[documentType].verificationStatus[filePath] = 'pending';

      const { error: updateError } = await supabase
        .schema(SCHEMA)
        .from(TABLES.ADMISSION_PROCESS)
        .update({ documentsRequired: documentsRequired })
        .eq('prospectiveStudentId', prospectiveStudentId);

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
        .select('documentsRequired')
        .eq('prospectiveStudentId', prospectiveStudentId)
        .single();

      if (fetchError) throw new Error(fetchError.message);

      const currentDoc = admissionProcess.documentsRequired[documentType];
      const documentsRequired = {
        ...admissionProcess.documentsRequired,
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
        .update({ documentsRequired: documentsRequired })
        .eq('prospectiveStudentId', prospectiveStudentId);

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
        .select('documentsRequired')
        .eq('prospectiveStudentId', prospectiveStudentId)
        .single();

      if (error) throw new Error(error.message);
      return data?.documentsRequired || createInitialDocumentStatus();
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
        appliedDate: formatDate(data.appliedDate),
        lastUpdateDate: formatDate(data.lastUpdateDate),
        createdAt: formatDate(data.createdAt),
        updatedAt: formatDate(data.updatedAt),
        dateOfBirth: data.dateOfBirth ? formatDate(data.dateOfBirth) : null
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
        .select(`
          id,
          studentName,
          parentName,
          email,
          contactNumber,
          gradeApplying,
          gender,
          dateOfBirth,
          address,
          status,
          appliedDate,
          lastUpdateDate,
          createdAt,
          updatedAt,
          ${TABLES.ADMISSION_PROCESS} (
            id,
            prospectiveStudentId,
            documentsRequired,
            interviewDate,
            assignedClassId,
            createdAt,
            updatedAt
          )
        `, { count: 'exact' });

      if (params?.dateRange) {
        query = query
          .gte('appliedDate', params.dateRange.start.toISOString())
          .lte('appliedDate', params.dateRange.end.toISOString());
      }

      if (params?.searchTerm) {
        query = query.or(
          `studentName.ilike.%${params.searchTerm}%,` +
          `parentName.ilike.%${params.searchTerm}%,` +
          `email.ilike.%${params.searchTerm}%`
        );
      }

      if (params?.gradeApplying) {
        query = query.eq('gradeApplying', params.gradeApplying);
      }

      const { data, error, count } = await query.order('appliedDate', { ascending: false });

      if (error) throw error;

      return {
        data: data.map(item => ({
          id: item.id,
          studentName: item.studentName,
          parentName: item.parentName,
          email: item.email,
          contactNumber: item.contactNumber,
          gradeApplying: item.gradeApplying,
          gender: item.gender,
          dateOfBirth: item.dateOfBirth ? formatDate(item.dateOfBirth) : null,
          address: item.address,
          status: item.status,
          appliedDate: formatDate(item.appliedDate),
          lastUpdateDate: formatDate(item.lastUpdateDate),
          createdAt: formatDate(item.createdAt),
          updatedAt: formatDate(item.updatedAt),
          AdmissionProcess: item.AdmissionProcess ? {
            id: item.AdmissionProcess.id,
            prospectiveStudentId: item.AdmissionProcess.prospectiveStudentId,
            documentsRequired: item.AdmissionProcess.documentsRequired,
            interviewDate: item.AdmissionProcess.interviewDate,
            assignedClassId: item.AdmissionProcess.assignedClassId,
            createdAt: item.AdmissionProcess.createdAt,
            updatedAt: item.AdmissionProcess.updatedAt
          } : undefined
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
        studentName: data.studentName,
        parentName: data.parentName,
        email: data.email,
        contactNumber: data.contactNumber,
        gradeApplying: data.gradeApplying,
        gender: data.gender,
        dateOfBirth: data.dateOfBirth.toISOString(),
        address: data.address,
        status: ADMISSION_STATUS.NEW,
        appliedDate: new Date().toISOString(),
        lastUpdateDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const { data: result, error } = await supabase
        .schema(SCHEMA)
        .from(TABLES.PROSPECTIVE_STUDENT)
        .insert([enquiry])
        .select()
        .single();

      if (error) throw error;

      await this.initializeAdmissionProcess(result.id);

      return {
        id: result.id,
        studentName: result.studentName,
        parentName: result.parentName,
        email: result.email,
        contactNumber: result.contactNumber,
        gradeApplying: result.gradeApplying,
        gender: result.gender,
        dateOfBirth: formatDate(result.dateOfBirth),
        address: result.address,
        status: result.status,
        appliedDate: formatDate(result.appliedDate),
        lastUpdateDate: formatDate(result.lastUpdateDate)
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
      toast.error(error instanceof Error ? error.message : "Failed to update enquiry");
      throw error;
    }
  },

  async getEnquiryNotes(id: string): Promise<Note[]> {
    try {
      const { data, error } = await supabase
        .schema(SCHEMA)
        .from(TABLES.ADMISSION_NOTES)
        .select(`
          id,
          prospectiveStudentId,
          content,
          created_by,
          createdAt
        `)
        .eq('prospectiveStudentId', id)
        .order('createdAt', { ascending: false });

      if (error) throw error;

      return data.map(note => ({
        id: note.id,
        prospectiveStudentId: note.prospectiveStudentId,
        content: note.content,
        createdBy: note.created_by,
        createdAt: formatDate(note.createdAt)
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
        prospectiveStudentId: prospectiveStudentId,
        content,
        created_by: 'SYSTEM', // TODO: Get from auth context
        createdAt: new Date().toISOString()
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
        prospectiveStudentId: data.prospectiveStudentId,
        content: data.content,
        createdBy: data.created_by,
        createdAt: formatDate(data.createdAt)
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
        prospectiveStudentId: prospectiveStudentId,
        documentsRequired: createInitialDocumentStatus(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
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
        updateData.interviewDate = data.interviewDate.toISOString();
      }
      if (data.assignedClass) {
        updateData.assignedClassId = data.assignedClass;
      }
      if (data.documentsStatus) {
        updateData.documentsRequired = data.documentsStatus;
      }
      
      updateData.updatedAt = new Date().toISOString();

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
        .eq('prospectiveStudentId', id);

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
        .select(`
          id,
          prospectiveStudentId,
          communicationtype,
          notes,
          staffid,
          communicationdate,
          direction,
          createdAt,
          updatedAt
        `)
        .eq('prospectiveStudentId', id)
        .order('communicationdate', { ascending: false });

      if (error) throw error;

      return data.map(comm => ({
        id: comm.id,
        prospectiveStudentId: comm.prospectiveStudentId,
        communicationType: comm.communicationtype,
        notes: comm.notes,
        staffId: comm.staffid,
        communicationDate: formatDate(comm.communicationdate),
        createdAt: formatDate(comm.createdAt),
        updatedAt: formatDate(comm.updatedAt)
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
        prospectiveStudentId: prospectiveStudentId,
        communicationtype: typeMap[data.type],
        notes: data.message + (data.notes ? `\n\nAdditional Notes: ${data.notes}` : ''),
        staffid: data.staffId || 'SYSTEM', // Default to SYSTEM if no staffId provided
        direction: data.direction || 'outgoing', // Default to outgoing if not specified
        communicationdate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
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
        prospectiveStudentId: result.prospectiveStudentId,
        communicationType: result.communicationtype,
        notes: result.notes,
        staffId: result.staffid,
        communicationDate: formatDate(result.communicationdate),
        createdAt: formatDate(result.createdAt),
        updatedAt: formatDate(result.updatedAt)
      };
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add communication");
      throw error;
    }
  }
};
