import { supabase } from '@/lib/api-client';
import { SCHEMA } from '@/lib/constants';
import {
  ParentFeedback,
  ParentFeedbackFormData,
  FeedbackSearchParams,
  FeedbackCertificate,
  CertificateData
} from '@/types/parentFeedback';
import { v4 as uuidv4 } from 'uuid';
import jsPDF from 'jspdf';
import { SCHOOL_INFO } from '@/lib/constants';
import { fileService } from './fileService';
import { studentService } from './student.service';

// Constants
const PARENT_FEEDBACK_TABLE = 'ParentFeedback';
const FEEDBACK_CERTIFICATE_TABLE = 'FeedbackCertificate';
const CLASS_TABLE = 'Class';
const ID_CARD_TABLE = 'IDCard';
const FILE_BUCKET = 'File';

export const parentFeedbackService = {
  /**
   * Convert a signed URL to a public URL to avoid JWT expiration issues
   * @param url URL to convert
   * @returns Public URL or original URL if conversion fails
   */
  convertToPublicUrl(url: string | null): string | null {
    if (!url) return null;

    try {
      // If it's already a public URL, return it as is
      if (url.includes('/storage/v1/object/public/')) {
        return url;
      }

      // If it's a signed URL, extract the path and create a public URL
      if (url.includes('supabase.co/storage/v1/object/sign')) {
        // Extract the path from the URL
        const pathMatch = url.match(/\/File\/(.+?)\?/);
        if (pathMatch && pathMatch[1]) {
          const filePath = pathMatch[1];
          // Create a public URL instead
          const publicUrl = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/${FILE_BUCKET}/${filePath}`;
          return publicUrl;
        }
      }

      // If it's a relative path, convert to absolute public URL
      if (!url.startsWith('http')) {
        return `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/${FILE_BUCKET}/${url}`;
      }

      // Return the original URL if we couldn't convert it
      return url;
    } catch (error) {
      console.error('Error converting URL:', error);
      return url;
    }
  },
  /**
   * Create a new parent feedback entry
   * @param data Feedback form data
   * @returns Created feedback
   */
  async createFeedback(data: ParentFeedbackFormData): Promise<ParentFeedback> {
    try {
      const id = uuidv4();
      const now = new Date().toISOString();

      // Get current user ID for created_by field
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;

      const feedbackData = {
        id,
        class_id: data.class_id,
        student_name: data.student_name,
        month: data.month,
        good_things: data.good_things,
        need_to_improve: data.need_to_improve,
        best_can_do: data.best_can_do,
        attendance_percentage: data.attendance_percentage,
        student_photo_url: data.student_photo_url || '',
        created_at: now,
        updated_at: now,
        created_by: userId
      };

      const { data: result, error } = await supabase
        .schema(SCHEMA)
        .from(PARENT_FEEDBACK_TABLE)
        .insert([feedbackData])
        .select()
        .single();

      if (error) {
        console.error('Supabase query error:', error);
        throw new Error(`Error creating feedback: ${error.message}`);
      }

      return result as ParentFeedback;
    } catch (error) {
      console.error('Error creating feedback:', error);
      throw error;
    }
  },

  /**
   * Update an existing parent feedback entry
   * @param id Feedback ID
   * @param data Updated feedback data
   * @returns Updated feedback
   */
  async updateFeedback(id: string, data: Partial<ParentFeedbackFormData>): Promise<ParentFeedback> {
    try {
      const now = new Date().toISOString();

      const { data: result, error } = await supabase
        .schema(SCHEMA)
        .from(PARENT_FEEDBACK_TABLE)
        .update({
          ...data,
          updated_at: now
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Supabase query error:', error);
        throw new Error(`Error updating feedback: ${error.message}`);
      }

      return result as ParentFeedback;
    } catch (error) {
      console.error('Error updating feedback:', error);
      throw error;
    }
  },

  /**
   * Delete a parent feedback entry
   * @param id Feedback ID
   */
  async deleteFeedback(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .schema(SCHEMA)
        .from(PARENT_FEEDBACK_TABLE)
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Supabase query error:', error);
        throw new Error(`Error deleting feedback: ${error.message}`);
      }
    } catch (error) {
      console.error('Error deleting feedback:', error);
      throw error;
    }
  },

  /**
   * Get a parent feedback entry by ID
   * @param id Feedback ID
   * @returns Feedback entry
   */
  async getFeedbackById(id: string): Promise<ParentFeedback | null> {
    try {
      console.log(`Fetching feedback with ID: ${id}`);

      // Get the feedback entry using Supabase client with schema parameter
      const { data, error } = await supabase
        .schema(SCHEMA)
        .from(PARENT_FEEDBACK_TABLE)
        .select(`
          *,
          Class:class_id (
            id,
            name,
            section
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Supabase query error:', error);
        throw new Error(`Error fetching feedback: ${error.message}`);
      }

      if (!data) {
        console.log(`No feedback found with ID: ${id}`);
        return null;
      }

      // Process the result to add className and classSection and convert URLs to public URLs
      const result = {
        ...data,
        className: data.Class?.name || 'Unknown',
        classSection: data.Class?.section || '',
        // Remove the Class object to avoid duplication
        Class: undefined,
        // Convert all photo URLs to public URLs to avoid JWT expiration issues
        student_photo_url: this.convertToPublicUrl(data.student_photo_url),
        father_photo_url: this.convertToPublicUrl(data.father_photo_url),
        mother_photo_url: this.convertToPublicUrl(data.mother_photo_url)
      } as ParentFeedback;

      console.log('Processed feedback with converted URLs:', {
        studentPhotoUrl: result.student_photo_url ? 'Found' : 'Not found',
        fatherPhotoUrl: result.father_photo_url ? 'Found' : 'Not found',
        motherPhotoUrl: result.mother_photo_url ? 'Found' : 'Not found'
      });

      return result;
    } catch (error) {
      console.error('Error fetching feedback:', error);
      throw error;
    }
  },

  /**
   * Get parent feedback entries by search parameters
   * @param params Search parameters
   * @returns Array of feedback entries
   */
  async searchFeedback(params: FeedbackSearchParams): Promise<ParentFeedback[]> {
    try {
      console.log('Searching for feedback with params:', params);

      // Build query using Supabase client with schema parameter
      let query = supabase
        .schema(SCHEMA)
        .from(PARENT_FEEDBACK_TABLE)
        .select(`
          *,
          Class:class_id (
            id,
            name,
            section
          )
        `);

      // Apply filters
      if (params.class_id) {
        query = query.eq('class_id', params.class_id);
      }

      if (params.student_name) {
        // Use exact match for student name instead of partial match
        query = query.eq('student_name', params.student_name);
      }

      if (params.month) {
        query = query.eq('month', params.month);
      }

      // Execute the query
      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase query error:', error);
        throw new Error(`Error fetching feedback: ${error.message}`);
      }

      console.log(`Found ${data?.length || 0} feedback entries`);

      // Process the results to add className and classSection and convert URLs to public URLs
      if (data && data.length > 0) {
        return data.map((feedback: any) => ({
          ...feedback,
          className: feedback.Class?.name || 'Unknown',
          classSection: feedback.Class?.section || '',
          // Remove the Class object to avoid duplication
          Class: undefined,
          // Convert all photo URLs to public URLs to avoid JWT expiration issues
          student_photo_url: this.convertToPublicUrl(feedback.student_photo_url),
          father_photo_url: this.convertToPublicUrl(feedback.father_photo_url),
          mother_photo_url: this.convertToPublicUrl(feedback.mother_photo_url)
        })) as ParentFeedback[];
      }

      return [] as ParentFeedback[];
    } catch (error) {
      console.error('Error searching feedback:', error);
      throw error;
    }
  },

  /**
   * Get all parent feedback entries
   * @returns Array of feedback entries
   */
  async getAllFeedback(): Promise<ParentFeedback[]> {
    try {
      console.log('Fetching all feedback entries');

      // Get all feedback entries using Supabase client
      const { data, error } = await supabase
        .schema(SCHEMA)
        .from(PARENT_FEEDBACK_TABLE)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase query error:', error);
        throw new Error(`Error fetching feedback: ${error.message}`);
      }

      // If we have results, fetch the class details separately for each feedback
      if (data && data.length > 0) {
        console.log(`Found ${data.length} feedback entries`);

        const feedbackWithClassDetails = await Promise.all(
          data.map(async (feedback: any) => {
            try {
              // Get class details using Supabase client
              const { data: classData, error: classError } = await supabase
                .schema(SCHEMA)
                .from(CLASS_TABLE)
                .select('id,name,section')
                .eq('id', feedback.class_id)
                .single();

              if (classError || !classData) {
                console.log(`No class found for ID: ${feedback.class_id}`);
                return {
                  ...feedback,
                  className: 'Unknown',
                  classSection: ''
                };
              }

              return {
                ...feedback,
                className: classData.name,
                classSection: classData.section,
                // Convert all photo URLs to public URLs to avoid JWT expiration issues
                student_photo_url: this.convertToPublicUrl(feedback.student_photo_url),
                father_photo_url: this.convertToPublicUrl(feedback.father_photo_url),
                mother_photo_url: this.convertToPublicUrl(feedback.mother_photo_url)
              };
            } catch (err) {
              console.error('Error fetching class details:', err);
              return {
                ...feedback,
                className: 'Unknown',
                classSection: '',
                // Convert all photo URLs to public URLs to avoid JWT expiration issues
                student_photo_url: this.convertToPublicUrl(feedback.student_photo_url),
                father_photo_url: this.convertToPublicUrl(feedback.father_photo_url),
                mother_photo_url: this.convertToPublicUrl(feedback.mother_photo_url)
              };
            }
          })
        );

        return feedbackWithClassDetails as ParentFeedback[];
      }

      console.log('No feedback entries found');
      return [] as ParentFeedback[];
    } catch (error) {
      console.error('Error fetching all feedback:', error);
      throw error;
    }
  },

  /**
   * Get student and parent photos from ID card
   * @param studentName Student name
   * @param classId Class ID
   * @returns Object containing student, father, and mother photo URLs
   */
  async getPhotosFromIDCard(studentName: string, classId: string): Promise<{
    studentPhotoUrl: string | null;
    fatherPhotoUrl: string | null;
    motherPhotoUrl: string | null;
  }> {
    try {
      console.log(`Fetching photos for student: ${studentName} in class: ${classId}`);

      // Query the IDCard table directly to get photos
      const { data, error } = await supabase
        .schema(SCHEMA)
        .from(ID_CARD_TABLE)
        .select('student_photo_url, father_photo_url, mother_photo_url')
        .eq('class_id', classId)
        .eq('student_name', studentName)
        .single();

      if (error) {
        console.error('Error fetching photos from IDCard:', error);
        return {
          studentPhotoUrl: null,
          fatherPhotoUrl: null,
          motherPhotoUrl: null
        };
      }

      if (!data) {
        console.log(`No ID card found for student "${studentName}" in class ${classId}`);
        return {
          studentPhotoUrl: null,
          fatherPhotoUrl: null,
          motherPhotoUrl: null
        };
      }

      // Process photo URLs to ensure they're properly formatted
      let studentPhotoUrl = data.student_photo_url;
      let fatherPhotoUrl = data.father_photo_url;
      let motherPhotoUrl = data.mother_photo_url;

      // Convert to public URLs to avoid JWT expiration issues
      if (studentPhotoUrl) {
        // If it's a signed URL, convert to public URL
        if (studentPhotoUrl.includes('supabase.co/storage/v1/object/sign')) {
          // Extract the path from the URL
          const pathMatch = studentPhotoUrl.match(/\/File\/(.+?)\?/);
          if (pathMatch && pathMatch[1]) {
            const filePath = pathMatch[1];
            // Create a public URL instead
            const publicUrlData = supabase.storage
              .from(FILE_BUCKET)
              .getPublicUrl(filePath);
            studentPhotoUrl = publicUrlData.data.publicUrl;
          }
        }
        // If it's a relative path, convert to absolute public URL
        else if (!studentPhotoUrl.startsWith('http')) {
          studentPhotoUrl = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/${FILE_BUCKET}/${studentPhotoUrl}`;
        }
      }

      if (fatherPhotoUrl) {
        // If it's a signed URL, convert to public URL
        if (fatherPhotoUrl.includes('supabase.co/storage/v1/object/sign')) {
          // Extract the path from the URL
          const pathMatch = fatherPhotoUrl.match(/\/File\/(.+?)\?/);
          if (pathMatch && pathMatch[1]) {
            const filePath = pathMatch[1];
            // Create a public URL instead
            const publicUrlData = supabase.storage
              .from(FILE_BUCKET)
              .getPublicUrl(filePath);
            fatherPhotoUrl = publicUrlData.data.publicUrl;
          }
        }
        // If it's a relative path, convert to absolute public URL
        else if (!fatherPhotoUrl.startsWith('http')) {
          fatherPhotoUrl = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/${FILE_BUCKET}/${fatherPhotoUrl}`;
        }
      }

      if (motherPhotoUrl) {
        // If it's a signed URL, convert to public URL
        if (motherPhotoUrl.includes('supabase.co/storage/v1/object/sign')) {
          // Extract the path from the URL
          const pathMatch = motherPhotoUrl.match(/\/File\/(.+?)\?/);
          if (pathMatch && pathMatch[1]) {
            const filePath = pathMatch[1];
            // Create a public URL instead
            const publicUrlData = supabase.storage
              .from(FILE_BUCKET)
              .getPublicUrl(filePath);
            motherPhotoUrl = publicUrlData.data.publicUrl;
          }
        }
        // If it's a relative path, convert to absolute public URL
        else if (!motherPhotoUrl.startsWith('http')) {
          motherPhotoUrl = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/${FILE_BUCKET}/${motherPhotoUrl}`;
        }
      }

      console.log('Retrieved photo URLs:', {
        studentPhotoUrl: studentPhotoUrl ? 'Found' : 'Not found',
        fatherPhotoUrl: fatherPhotoUrl ? 'Found' : 'Not found',
        motherPhotoUrl: motherPhotoUrl ? 'Found' : 'Not found'
      });

      return {
        studentPhotoUrl,
        fatherPhotoUrl,
        motherPhotoUrl
      };
    } catch (error) {
      console.error('Error fetching photos:', error);
      return {
        studentPhotoUrl: null,
        fatherPhotoUrl: null,
        motherPhotoUrl: null
      };
    }
  },

  /**
   * Get student photo from ID card (legacy method for backward compatibility)
   * @param studentName Student name
   * @param classId Class ID
   * @returns Student photo URL or null
   */
  async getStudentPhotoFromIDCard(studentName: string, classId: string): Promise<string | null> {
    const { studentPhotoUrl } = await this.getPhotosFromIDCard(studentName, classId);
    return studentPhotoUrl;
  },

  /**
   * Get students by class for autocomplete
   * @param classId Class ID
   * @returns Array of students with name and photo URL
   */
  async getStudentsByClass(classId: string): Promise<{ id: string; name: string; photo_url: string | null }[]> {
    try {
      console.log(`Fetching students for class ID: ${classId} for autocomplete`);

      // First try to get students from IDCard table which has photos
      const { data: idCardData, error: idCardError } = await supabase
        .schema(SCHEMA)
        .from(ID_CARD_TABLE)
        .select('id, student_name, student_photo_url')
        .eq('class_id', classId);

      if (idCardData && idCardData.length > 0) {
        console.log(`Found ${idCardData.length} students in IDCard table`);

        // Process photo URLs to ensure they're properly formatted
        return idCardData.map(student => {
          // Convert photo URL to public URL to avoid JWT expiration issues
          const photoUrl = this.convertToPublicUrl(student.student_photo_url);

          return {
            id: student.id,
            name: student.student_name,
            photo_url: photoUrl
          };
        });
      }

      // If no data in IDCard, fall back to studentService
      console.log('No students found in IDCard table, falling back to studentService');
      const students = await studentService.getStudentsByClass(classId);

      if (students && students.length > 0) {
        console.log(`Found ${students.length} students using studentService`);
        return students.map((student: any) => ({
          id: student.id,
          name: student.name,
          photo_url: null // studentService doesn't provide photos
        }));
      }

      console.log('No students found for this class');
      return [];
    } catch (error) {
      console.error('Error fetching students by class:', error);
      return [];
    }
  },

  /**
   * Get certificate by feedback ID
   * @param feedbackId Feedback ID
   * @returns Certificate data or null
   */
  async getCertificateByFeedbackId(feedbackId: string): Promise<FeedbackCertificate | null> {
    try {
      const { data, error } = await supabase
        .schema(SCHEMA)
        .from(FEEDBACK_CERTIFICATE_TABLE)
        .select('*')
        .eq('feedback_id', feedbackId)
        .single();

      if (error) {
        console.error('Supabase query error:', error);
        return null;
      }

      if (!data) {
        console.log(`No certificate found for feedback ID: ${feedbackId}`);
        return null;
      }

      return data as FeedbackCertificate;
    } catch (error) {
      console.error('Error fetching certificate:', error);
      return null;
    }
  },

  /**
   * Generate a certificate for a feedback
   * @param feedbackId Feedback ID
   * @returns Certificate data
   */
  async generateCertificate(feedbackId: string): Promise<FeedbackCertificate> {
    try {
      // Get feedback data
      const feedback = await this.getFeedbackById(feedbackId);
      if (!feedback) {
        throw new Error('Feedback not found');
      }

      // Check if certificate already exists
      const existingCertificate = await this.getCertificateByFeedbackId(feedbackId);
      if (existingCertificate) {
        return existingCertificate;
      }

      // Try to get parent photos if not already in the feedback
      if (!feedback.father_photo_url || !feedback.mother_photo_url) {
        try {
          const { fatherPhotoUrl, motherPhotoUrl } = await this.getPhotosFromIDCard(
            feedback.student_name,
            feedback.class_id
          );

          if (fatherPhotoUrl) {
            feedback.father_photo_url = fatherPhotoUrl;
          }

          if (motherPhotoUrl) {
            feedback.mother_photo_url = motherPhotoUrl;
          }
        } catch (photoError) {
          console.error('Error fetching parent photos:', photoError);
          // Continue without parent photos if there's an error
        }
      }

      // Prepare certificate data with public URLs
      const certificateData: CertificateData = {
        studentName: feedback.student_name,
        className: feedback.className || '',
        classSection: feedback.classSection,
        month: feedback.month,
        goodThings: feedback.good_things,
        needToImprove: feedback.need_to_improve,
        bestCanDo: feedback.best_can_do,
        attendancePercentage: feedback.attendance_percentage,
        studentPhotoUrl: this.convertToPublicUrl(feedback.student_photo_url),
        fatherPhotoUrl: this.convertToPublicUrl(feedback.father_photo_url),
        motherPhotoUrl: this.convertToPublicUrl(feedback.mother_photo_url),
        schoolName: SCHOOL_INFO?.name || 'School',
        schoolAddress: SCHOOL_INFO?.address || 'Address',
        date: new Date().toLocaleDateString()
      };

      // Generate PDF certificate
      const certificateUrl = await this.createCertificatePDF(certificateData);

      // Save certificate to database
      const certificateId = uuidv4();
      const now = new Date().toISOString();

      const certificateData2 = {
        id: certificateId,
        feedback_id: feedbackId,
        certificate_url: certificateUrl,
        download_count: 0,
        created_at: now,
        updated_at: now
      };

      const { data: result, error } = await supabase
        .schema(SCHEMA)
        .from(FEEDBACK_CERTIFICATE_TABLE)
        .insert([certificateData2])
        .select()
        .single();

      if (error) {
        console.error('Supabase query error:', error);
        throw new Error(`Error creating certificate: ${error.message}`);
      }

      return result as FeedbackCertificate;
    } catch (error) {
      console.error('Error generating certificate:', error);
      throw error;
    }
  },

  /**
   * Increment certificate download count
   * @param certificateId Certificate ID
   */
  async incrementDownloadCount(certificateId: string): Promise<void> {
    try {
      // First get the current download count
      const { data, error } = await supabase
        .schema(SCHEMA)
        .from(FEEDBACK_CERTIFICATE_TABLE)
        .select('download_count')
        .eq('id', certificateId)
        .single();

      if (error) {
        console.error('Supabase query error:', error);
        throw new Error(`Error fetching certificate: ${error.message}`);
      }

      if (!data) {
        console.log(`No certificate found with ID: ${certificateId}`);
        throw new Error('Certificate not found');
      }

      // Increment the count
      const newCount = (data.download_count || 0) + 1;

      // Update the record
      const { error: updateError } = await supabase
        .schema(SCHEMA)
        .from(FEEDBACK_CERTIFICATE_TABLE)
        .update({
          download_count: newCount,
          updated_at: new Date().toISOString()
        })
        .eq('id', certificateId);

      if (updateError) {
        console.error('Supabase update error:', updateError);
        throw new Error(`Error updating certificate: ${updateError.message}`);
      }
    } catch (error) {
      console.error('Error incrementing download count:', error);
    }
  },

  /**
   * Create a PDF certificate
   * @param data Certificate data
   * @returns Certificate URL
   */
  async createCertificatePDF(data: CertificateData): Promise<string> {
    try {
      // Create a new PDF document
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // Set background color
      pdf.setFillColor(240, 248, 255); // Light blue background
      pdf.rect(0, 0, 210, 297, 'F');

      // Add decorative border
      pdf.setDrawColor(70, 130, 180); // Steel blue
      pdf.setLineWidth(1);
      pdf.rect(10, 10, 190, 277, 'S');

      // Add inner decorative border
      pdf.setDrawColor(100, 149, 237); // Cornflower blue
      pdf.setLineWidth(0.5);
      pdf.rect(15, 15, 180, 267, 'S');

      // Add school header
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(24);
      pdf.setTextColor(25, 25, 112); // Midnight blue
      pdf.text(data.schoolName, 105, 30, { align: 'center' });

      pdf.setFontSize(12);
      pdf.setTextColor(70, 70, 70);
      pdf.text(data.schoolAddress, 105, 38, { align: 'center' });

      // Add certificate title
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(22);
      pdf.setTextColor(25, 25, 112);
      pdf.text('CERTIFICATE OF ACHIEVEMENT', 105, 55, { align: 'center' });

      // Add decorative line under title
      pdf.setDrawColor(70, 130, 180);
      pdf.setLineWidth(1);
      pdf.line(40, 60, 170, 60);

      // Add student information
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(12);
      pdf.setTextColor(0, 0, 0);
      pdf.text('This certificate is presented to:', 105, 75, { align: 'center' });

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(18);
      pdf.setTextColor(25, 25, 112);
      pdf.text(data.studentName, 105, 85, { align: 'center' });

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(12);
      pdf.setTextColor(0, 0, 0);
      pdf.text(`of Class ${data.className} ${data.classSection || ''}`, 105, 95, { align: 'center' });
      pdf.text(`for the month of ${data.month}`, 105, 105, { align: 'center' });

      // Add attendance information
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(14);
      pdf.text('Attendance:', 30, 125);

      // Draw attendance bar
      const barWidth = 100;
      const barHeight = 10;
      const barX = 70;
      const barY = 122;

      // Background bar
      pdf.setFillColor(220, 220, 220);
      pdf.rect(barX, barY, barWidth, barHeight, 'F');

      // Filled portion
      pdf.setFillColor(70, 130, 180);
      pdf.rect(barX, barY, barWidth * (data.attendancePercentage / 100), barHeight, 'F');

      // Add percentage text
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(12);
      pdf.setTextColor(0, 0, 0);
      pdf.text(`${data.attendancePercentage}%`, barX + barWidth + 10, barY + 7);

      // Add feedback sections
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(16);
      pdf.setTextColor(46, 139, 87); // Sea green
      pdf.text('Good Things:', 30, 145);

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(12);
      pdf.setTextColor(0, 0, 0);
      const goodThingsLines = pdf.splitTextToSize(data.goodThings, 150);
      pdf.text(goodThingsLines, 30, 155);

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(16);
      pdf.setTextColor(205, 92, 92); // Indian red
      pdf.text('Areas to Improve:', 30, 185);

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(12);
      pdf.setTextColor(0, 0, 0);
      const improveLines = pdf.splitTextToSize(data.needToImprove, 150);
      pdf.text(improveLines, 30, 195);

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(16);
      pdf.setTextColor(70, 130, 180); // Steel blue
      pdf.text('Best Can Do:', 30, 225);

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(12);
      pdf.setTextColor(0, 0, 0);
      const bestCanDoLines = pdf.splitTextToSize(data.bestCanDo, 150);
      pdf.text(bestCanDoLines, 30, 235);

      // Add date and signature
      pdf.setFont('helvetica', 'italic');
      pdf.setFontSize(12);
      pdf.text(`Date: ${data.date}`, 40, 270);

      pdf.setDrawColor(0, 0, 0);
      pdf.line(130, 270, 170, 270);
      pdf.text('Principal Signature', 150, 275, { align: 'center' });

      // Generate a unique filename
      const timestamp = Date.now();
      const filename = `certificate_${data.studentName.replace(/\s+/g, '_')}_${timestamp}.pdf`;

      // Convert PDF to blob
      const pdfBlob = pdf.output('blob');

      // Create a File object from the blob
      const pdfFile = new File([pdfBlob], filename, { type: 'application/pdf' });

      // Upload the PDF to storage
      const filePath = `certificates/${filename}`;
      const uploadedFile = await fileService.uploadFile(pdfFile, filePath);

      if (!uploadedFile) {
        throw new Error('Failed to upload certificate PDF');
      }

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from(FILE_BUCKET)
        .getPublicUrl(uploadedFile.path);

      return publicUrl;
    } catch (error) {
      console.error('Error creating certificate PDF:', error);
      throw error;
    }
  }
};

export default parentFeedbackService;
