/**
 * ID Card Export Script
 *
 * This script exports ID cards with high-quality images to Excel
 * and saves the images separately with proper naming.
 */

import { supabase } from '@/lib/api-client';
import { ID_CARD_TABLE, SCHEMA, CLASS_TABLE, STORAGE_BUCKET } from '@/lib/constants';
import { isSupabaseSignedUrl, isSupabaseStorageUrl, extractFilePathFromUrl } from '@/lib/supabase-helpers';
import { IDCardData } from '@/types/idCard';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';

interface ExportOptions {
  startSerialNumber?: number;
  classId?: string;
  search?: string;
}

interface ClassInfo {
  id: string;
  name: string;
  section: string;
}

/**
 * Main export function
 */
export async function exportIDCardsWithImages(options: ExportOptions = {}): Promise<void> {
  try {
    // Set default options
    const startSerialNumber = options.startSerialNumber || 115601;

    // Show loading message
    console.log('Starting ID card export...');

    // Get class information
    const classMap = await getClassMap();

    // Fetch ID cards
    const idCards = await fetchIDCards(options.classId, options.search);

    if (idCards.length === 0) {
      console.error('No ID cards found with the specified criteria.');
      return;
    }

    console.log(`Found ${idCards.length} ID cards. Processing...`);

    // Create Excel file
    const { excelBlob, imageBlobs } = await createExcelWithImages(
      idCards,
      classMap,
      startSerialNumber
    );

    // Create a zip file containing Excel and images
    const zip = new JSZip();

    // Add Excel file to zip
    zip.file(`ID_Cards_Export_${new Date().toISOString().split('T')[0]}.xlsx`, excelBlob);

    // Create images folder in zip
    const imagesFolder = zip.folder('images');

    // Add images to zip
    for (const [filename, blob] of Object.entries(imageBlobs)) {
      imagesFolder?.file(filename, blob);
    }

    // Generate zip file
    const zipBlob = await zip.generateAsync({ type: 'blob' });

    // Save zip file
    saveAs(zipBlob, `ID_Cards_Export_${new Date().toISOString().split('T')[0]}.zip`);

    console.log('Export completed successfully!');
  } catch (error) {
    console.error('Error exporting ID cards:', error);
    throw error;
  }
}

/**
 * Get class information
 */
async function getClassMap(): Promise<Record<string, { name: string; section: string }>> {
  try {
    const { data, error } = await supabase
      .schema(SCHEMA)
      .from(CLASS_TABLE)
      .select('id, name, section');

    if (error) throw error;

    const classMap: Record<string, { name: string; section: string }> = {};

    for (const cls of data || []) {
      classMap[cls.id] = {
        name: cls.name || 'Unknown',
        section: cls.section || ''
      };
    }

    return classMap;
  } catch (error) {
    console.error('Error fetching class information:', error);
    return {};
  }
}

/**
 * Fetch ID cards from database
 */
