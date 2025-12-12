import { supabase } from '@/lib/api-client';
import { v4 as uuidv4 } from 'uuid';
import { ID_CARD_TABLE, SCHEMA, STORAGE_BUCKET, CLASS_TABLE } from '@/lib/constants';
import { Database } from '@/types/supabase';
import { IDCardData, IDCardRow, ClassOption, PhotoType } from '@/types/idCard';
import { toast } from 'react-hot-toast';
import jsPDF from 'jspdf';
import ExcelJS from 'exceljs';

// Constants
const FILE_CONFIG = {
  BUCKET: STORAGE_BUCKET,
  MAX_SIZE: 4 * 1024 * 1024, // 4MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/jpg'] as string[],
  TOTAL_STORAGE_LIMIT: 500 * 1024 * 1024 * 1024 // 500GB
};

// Helper Functions
const validateFile = (file: File) => {
  if (!FILE_CONFIG.ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Invalid file type. Please upload a JPG or PNG file.');
  }

  if (file.size > FILE_CONFIG.MAX_SIZE) {
    throw new Error('File size too large. Maximum size is 4MB.');
  }
};
const getPhotoPath = (idCardId: string, photoType: PhotoType) => {
  return `id-cards/${idCardId}/${photoType}`;
};

// Helper function to check for duplicate ID card entries
const checkForDuplicateEntry = async (data: IDCardData): Promise<boolean> => {
  try {
    const { data: existingCards, error } = await supabase
      .schema(SCHEMA)
      .from(`${ID_CARD_TABLE}`)
      .select('id')
      .eq('student_name', data.studentName)
      .eq('class_id', data.classId)
      .eq('father_name', data.fatherName)
      .eq('mother_name', data.motherName);

    if (error) throw error;

    return existingCards && existingCards.length > 0;
  } catch (error) {
    console.error('Error checking for duplicate entries:', error);
    return false; // In case of error, allow submission to proceed
  }
};

// Helper function to check total storage usage
const checkStorageUsage = async (): Promise<boolean> => {
  try {
    // Get all files in the bucket to calculate total size
    const { data, error } = await supabase.storage
      .from(FILE_CONFIG.BUCKET)
      .list();

    if (error) throw error;

    // Calculate total size of all files
    let totalSize = 0;
    if (data && data.length > 0) {
      // Sum up the size of all files
      totalSize = data.reduce((sum, file) => sum + (file.metadata?.size || 0), 0);
    }

    return totalSize < FILE_CONFIG.TOTAL_STORAGE_LIMIT;
  } catch (error) {
    console.error('Error checking storage usage:', error);
    return true; // In case of error, allow submission to proceed
  }
};

export interface IDCardListParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  classId?: string;
}

export interface IDCardListResult {
  idCards: IDCardData[];
  total: number;
  page: number;
  limit: number;
}

