import { supabase } from '@/lib/api-client';
import { v4 as uuidv4 } from 'uuid';
import { ID_CARD_TABLE, SCHEMA, STORAGE_BUCKET, CLASS_TABLE } from '@/lib/constants';
import { Database } from '@/types/supabase';
import { IDCardData, IDCardRow, ClassOption, PhotoType } from '@/types/idCard';
import { toast } from 'react-hot-toast';

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

export const idCardService = {
  async checkDuplicateSubmission(data: IDCardData): Promise<boolean> {
    return checkForDuplicateEntry(data);
  },
  
  async checkStorageLimit(): Promise<boolean> {
    return checkStorageUsage();
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
  }
};