async function fetchIDCards(classId?: string, search?: string): Promise<IDCardData[]> {
  try {
    let query = supabase
      .schema(SCHEMA)
      .from(ID_CARD_TABLE)
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
      `);

    // Apply filters if provided
    if (classId) {
      query = query.eq('class_id', classId);
    }

    if (search) {
      query = query.or(
        `student_name.ilike.%${search}%,father_name.ilike.%${search}%,mother_name.ilike.%${search}%,address.ilike.%${search}%`
      );
    }

    const { data, error } = await query;

    if (error) throw error;

    // Map database rows to IDCardData format
    return (data || []).map(row => ({
      id: row.id,
      studentName: row.student_name,
      classId: row.class_id,
      dateOfBirth: row.date_of_birth,
      studentPhoto: row.student_photo_url,
      fatherName: row.father_name,
      motherName: row.mother_name,
      fatherPhoto: row.father_photo_url,
      motherPhoto: row.mother_photo_url,
      fatherMobile: row.father_mobile,
      motherMobile: row.mother_mobile,
      address: row.address,
      createdAt: row.created_at ? new Date(row.created_at) : undefined,
      downloadCount: row.download_count
    }));
  } catch (error) {
    console.error('Error fetching ID cards:', error);
    return [];
  }
}

/**
 * Download an image from a URL
 */
async function downloadImage(url: string): Promise<Blob | null> {
  if (!url || !url.trim()) {
    return null;
  }

  try {
    // Check if this is a Supabase signed URL (works with both cloud and self-hosted)
    if (isSupabaseSignedUrl(url)) {
      // Extract the path from the URL
      const filePath = extractFilePathFromUrl(url, STORAGE_BUCKET);
      if (filePath) {
        // Create a public URL instead
        const { data } = supabase.storage
          .from(STORAGE_BUCKET)
          .getPublicUrl(filePath);

        // Use the public URL instead
        url = data.publicUrl;
      }
    }

    // Now fetch the image with the possibly updated URL
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`Failed to download image: ${url}, Status: ${response.status}`);

      // If we still have issues, try one more approach for Supabase URLs
      if (isSupabaseStorageUrl(url)) {
        // Try to download the image directly using the storage download API
        const filePath = extractFilePathFromUrl(url, STORAGE_BUCKET);
        if (filePath) {
          const { data, error } = await supabase.storage
            .from(STORAGE_BUCKET)
            .download(filePath);

          if (data && !error) {
            return data;
          }
        }
      }

      return null;
    }

    return await response.blob();
  } catch (error) {
    console.error(`Error downloading image ${url}:`, error);
    return null;
  }
}

/**
 * Sanitize a string to be used as a filename
 */
function sanitizeFilename(name: string): string {
  if (!name) {
    return 'unknown';
  }

  // Replace invalid characters with underscores
  const invalidChars = '<>:"/\\|?*';
  let sanitized = name;

  for (const char of invalidChars) {
    sanitized = sanitized.replace(new RegExp('\\' + char, 'g'), '_');
  }

  // Limit length and remove leading/trailing spaces
  return sanitized.trim().substring(0, 50);
}

/**
 * Create Excel file with ID card data and download images
 */
async function createExcelWithImages(
  idCards: IDCardData[],
  classMap: Record<string, { name: string; section: string }>,
  startSerialNumber: number
): Promise<{ excelBlob: Blob; imageBlobs: Record<string, Blob> }> {
  // Create a new workbook
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'School Management System';
  workbook.created = new Date();

  // Add a worksheet
  const worksheet = workbook.addWorksheet('ID Cards');

  // Define headers
  const headers = [
    'Serial No.',
    'Admission No.',
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

  // Add headers to worksheet
  worksheet.addRow(headers);

  // Style the header row
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFD3D3D3' } // Light gray background
  };

  // Set column widths
  const columnWidths = [
    { key: 'A', width: 10 },  // Serial No.
    { key: 'B', width: 15 },  // Admission No.
    { key: 'C', width: 15 },  // Student Photo
    { key: 'D', width: 25 },  // Student Name
    { key: 'E', width: 15 },  // Class
    { key: 'F', width: 15 },  // Date of Birth
    { key: 'G', width: 15 },  // Father Photo
    { key: 'H', width: 25 },  // Father Name
    { key: 'I', width: 15 },  // Father Mobile
    { key: 'J', width: 15 },  // Mother Photo
    { key: 'K', width: 25 },  // Mother Name
    { key: 'L', width: 15 },  // Mother Mobile
    { key: 'M', width: 40 },  // Address
    { key: 'N', width: 15 },  // Created Date
  ];

  columnWidths.forEach(col => {
    worksheet.getColumn(col.key).width = col.width;
  });

  // Process each ID card
  const imageBlobs: Record<string, Blob> = {};

  for (let i = 0; i < idCards.length; i++) {
    const card = idCards[i];
    const rowNum = i + 2; // +2 because row 1 is headers
    const serialNum = startSerialNumber + i;
    const admissionNum = `ADM${serialNum}`;

    // Get class details
    const classInfo = classMap[card.classId] || { name: 'Unknown', section: '' };
    const className = `${classInfo.name} ${classInfo.section}`.trim();

    // Format dates
    const dob = card.dateOfBirth
      ? new Date(card.dateOfBirth).toLocaleDateString('en-IN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        })
      : '';

    const createdAt = card.createdAt
      ? card.createdAt.toLocaleDateString('en-IN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        })
      : '';

    // Create image filenames
    const studentName = sanitizeFilename(card.studentName);
    const fatherName = sanitizeFilename(card.fatherName);
    const motherName = sanitizeFilename(card.motherName);

    const studentImgFilename = `${serialNum}_${studentName}_student.jpg`;
    const fatherImgFilename = `${serialNum}_${studentName}_${fatherName}_father.jpg`;
    const motherImgFilename = `${serialNum}_${studentName}_${motherName}_mother.jpg`;

    // Download images
    if (typeof card.studentPhoto === 'string') {
      const blob = await downloadImage(card.studentPhoto);
      if (blob) {
        imageBlobs[studentImgFilename] = blob;
      }
    }

    if (typeof card.fatherPhoto === 'string') {
      const blob = await downloadImage(card.fatherPhoto);
      if (blob) {
        imageBlobs[fatherImgFilename] = blob;
      }
    }

    if (typeof card.motherPhoto === 'string') {
      const blob = await downloadImage(card.motherPhoto);
      if (blob) {
        imageBlobs[motherImgFilename] = blob;
      }
    }

    // Add data to worksheet
    worksheet.addRow([
      i + 1,  // Serial No.
      admissionNum,  // Admission No.
      studentImgFilename in imageBlobs ? studentImgFilename : 'N/A',  // Student Photo
      card.studentName,  // Student Name
      className,  // Class
      dob,  // Date of Birth
      fatherImgFilename in imageBlobs ? fatherImgFilename : 'N/A',  // Father Photo
      card.fatherName,  // Father Name
      card.fatherMobile,  // Father Mobile
      motherImgFilename in imageBlobs ? motherImgFilename : 'N/A',  // Mother Photo
      card.motherName,  // Mother Name
      card.motherMobile,  // Mother Mobile
      card.address,  // Address
      createdAt  // Created Date
    ]);
  }

  // Add borders to all cells
  worksheet.eachRow({ includeEmpty: true }, row => {
    row.eachCell({ includeEmpty: true }, cell => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });
  });

  // Add auto filter
  worksheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: headers.length }
  };

  // Freeze the header row
  worksheet.views = [
    { state: 'frozen', xSplit: 0, ySplit: 1, activeCell: 'A2' }
  ];

  // Generate Excel file
  const buffer = await workbook.xlsx.writeBuffer();
  const excelBlob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });

  return { excelBlob, imageBlobs };
}

// Export a function to be called from UI
export default exportIDCardsWithImages;