export const idCardService = {
  async checkDuplicateSubmission(data: IDCardData): Promise<boolean> {
    return checkForDuplicateEntry(data);
  },

  async checkStorageLimit(): Promise<boolean> {
    return checkStorageUsage();
  },

  /**
   * Export ID cards to Excel format with standard tabular layout
   * @param params Optional filter parameters
   * @returns Promise that resolves with the Excel file as a Blob
   */
  /**
   * Export a single ID card to Excel format
   * @param idCardId ID of the card to export
   * @returns Promise that resolves with the Excel file as a Blob
   */
  async exportSingleIDCardToExcel(idCardId: string): Promise<Blob> {
    try {
      const idCard = await this.getIDCardById(idCardId);

      if (!idCard) {
        throw new Error('ID card not found');
      }

      // Create a new workbook
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'School Management System';
      workbook.created = new Date();

      // Add a worksheet
      const worksheet = workbook.addWorksheet('ID Card Details');

      // Define the headers and data in a two-column format (Field, Value)
      const data = [
        ['Field', 'Value'],
        ['Student Name', idCard.studentName],
        ['Class', `${idCard.className || ''} ${idCard.section || ''}`.trim()],
        ['Date of Birth', idCard.dateOfBirth ? new Date(idCard.dateOfBirth).toLocaleDateString('en-IN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }) : 'Not Available'],
        ['Father Name', idCard.fatherName],
        ['Mother Name', idCard.motherName],
        ['Father Mobile', idCard.fatherMobile],
        ['Mother Mobile', idCard.motherMobile],
        ['Address', idCard.address],
        ['Created Date', idCard.createdAt ? idCard.createdAt.toLocaleDateString('en-IN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }) : ''],
        ['Download Count', idCard.downloadCount || 0]
      ];

      // Add all rows at once
      worksheet.addRows(data);

      // Style the header row
      const headerRow = worksheet.getRow(1);
      headerRow.font = { bold: true };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFD3D3D3' } // Light gray background
      };

      // Style the field names column
      for (let i = 2; i <= data.length; i++) {
        const cell = worksheet.getCell(`A${i}`);
        cell.font = { bold: true };
      }

      // Set column widths
      worksheet.getColumn(1).width = 20; // Field column
      worksheet.getColumn(2).width = 40; // Value column

      // Add borders to all cells
      for (let i = 1; i <= worksheet.rowCount; i++) {
        const row = worksheet.getRow(i);
        row.eachCell({ includeEmpty: true }, cell => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        });
      }

      // Add a second worksheet with tabular format
      const tabularSheet = workbook.addWorksheet('Tabular View');

      // Define the headers
      const headers = [
        'Student Name',
        'Class',
        'Date of Birth',
        'Father Name',
        'Mother Name',
        'Father Mobile',
        'Mother Mobile',
        'Address',
        'Created Date',
        'Download Count'
      ];

      // Add the header row
      tabularSheet.addRow(headers);

      // Style the header row
      const tabularHeaderRow = tabularSheet.getRow(1);
      tabularHeaderRow.font = { bold: true };
      tabularHeaderRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFD3D3D3' } // Light gray background
      };

      // Set column widths
      tabularSheet.columns = [
        { width: 25 }, // Student Name
        { width: 15 }, // Class
        { width: 15 }, // Date of Birth
        { width: 25 }, // Father Name
        { width: 25 }, // Mother Name
        { width: 15 }, // Father Mobile
        { width: 15 }, // Mother Mobile
        { width: 40 }, // Address
        { width: 15 }, // Created Date
        { width: 12 }  // Download Count
      ];

      // Add data row
      tabularSheet.addRow([
        idCard.studentName,
        `${idCard.className || ''} ${idCard.section || ''}`.trim(),
        idCard.dateOfBirth ? new Date(idCard.dateOfBirth).toLocaleDateString('en-IN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }) : '',
        idCard.fatherName,
        idCard.motherName,
        idCard.fatherMobile,
        idCard.motherMobile,
        idCard.address,
        idCard.createdAt ? idCard.createdAt.toLocaleDateString('en-IN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }) : '',
        idCard.downloadCount || 0
      ]);

      // Add borders to all cells
      for (let i = 1; i <= tabularSheet.rowCount; i++) {
        const row = tabularSheet.getRow(i);
        row.eachCell({ includeEmpty: true }, cell => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        });
      }

      // Increment download count
      await this.incrementDownloadCount(idCardId);

      // Generate Excel file
      const buffer = await workbook.xlsx.writeBuffer();

      // Return as blob
      return new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    } catch (error) {
      console.error('Error exporting ID card to Excel:', error);
      throw error;
    }
  },

  /**
   * Export multiple ID cards to Excel format with standard tabular layout including images
   * @param params Optional filter parameters
   * @returns Promise that resolves with the Excel file as a Blob
   */
  async exportIDCardsToExcel(params: IDCardListParams = {}): Promise<Blob> {
    try {
      // Get all ID cards without pagination
      const exportParams: IDCardListParams = {
        ...params,
        page: 1,
        limit: 1000 // Set a high limit to get all records
      };

      const { idCards } = await this.getAllIDCards(exportParams);

      if (idCards.length === 0) {
        throw new Error('No ID cards found to export');
      }

      // Create a new workbook
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'School Management System';
      workbook.created = new Date();

      // Add a worksheet
      const worksheet = workbook.addWorksheet('ID Cards');

      // Define the headers
      const headers = [
        'Student Photo',
        'Student Name',
        'Class',
        'Date of Birth',
        'Father Photo',
        'Father Name',
        'Father Mobile',
        'Mother Photo',
        'Mother Name',
        'Mother Mobile',
        'Address',
        'Created Date',
        'Download Count'
      ];

      // Add the header row
      worksheet.addRow(headers);

      // Style the header row
      const headerRow = worksheet.getRow(1);
      headerRow.font = { bold: true };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFD3D3D3' } // Light gray background
      };

      // Set row height for header
      headerRow.height = 30;

      // Set column widths
      worksheet.columns = [
        { width: 15 }, // Student Photo
        { width: 25 }, // Student Name
        { width: 15 }, // Class
        { width: 15 }, // Date of Birth
        { width: 15 }, // Father Photo
        { width: 25 }, // Father Name
        { width: 15 }, // Father Mobile
        { width: 15 }, // Mother Photo
        { width: 25 }, // Mother Name
        { width: 15 }, // Mother Mobile
        { width: 40 }, // Address
        { width: 15 }, // Created Date
        { width: 12 }  // Download Count
      ];

      // Add data rows with images
      for (let i = 0; i < idCards.length; i++) {
        const idCard = idCards[i];

        // Create a row for data
        const dataRow = worksheet.addRow([
          '', // Placeholder for student photo
          idCard.studentName,
          `${idCard.className || ''} ${idCard.section || ''}`.trim(),
          idCard.dateOfBirth ? new Date(idCard.dateOfBirth).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          }) : '',
          '', // Placeholder for father photo
          idCard.fatherName,
          idCard.fatherMobile,
          '', // Placeholder for mother photo
          idCard.motherName,
          idCard.motherMobile,
          idCard.address,
          idCard.createdAt ? idCard.createdAt.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          }) : '',
          idCard.downloadCount || 0
        ]);

        // Get the actual row number from the worksheet
        const actualRowNumber = dataRow.number;

        // Set row height to accommodate images
        dataRow.height = 75;

        // Load all images for this row first, then add them
        // This ensures images are properly associated with their row
        let studentImageBase64: string | null = null;
        let fatherImageBase64: string | null = null;
        let motherImageBase64: string | null = null;

        // Load student photo
        if (typeof idCard.studentPhoto === 'string' && idCard.studentPhoto) {
          try {
            const img = await this.loadImage(idCard.studentPhoto);
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = 100;
            canvas.height = 120;
            if (ctx) {
              ctx.drawImage(img, 0, 0, 100, 120);
              studentImageBase64 = canvas.toDataURL('image/jpeg').split(',')[1];
            }
          } catch (error) {
            console.error('Error loading student photo:', error);
          }
        }

        // Load father photo
        if (typeof idCard.fatherPhoto === 'string' && idCard.fatherPhoto) {
          try {
            const img = await this.loadImage(idCard.fatherPhoto);
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = 100;
            canvas.height = 120;
            if (ctx) {
              ctx.drawImage(img, 0, 0, 100, 120);
              fatherImageBase64 = canvas.toDataURL('image/jpeg').split(',')[1];
            }
          } catch (error) {
            console.error('Error loading father photo:', error);
          }
        }

        // Load mother photo
        if (typeof idCard.motherPhoto === 'string' && idCard.motherPhoto) {
          try {
            const img = await this.loadImage(idCard.motherPhoto);
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = 100;
            canvas.height = 120;
            if (ctx) {
              ctx.drawImage(img, 0, 0, 100, 120);
              motherImageBase64 = canvas.toDataURL('image/jpeg').split(',')[1];
            }
          } catch (error) {
            console.error('Error loading mother photo:', error);
          }
        }

        // Now add all images for this row using the actual row number
        if (studentImageBase64) {
          const studentPhotoId = workbook.addImage({
            base64: studentImageBase64,
            extension: 'jpeg',
          });
          worksheet.addImage(studentPhotoId, {
            tl: { col: 0, row: actualRowNumber - 1 },
            br: { col: 1, row: actualRowNumber }
          });
        }

        if (fatherImageBase64) {
          const fatherPhotoId = workbook.addImage({
            base64: fatherImageBase64,
            extension: 'jpeg',
          });
          worksheet.addImage(fatherPhotoId, {
            tl: { col: 4, row: actualRowNumber - 1 },
            br: { col: 5, row: actualRowNumber }
          });
        }

        if (motherImageBase64) {
          const motherPhotoId = workbook.addImage({
            base64: motherImageBase64,
            extension: 'jpeg',
          });
          worksheet.addImage(motherPhotoId, {
            tl: { col: 7, row: actualRowNumber - 1 },
            br: { col: 8, row: actualRowNumber }
          });
        }
      }

      // Add borders to all cells
      for (let i = 1; i <= worksheet.rowCount; i++) {
        const row = worksheet.getRow(i);
        row.eachCell({ includeEmpty: true }, cell => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        });
      }

      // Format the date columns
      for (let i = 2; i <= worksheet.rowCount; i++) {
        // Date of Birth column (4)
        const dobCell = worksheet.getCell(`D${i}`);
        if (dobCell.value) {
          dobCell.numFmt = 'dd/mm/yyyy';
        }

        // Created Date column (12)
        const createdDateCell = worksheet.getCell(`L${i}`);
        if (createdDateCell.value) {
          createdDateCell.numFmt = 'dd/mm/yyyy';
        }
      }

      // Add auto filter
      worksheet.autoFilter = {
        from: { row: 1, column: 1 },
        to: { row: 1, column: headers.length }
      };

      // Freeze the header row
      worksheet.views = [
        { state: 'frozen', xSplit: 0, ySplit: 1, activeCell: 'A2' }
      ];

      // Add a summary row at the bottom
      worksheet.addRow([]);
      const summaryRow = worksheet.addRow([
        `Total Records: ${idCards.length}`,
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        ''
      ]);
      summaryRow.font = { bold: true };

      // Generate Excel file
      const buffer = await workbook.xlsx.writeBuffer();

      // Increment download count for all ID cards
      for (const idCard of idCards) {
        if (idCard.id) {
          await this.incrementDownloadCount(idCard.id);
        }
      }

      // Return as blob
      return new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    } catch (error) {
      console.error('Error exporting ID cards to Excel:', error);
      throw error;
    }
  },

  async saveIDCardData(data: IDCardData): Promise<string> {
    try {
      // Check for duplicate submission
      const isDuplicate = await this.checkDuplicateSubmission(data);
      if (isDuplicate) {
        throw new Error('A student with the same name, class, and parents already exists. Please check your information.');
      }

      // Check storage limit
      const hasStorageSpace = await this.checkStorageLimit();
      if (!hasStorageSpace) {
        throw new Error('Storage limit reached. Please contact the administrator.');
      }

      const id = data.id || uuidv4();

      const idCardData = {
        id,
        student_name: data.studentName,
        class_id: data.classId,
        date_of_birth: data.dateOfBirth,
        student_photo_url: typeof data.studentPhoto === 'string' ? data.studentPhoto : '',
        father_name: data.fatherName,
        mother_name: data.motherName,
        father_photo_url: typeof data.fatherPhoto === 'string' ? data.fatherPhoto : '',
        mother_photo_url: typeof data.motherPhoto === 'string' ? data.motherPhoto : '',
        father_mobile: data.fatherMobile,
        mother_mobile: data.motherMobile,
        address: data.address,
        created_at: new Date().toISOString(),
        download_count: data.downloadCount || 0
      };

      const { error } = await supabase
      .schema(SCHEMA)
        .from(`${ID_CARD_TABLE}`)
        .insert([idCardData]);

      if (error) throw error;

      return id;
    } catch (error) {
      console.error('Error saving ID card data:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save ID card data');
      throw error;
    }
  },

  async updateIDCardData(id: string, data: Partial<IDCardData>): Promise<void> {
    try {
      const updateData: Partial<IDCardRow> = {};
      if (data.studentName) updateData.student_name = data.studentName;
      if (data.classId) updateData.class_id = data.classId;
      if (data.dateOfBirth) updateData.date_of_birth = data.dateOfBirth;
      if (typeof data.studentPhoto === 'string') updateData.student_photo_url = data.studentPhoto;
      if (data.fatherName) updateData.father_name = data.fatherName;
      if (data.motherName) updateData.mother_name = data.motherName;
      if (typeof data.fatherPhoto === 'string') updateData.father_photo_url = data.fatherPhoto;
      if (typeof data.motherPhoto === 'string') updateData.mother_photo_url = data.motherPhoto;
      if (data.fatherMobile) updateData.father_mobile = data.fatherMobile;
      if (data.motherMobile) updateData.mother_mobile = data.motherMobile;
      if (data.address) updateData.address = data.address;
      if (data.downloadCount) updateData.download_count = data.downloadCount;
      if (data.downloadCount) updateData.download_count = data.downloadCount;

      const { error } = await supabase
      .schema(SCHEMA)
        .from(`${ID_CARD_TABLE}`)
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating ID card data:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update ID card data');
      throw error;
    }
  },

  async getIDCardById(id: string): Promise<IDCardData | null> {
    try {
      const { data, error } = await supabase
      .schema(SCHEMA)
      .from(`${ID_CARD_TABLE}`)
        .select(`
          id,
          student_name,
          class_id,
          date_of_birth,
          student_photo_url,
          father_name,
          mother_name,
          father_photo_url,
          mother_photo_url,
          father_mobile,
          mother_mobile,
          address,
          created_at,
          download_count
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!data) return null;

      // Get class details
      const { data: classData, error: classError } = await supabase
      .schema(SCHEMA)
      .from(`${CLASS_TABLE}`)
        .select('name, section')
        .eq('id', data.class_id)
        .single();

      if (classError && classError.code !== 'PGRST116') {
        // PGRST116 is "no rows returned" error, which is fine if class doesn't exist
        console.warn('Error fetching class details:', classError);
      }

      return {
        id: data.id,
        studentName: data.student_name,
        classId: data.class_id,
        className: classData?.name,
        section: classData?.section,
        dateOfBirth: data.date_of_birth,
        studentPhoto: data.student_photo_url,
        fatherName: data.father_name,
        motherName: data.mother_name,
        fatherPhoto: data.father_photo_url,
        motherPhoto: data.mother_photo_url,
        fatherMobile: data.father_mobile,
        motherMobile: data.mother_mobile,
        address: data.address,
        createdAt: new Date(data.created_at),
        downloadCount: data.download_count
      };
    } catch (error) {
      console.error('Error fetching ID card:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to fetch ID card');
      throw error;
    }
  },

  async uploadPhoto(file: File, photoType: PhotoType, idCardId: string): Promise<string> {
    try {
      validateFile(file);

      // Check storage limit before uploading
      const hasStorageSpace = await this.checkStorageLimit();
      if (!hasStorageSpace) {
        throw new Error('Storage limit reached. Please contact the administrator.');
      }

      const timestamp = new Date().getTime();
      const fileExtension = file.name.split('.').pop();
      const fileName = `${photoType}_${timestamp}.${fileExtension}`;
      const filePath = `${getPhotoPath(idCardId, photoType)}/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(FILE_CONFIG.BUCKET)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get a signed URL that will work for public access
      const { data } = await supabase.storage
        .from(FILE_CONFIG.BUCKET)
        .createSignedUrl(filePath, 60 * 60 * 24 * 7); // 7 days expiry

      // If signed URL fails, fall back to public URL
      if (!data?.signedUrl) {
        const publicUrlData = supabase.storage
          .from(FILE_CONFIG.BUCKET)
          .getPublicUrl(filePath);

        return publicUrlData.data.publicUrl;
      }

      return data.signedUrl;
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload photo');
      throw error;
    }
  },

  async getClassList(): Promise<ClassOption[]> {
    try {
      const { data, error } = await supabase
      .schema(SCHEMA)
        .from(`${CLASS_TABLE}`)
        .select('id, name, section')
        .order('name', { ascending: true });

      if (error) throw error;

      return data.map(cls => ({
        id: cls.id,
        name: cls.name,
        section: cls.section
      }));
    } catch (error) {
      console.error('Error fetching classes:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to fetch classes');
      throw error;
    }
  },

  async incrementDownloadCount(id: string): Promise<void> {
    try {
      const { data, error: fetchError } = await supabase
      .schema(SCHEMA)
      .from(`${ID_CARD_TABLE}`)
        .select('download_count')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      const { error: updateError } = await supabase
      .schema(SCHEMA)
      .from(`${ID_CARD_TABLE}`)
        .update({ download_count: (data.download_count || 0) + 1 })
        .eq('id', id);

      if (updateError) throw updateError;
    } catch (error) {
      console.error('Error incrementing download count:', error);
      // Don't show toast for this error as it's not critical
    }
  },

  /**
   * Export all ID cards as a PDF with photos
   * @param params Optional filter parameters
   * @returns Promise that resolves when the export is complete
   */
  async exportAllIDCards(params: IDCardListParams = {}): Promise<Blob> {
    try {
      // Get all ID cards without pagination
      const exportParams: IDCardListParams = {
        ...params,
        page: 1,
        limit: 1000 // Set a high limit to get all records
      };

      const { idCards } = await this.getAllIDCards(exportParams);

      if (idCards.length === 0) {
        throw new Error('No ID cards found to export');
      }

      // Create a new PDF document
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // Add title
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(16);
      pdf.text('ID Card Records', 105, 15, { align: 'center' });

      // Add date
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 22, { align: 'center' });

      // Add horizontal line
      pdf.setDrawColor(0, 0, 0);
      pdf.setLineWidth(0.5);
      pdf.line(15, 25, 195, 25);

      let yPos = 35;
      const pageHeight = pdf.internal.pageSize.height;

      // Process each ID card
      for (let i = 0; i < idCards.length; i++) {
        const idCard = idCards[i];

        // Check if we need a new page
        if (yPos > pageHeight - 60) {
          pdf.addPage();
          yPos = 20;
        }

        // Add student name as header
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(12);
        pdf.text(`${i + 1}. ${idCard.studentName}`, 15, yPos);
        yPos += 7;

        // Add class info
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        pdf.text(`Class: ${idCard.className || ''} ${idCard.section || ''}`, 20, yPos);
        yPos += 5;

        // Add date of birth if available
        if (idCard.dateOfBirth) {
          const dob = new Date(idCard.dateOfBirth).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          });
          pdf.text(`Date of Birth: ${dob}`, 20, yPos);
          yPos += 5;
        }

        // Add parent info
        pdf.text(`Father: ${idCard.fatherName} | Mobile: ${idCard.fatherMobile}`, 20, yPos);
        yPos += 5;
        pdf.text(`Mother: ${idCard.motherName} | Mobile: ${idCard.motherMobile}`, 20, yPos);
        yPos += 5;

        // Add address
        pdf.text(`Address: ${idCard.address}`, 20, yPos);
        yPos += 5;

        // Add photos if available
        const photoStartY = yPos;
        let maxPhotoHeight = 0;

        // Add student photo if available
        if (typeof idCard.studentPhoto === 'string' && idCard.studentPhoto) {
          try {
            const img = await this.loadImage(idCard.studentPhoto);
            const imgWidth = 30;
            const imgHeight = 30 * (img.height / img.width);
            pdf.addImage(img, 'JPEG', 20, yPos, imgWidth, imgHeight);
            maxPhotoHeight = Math.max(maxPhotoHeight, imgHeight);
          } catch (error) {
            console.error('Error loading student photo:', error);
            // Continue without the image
          }
        }

        // Add father photo if available
        if (typeof idCard.fatherPhoto === 'string' && idCard.fatherPhoto) {
          try {
            const img = await this.loadImage(idCard.fatherPhoto);
            const imgWidth = 30;
            const imgHeight = 30 * (img.height / img.width);
            pdf.addImage(img, 'JPEG', 60, yPos, imgWidth, imgHeight);
            maxPhotoHeight = Math.max(maxPhotoHeight, imgHeight);
          } catch (error) {
            console.error('Error loading father photo:', error);
            // Continue without the image
          }
        }

        // Add mother photo if available
        if (typeof idCard.motherPhoto === 'string' && idCard.motherPhoto) {
          try {
            const img = await this.loadImage(idCard.motherPhoto);
            const imgWidth = 30;
            const imgHeight = 30 * (img.height / img.width);
            pdf.addImage(img, 'JPEG', 100, yPos, imgWidth, imgHeight);
            maxPhotoHeight = Math.max(maxPhotoHeight, imgHeight);
          } catch (error) {
            console.error('Error loading mother photo:', error);
            // Continue without the image
          }
        }

        // If no photos were loaded successfully, add a note
        if (maxPhotoHeight === 0) {
          pdf.setFont('helvetica', 'italic');
          pdf.setFontSize(8);
          pdf.text('Photos not available', 20, yPos + 10);
          maxPhotoHeight = 10; // Set a minimum height
        }

        // Update yPos based on photos
        yPos = photoStartY + maxPhotoHeight + 10;

        // Add separator line
        pdf.setDrawColor(200, 200, 200);
        pdf.setLineWidth(0.2);
        pdf.line(15, yPos - 5, 195, yPos - 5);

        // Increment download count for this ID card
        await this.incrementDownloadCount(idCard.id || '');
      }

      // Add footer with count
      pdf.setFont('helvetica', 'italic');
      pdf.setFontSize(10);
      pdf.text(`Total Records: ${idCards.length}`, 105, pdf.internal.pageSize.height - 10, { align: 'center' });

      // Return the PDF as a blob
      return pdf.output('blob');
    } catch (error) {
      console.error('Error exporting ID cards:', error);
      throw error;
    }
  },

  /**
   * Export selected ID cards as a PDF with photos (no images - text only for faster export)
   * @param idCardIds Array of ID card IDs to export
   * @returns Promise that resolves with the PDF blob
   */
  async exportSelectedIDCards(idCardIds: string[]): Promise<Blob> {
    try {
      if (idCardIds.length === 0) {
        throw new Error('No ID cards selected to export');
      }

      // Fetch all selected ID cards
      const idCards: IDCardData[] = [];
      for (const id of idCardIds) {
        const idCard = await this.getIDCardById(id);
        if (idCard) {
          idCards.push(idCard);
        }
      }

      if (idCards.length === 0) {
        throw new Error('No ID cards found to export');
      }

      // Create a new PDF document
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // Add title
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(16);
      pdf.text('Selected ID Card Records', 105, 15, { align: 'center' });

      // Add date
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 22, { align: 'center' });
      pdf.text(`Total Selected: ${idCards.length}`, 105, 28, { align: 'center' });

      // Add horizontal line
      pdf.setDrawColor(0, 0, 0);
      pdf.setLineWidth(0.5);
      pdf.line(15, 32, 195, 32);

      let yPos = 42;
      const pageHeight = pdf.internal.pageSize.height;

      // Process each ID card with photos
      for (let i = 0; i < idCards.length; i++) {
        const idCard = idCards[i];

        // Check if we need a new page (need more space for photos)
        if (yPos > pageHeight - 80) {
          pdf.addPage();
          yPos = 20;
        }

        // Add student name as header with background
        pdf.setFillColor(240, 240, 240);
        pdf.rect(15, yPos - 5, 180, 8, 'F');
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(12);
        pdf.text(`${i + 1}. ${idCard.studentName}`, 18, yPos);
        yPos += 10;

        // Add details in a structured format
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);

        // Class and DOB on same line
        const classText = `Class: ${idCard.className || ''} ${idCard.section || ''}`.trim();
        const dobText = idCard.dateOfBirth 
          ? `DOB: ${new Date(idCard.dateOfBirth).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            })}`
          : '';
        pdf.text(classText, 20, yPos);
        if (dobText) {
          pdf.text(dobText, 100, yPos);
        }
        yPos += 6;

        // Father info
        pdf.setFont('helvetica', 'bold');
        pdf.text('Father:', 20, yPos);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`${idCard.fatherName} | Mobile: ${idCard.fatherMobile}`, 40, yPos);
        yPos += 6;

        // Mother info
        pdf.setFont('helvetica', 'bold');
        pdf.text('Mother:', 20, yPos);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`${idCard.motherName} | Mobile: ${idCard.motherMobile}`, 40, yPos);
        yPos += 6;

        // Address
        pdf.setFont('helvetica', 'bold');
        pdf.text('Address:', 20, yPos);
        pdf.setFont('helvetica', 'normal');
        const addressLines = pdf.splitTextToSize(idCard.address || 'N/A', 140);
        pdf.text(addressLines, 45, yPos);
        yPos += (addressLines.length * 5) + 5;

        // Add photos section
        const photoStartY = yPos;
        let maxPhotoHeight = 0;

        // Add student photo if available
        if (typeof idCard.studentPhoto === 'string' && idCard.studentPhoto) {
          try {
            const img = await this.loadImage(idCard.studentPhoto);
            const imgWidth = 25;
            const imgHeight = 25 * (img.height / img.width);
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(8);
            pdf.text('Student', 20, yPos);
            pdf.addImage(img, 'JPEG', 20, yPos + 2, imgWidth, imgHeight);
            maxPhotoHeight = Math.max(maxPhotoHeight, imgHeight + 5);
          } catch (error) {
            console.error('Error loading student photo:', error);
          }
        }

        // Add father photo if available
        if (typeof idCard.fatherPhoto === 'string' && idCard.fatherPhoto) {
          try {
            const img = await this.loadImage(idCard.fatherPhoto);
            const imgWidth = 25;
            const imgHeight = 25 * (img.height / img.width);
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(8);
            pdf.text('Father', 55, yPos);
            pdf.addImage(img, 'JPEG', 55, yPos + 2, imgWidth, imgHeight);
            maxPhotoHeight = Math.max(maxPhotoHeight, imgHeight + 5);
          } catch (error) {
            console.error('Error loading father photo:', error);
          }
        }

        // Add mother photo if available
        if (typeof idCard.motherPhoto === 'string' && idCard.motherPhoto) {
          try {
            const img = await this.loadImage(idCard.motherPhoto);
            const imgWidth = 25;
            const imgHeight = 25 * (img.height / img.width);
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(8);
            pdf.text('Mother', 90, yPos);
            pdf.addImage(img, 'JPEG', 90, yPos + 2, imgWidth, imgHeight);
            maxPhotoHeight = Math.max(maxPhotoHeight, imgHeight + 5);
          } catch (error) {
            console.error('Error loading mother photo:', error);
          }
        }

        // Update yPos based on photos
        if (maxPhotoHeight > 0) {
          yPos = photoStartY + maxPhotoHeight + 10;
        } else {
          yPos += 5;
        }

        // Add separator line
        pdf.setDrawColor(200, 200, 200);
        pdf.setLineWidth(0.2);
        pdf.line(15, yPos, 195, yPos);
        yPos += 8;

        // Increment download count for this ID card
        await this.incrementDownloadCount(idCard.id || '');
      }

      // Add footer with count
      pdf.setFont('helvetica', 'italic');
      pdf.setFontSize(10);
      pdf.text(`Total Records: ${idCards.length}`, 105, pdf.internal.pageSize.height - 10, { align: 'center' });

      // Return the PDF as a blob
      return pdf.output('blob');
    } catch (error) {
      console.error('Error exporting selected ID cards:', error);
      throw error;
    }
  },

  /**
   * Export selected ID cards to Excel format with photos
   * @param idCardIds Array of ID card IDs to export
   * @returns Promise that resolves with the Excel file as a Blob
   */
  async exportSelectedIDCardsToExcel(idCardIds: string[]): Promise<Blob> {
    try {
      if (idCardIds.length === 0) {
        throw new Error('No ID cards selected to export');
      }

      // Fetch all selected ID cards
      const idCards: IDCardData[] = [];
      for (const id of idCardIds) {
        const idCard = await this.getIDCardById(id);
        if (idCard) {
          idCards.push(idCard);
        }
      }

      if (idCards.length === 0) {
        throw new Error('No ID cards found to export');
      }

      // Create a new workbook
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'School Management System';
      workbook.created = new Date();

      // Add a worksheet
      const worksheet = workbook.addWorksheet('Selected ID Cards');

      // Define the headers (with photo columns)
      const headers = [
        'S.No',
        'Student Photo',
        'Student Name',
        'Class',
        'Date of Birth',
        'Father Photo',
        'Father Name',
        'Father Mobile',
        'Mother Photo',
        'Mother Name',
        'Mother Mobile',
        'Address',
        'Created Date'
      ];

      // Add the header row
      worksheet.addRow(headers);

      // Style the header row
      const headerRow = worksheet.getRow(1);
      headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' } // Blue background
      };
      headerRow.height = 30;
      headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

      // Set column widths
      worksheet.columns = [
        { width: 8 },   // S.No
        { width: 15 },  // Student Photo
        { width: 25 },  // Student Name
        { width: 15 },  // Class
        { width: 15 },  // Date of Birth
        { width: 15 },  // Father Photo
        { width: 25 },  // Father Name
        { width: 15 },  // Father Mobile
        { width: 15 },  // Mother Photo
        { width: 25 },  // Mother Name
        { width: 15 },  // Mother Mobile
        { width: 40 },  // Address
        { width: 15 }   // Created Date
      ];

      // Add data rows with images
      for (let i = 0; i < idCards.length; i++) {
        const idCard = idCards[i];

        const dataRow = worksheet.addRow([
          i + 1,
          '', // Placeholder for student photo
          idCard.studentName,
          `${idCard.className || ''} ${idCard.section || ''}`.trim(),
          idCard.dateOfBirth ? new Date(idCard.dateOfBirth).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          }) : '',
          '', // Placeholder for father photo
          idCard.fatherName,
          idCard.fatherMobile,
          '', // Placeholder for mother photo
          idCard.motherName,
          idCard.motherMobile,
          idCard.address,
          idCard.createdAt ? idCard.createdAt.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          }) : ''
        ]);

        // Get the actual row number from the worksheet
        const actualRowNumber = dataRow.number;

        // Set row height to accommodate images
        dataRow.height = 75;

        // Alternate row colors
        if (i % 2 === 1) {
          dataRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF2F2F2' } // Light gray
          };
        }

        // Load all images for this row first, then add them
        // This ensures images are properly associated with their row
        let studentImageBase64: string | null = null;
        let fatherImageBase64: string | null = null;
        let motherImageBase64: string | null = null;

        // Load student photo
        if (typeof idCard.studentPhoto === 'string' && idCard.studentPhoto) {
          try {
            const img = await this.loadImage(idCard.studentPhoto);
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = 100;
            canvas.height = 120;
            if (ctx) {
              ctx.drawImage(img, 0, 0, 100, 120);
              studentImageBase64 = canvas.toDataURL('image/jpeg').split(',')[1];
            }
          } catch (error) {
            console.error('Error loading student photo:', error);
          }
        }

        // Load father photo
        if (typeof idCard.fatherPhoto === 'string' && idCard.fatherPhoto) {
          try {
            const img = await this.loadImage(idCard.fatherPhoto);
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = 100;
            canvas.height = 120;
            if (ctx) {
              ctx.drawImage(img, 0, 0, 100, 120);
              fatherImageBase64 = canvas.toDataURL('image/jpeg').split(',')[1];
            }
          } catch (error) {
            console.error('Error loading father photo:', error);
          }
        }

        // Load mother photo
        if (typeof idCard.motherPhoto === 'string' && idCard.motherPhoto) {
          try {
            const img = await this.loadImage(idCard.motherPhoto);
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = 100;
            canvas.height = 120;
            if (ctx) {
              ctx.drawImage(img, 0, 0, 100, 120);
              motherImageBase64 = canvas.toDataURL('image/jpeg').split(',')[1];
            }
          } catch (error) {
            console.error('Error loading mother photo:', error);
          }
        }

        // Now add all images for this row using the actual row number
        if (studentImageBase64) {
          const studentPhotoId = workbook.addImage({
            base64: studentImageBase64,
            extension: 'jpeg',
          });
          worksheet.addImage(studentPhotoId, {
            tl: { col: 1, row: actualRowNumber - 1 },
            br: { col: 2, row: actualRowNumber }
          });
        }

        if (fatherImageBase64) {
          const fatherPhotoId = workbook.addImage({
            base64: fatherImageBase64,
            extension: 'jpeg',
          });
          worksheet.addImage(fatherPhotoId, {
            tl: { col: 5, row: actualRowNumber - 1 },
            br: { col: 6, row: actualRowNumber }
          });
        }

        if (motherImageBase64) {
          const motherPhotoId = workbook.addImage({
            base64: motherImageBase64,
            extension: 'jpeg',
          });
          worksheet.addImage(motherPhotoId, {
            tl: { col: 8, row: actualRowNumber - 1 },
            br: { col: 9, row: actualRowNumber }
          });
        }

        // Increment download count
        await this.incrementDownloadCount(idCard.id || '');
      }

      // Add borders to all cells
      for (let i = 1; i <= worksheet.rowCount; i++) {
        const row = worksheet.getRow(i);
        row.eachCell({ includeEmpty: true }, cell => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        });
      }

      // Add auto filter
      worksheet.autoFilter = {
        from: { row: 1, column: 1 },
        to: { row: 1, column: headers.length }
      };

      // Freeze the header row
      worksheet.views = [
        { state: 'frozen', xSplit: 0, ySplit: 1, activeCell: 'A2' }
      ];

      // Add a summary row
      const summaryRowIndex = worksheet.rowCount + 2;
      worksheet.getCell(`A${summaryRowIndex}`).value = `Total Selected Records: ${idCards.length}`;
      worksheet.getCell(`A${summaryRowIndex}`).font = { bold: true };
      worksheet.mergeCells(`A${summaryRowIndex}:C${summaryRowIndex}`);

      worksheet.getCell(`D${summaryRowIndex}`).value = `Generated on: ${new Date().toLocaleDateString()}`;
      worksheet.mergeCells(`D${summaryRowIndex}:F${summaryRowIndex}`);

      // Generate buffer and return as blob
      const buffer = await workbook.xlsx.writeBuffer();
      return new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    } catch (error) {
      console.error('Error exporting selected ID cards to Excel:', error);
      throw error;
    }
  },

  /**
   * Helper function to load an image from URL
   * @param url Image URL
   * @returns Promise that resolves with the image data
   */
  async loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      // Create a placeholder image in case of error
      const createPlaceholder = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 100;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Fill with light gray
          ctx.fillStyle = '#f0f0f0';
          ctx.fillRect(0, 0, 100, 100);

          // Add text
          ctx.fillStyle = '#999999';
          ctx.font = '14px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('No Photo', 50, 50);
        }

        const placeholderImg = new Image();
        placeholderImg.src = canvas.toDataURL();
        placeholderImg.onload = () => resolve(placeholderImg);
      };

      // Try to load the actual image
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => {
        // On error, create and return a placeholder image
        createPlaceholder();
      };

      // Handle Supabase signed URLs by trying to get a public URL
      if (url.includes('supabase.co/storage/v1/object/sign')) {
        // Extract the path from the URL
        const pathMatch = url.match(/\/File\/(.+?)\?/);
        if (pathMatch && pathMatch[1]) {
          const filePath = pathMatch[1];
          // Create a public URL instead
          const publicUrlData = supabase.storage
            .from(FILE_CONFIG.BUCKET)
            .getPublicUrl(filePath);

          img.src = publicUrlData.data.publicUrl;
        } else {
          // If we can't extract the path, use the original URL
          img.src = url;
        }
      } else {
        img.src = url;
      }
    });
  },

  async deleteIDCard(id: string): Promise<void> {
    try {
      // First, get the ID card to check if it exists and get photo URLs
      const { data, error: fetchError } = await supabase
        .schema(SCHEMA)
        .from(`${ID_CARD_TABLE}`)
        .select('student_photo_url, father_photo_url, mother_photo_url')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;
      if (!data) throw new Error('ID card not found');

      // Delete the ID card record
      const { error: deleteError } = await supabase
        .schema(SCHEMA)
        .from(`${ID_CARD_TABLE}`)
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      // Try to delete photos from storage if they exist
      // Note: We don't throw errors for storage deletion failures
      // as the database record is already deleted
      try {
        const photoUrls = [
          data.student_photo_url,
          data.father_photo_url,
          data.mother_photo_url
        ].filter(Boolean);

        for (const url of photoUrls) {
          if (typeof url === 'string' && url.includes(FILE_CONFIG.BUCKET)) {
            // Extract the path from the URL
            const path = url.split(`${FILE_CONFIG.BUCKET}/`)[1]?.split('?')[0];
            if (path) {
              await supabase.storage
                .from(FILE_CONFIG.BUCKET)
                .remove([path]);
            }
          }
        }
      } catch (storageError) {
        console.error('Error deleting photo files:', storageError);
        // We don't throw here as the database record is already deleted
      }

      toast.success('ID card deleted successfully');
    } catch (error) {
      console.error('Error deleting ID card:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete ID card');
      throw error;
    }
  },

  async getAllIDCards(params: IDCardListParams = {}): Promise<IDCardListResult> {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'created_at',
        sortOrder = 'desc',
        search = '',
        classId = ''
      } = params;

      // Calculate offset for pagination
      const offset = (page - 1) * limit;

      // Start building the query
      let query = supabase
        .schema(SCHEMA)
        .from(`${ID_CARD_TABLE}`)
        .select(`
          id,
          student_name,
          class_id,
          date_of_birth,
          student_photo_url,
          father_name,
          mother_name,
          father_photo_url,
          mother_photo_url,
          father_mobile,
          mother_mobile,
          address,
          created_at,
          download_count
        `, { count: 'exact' });

      // Add search filter if provided
      if (search) {
        query = query.or(
          `student_name.ilike.%${search}%,father_name.ilike.%${search}%,mother_name.ilike.%${search}%,address.ilike.%${search}%`
        );
      }

      // Add class filter if provided
      if (classId) {
        query = query.eq('class_id', classId);
      }

      // Add sorting
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      // Add pagination
      query = query.range(offset, offset + limit - 1);

      // Execute the query
      const { data, error, count } = await query;

      if (error) throw error;

      // Get class details for all ID cards
      const classIds = data.map(card => card.class_id).filter(Boolean);
      let classMap: Record<string, { name: string; section: string }> = {};

      if (classIds.length > 0) {
        const { data: classData, error: classError } = await supabase
          .schema(SCHEMA)
          .from(`${CLASS_TABLE}`)
          .select('id, name, section')
          .in('id', classIds);

        if (!classError && classData) {
          classMap = classData.reduce((acc, cls) => {
            acc[cls.id] = { name: cls.name, section: cls.section };
            return acc;
          }, {} as Record<string, { name: string; section: string }>);
        }
      }

      // Map the data to IDCardData format
      const idCards = data.map(card => {
        const classInfo = classMap[card.class_id] || { name: 'Unknown', section: '' };

        return {
          id: card.id,
          studentName: card.student_name,
          classId: card.class_id,
          className: classInfo.name,
          section: classInfo.section,
          dateOfBirth: card.date_of_birth,
          studentPhoto: card.student_photo_url,
          fatherName: card.father_name,
          motherName: card.mother_name,
          fatherPhoto: card.father_photo_url,
          motherPhoto: card.mother_photo_url,
          fatherMobile: card.father_mobile,
          motherMobile: card.mother_mobile,
          address: card.address,
          createdAt: new Date(card.created_at),
          downloadCount: card.download_count
        } as IDCardData;
      });

      return {
        idCards,
        total: count || 0,
        page,
        limit
      };
    } catch (error) {
      console.error('Error fetching ID cards:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to fetch ID cards');
      throw error;
    }
  }
};