import { supabase } from '@/lib/api-client';
import { SCHEMA, ID_CARD_TABLE, CLASS_TABLE, STORAGE_BUCKET } from '@/lib/constants';

// Cloud storage URL for images (images are stored on Supabase cloud)
const CLOUD_STORAGE_URL = import.meta.env.VITE_SUPABASE_URL || '';

export interface BirthdayStudent {
  id: string;
  studentName: string;
  dateOfBirth: string;
  classId: string;
  className?: string;
  classSection?: string;
  studentPhotoUrl: string | null;
  fatherName: string;
  motherName: string;
  fatherPhotoUrl: string | null;
  motherPhotoUrl: string | null;
  fatherMobile: string | null;
  motherMobile: string | null;
  address: string | null;
  age: number;
  birthdayDate: Date;
  isBirthdayToday: boolean;
  daysUntilBirthday: number;
}

export interface BirthdayWish {
  id: string;
  studentId: string;
  wisherName: string;
  message: string;
  createdAt: string;
}

// Helper function to calculate age from date of birth
const calculateAge = (dateOfBirth: string): number => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

// Helper function to calculate days until birthday
const getDaysUntilBirthday = (dateOfBirth: string): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const birthDate = new Date(dateOfBirth);
  const nextBirthday = new Date(
    today.getFullYear(),
    birthDate.getMonth(),
    birthDate.getDate()
  );
  
  // If birthday has passed this year, use next year
  if (nextBirthday < today) {
    nextBirthday.setFullYear(nextBirthday.getFullYear() + 1);
  }
  
  const diffTime = nextBirthday.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

// Helper function to check if birthday is today
const isBirthdayToday = (dateOfBirth: string): boolean => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  
  return (
    today.getMonth() === birthDate.getMonth() &&
    today.getDate() === birthDate.getDate()
  );
};

// Helper function to get public URL for an image
const getImageUrl = (storagePath: string | null): string | null => {
  if (!storagePath) return null;
  
  try {
    let pathToUse = storagePath;
    
    // If this is a signed URL (from old Supabase cloud), extract the actual path
    if (storagePath.includes('supabase.co/storage/v1/object/sign/')) {
      // Extract path from signed URL: /storage/v1/object/sign/{bucket}/{path}?token=...
      // The URL format is: https://xxx.supabase.co/storage/v1/object/sign/File/id-cards/...?token=...
      const urlParts = storagePath.split('/storage/v1/object/sign/');
      if (urlParts.length > 1) {
        // Get everything after 'sign/' and before '?'
        const pathWithBucket = urlParts[1].split('?')[0];
        // Remove the bucket name (File/) from the beginning
        const bucketPrefix = STORAGE_BUCKET + '/';
        if (pathWithBucket.startsWith(bucketPrefix)) {
          pathToUse = pathWithBucket.substring(bucketPrefix.length);
        } else {
          pathToUse = pathWithBucket;
        }
      }
    } else if (storagePath.startsWith('http://') || storagePath.startsWith('https://')) {
      // If it's some other URL format, try to extract path or return as-is
      // Check if it's already a public URL format
      if (storagePath.includes('/storage/v1/object/public/')) {
        return storagePath; // Already a public URL, return as-is
      }
      // Otherwise try to extract the path
      const match = storagePath.match(/\/storage\/v1\/object\/(?:public|sign)\/[^/]+\/(.+?)(?:\?|$)/);
      if (match) {
        pathToUse = match[1];
      } else {
        return storagePath; // Can't parse, return as-is
      }
    }
    
    // Build public URL using cloud storage (images are stored on Supabase cloud, not local Docker)
    const publicUrl = `${CLOUD_STORAGE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${pathToUse}`;
    return publicUrl;
  } catch (error) {
    console.error('Error getting image URL:', error);
    return null;
  }
};

// Transform database row to BirthdayStudent
const transformToBirthdayStudent = (row: any): BirthdayStudent => {
  const dob = row.date_of_birth;
  
  // Get public URLs for all photos
  const studentPhotoUrl = getImageUrl(row.student_photo_url);
  const fatherPhotoUrl = getImageUrl(row.father_photo_url);
  const motherPhotoUrl = getImageUrl(row.mother_photo_url);
  
  return {
    id: row.id,
    studentName: row.student_name,
    dateOfBirth: dob,
    classId: row.class_id,
    className: row.class?.name || '',
    classSection: row.class?.section || '',
    studentPhotoUrl,
    fatherName: row.father_name,
    motherName: row.mother_name,
    fatherPhotoUrl,
    motherPhotoUrl,
    fatherMobile: row.father_mobile,
    motherMobile: row.mother_mobile,
    address: row.address,
    age: calculateAge(dob),
    birthdayDate: new Date(dob),
    isBirthdayToday: isBirthdayToday(dob),
    daysUntilBirthday: getDaysUntilBirthday(dob),
  };
};

export const birthdayService = {
  /**
   * Get all students with their birthday information
   */
  async getAllStudentsWithBirthday(): Promise<BirthdayStudent[]> {
    try {
      const { data, error } = await supabase
        .schema(SCHEMA)
        .from(ID_CARD_TABLE)
        .select(`
          id,
          student_name,
          date_of_birth,
          class_id,
          student_photo_url,
          father_name,
          mother_name,
          father_photo_url,
          mother_photo_url,
          father_mobile,
          mother_mobile,
          address,
          class:${CLASS_TABLE} (
            id,
            name,
            section
          )
        `)
        .not('date_of_birth', 'is', null);

      if (error) throw error;

      // Transform all rows with public URLs
      return (data || []).map(transformToBirthdayStudent);
    } catch (error) {
      console.error('Error fetching students with birthday:', error);
      throw error;
    }
  },

  /**
   * Get students with birthday today
   */
  async getTodaysBirthdays(): Promise<BirthdayStudent[]> {
    try {
      const allStudents = await this.getAllStudentsWithBirthday();
      return allStudents.filter(student => student.isBirthdayToday);
    } catch (error) {
      console.error('Error fetching today\'s birthdays:', error);
      throw error;
    }
  },

  /**
   * Get upcoming birthdays within specified days
   */
  async getUpcomingBirthdays(days: number = 30): Promise<BirthdayStudent[]> {
    try {
      const allStudents = await this.getAllStudentsWithBirthday();
      return allStudents
        .filter(student => student.daysUntilBirthday <= days && student.daysUntilBirthday > 0)
        .sort((a, b) => a.daysUntilBirthday - b.daysUntilBirthday);
    } catch (error) {
      console.error('Error fetching upcoming birthdays:', error);
      throw error;
    }
  },

  /**
   * Get birthdays for a specific month
   */
  async getBirthdaysByMonth(month: number): Promise<BirthdayStudent[]> {
    try {
      const allStudents = await this.getAllStudentsWithBirthday();
      return allStudents
        .filter(student => new Date(student.dateOfBirth).getMonth() === month)
        .sort((a, b) => {
          const dayA = new Date(a.dateOfBirth).getDate();
          const dayB = new Date(b.dateOfBirth).getDate();
          return dayA - dayB;
        });
    } catch (error) {
      console.error('Error fetching birthdays by month:', error);
      throw error;
    }
  },

  /**
   * Get a single student by ID for birthday card
   */
  async getStudentById(studentId: string): Promise<BirthdayStudent | null> {
    try {
      const { data, error } = await supabase
        .schema(SCHEMA)
        .from(ID_CARD_TABLE)
        .select(`
          id,
          student_name,
          date_of_birth,
          class_id,
          student_photo_url,
          father_name,
          mother_name,
          father_photo_url,
          mother_photo_url,
          father_mobile,
          mother_mobile,
          address,
          class:${CLASS_TABLE} (
            id,
            name,
            section
          )
        `)
        .eq('id', studentId)
        .single();

      if (error) throw error;
      if (!data) return null;

      return transformToBirthdayStudent(data);
    } catch (error) {
      console.error('Error fetching student by ID:', error);
      throw error;
    }
  },

  /**
   * Get this week's birthdays (7 days including today)
   */
  async getThisWeeksBirthdays(): Promise<BirthdayStudent[]> {
    try {
      const allStudents = await this.getAllStudentsWithBirthday();
      const todaysBirthdays = allStudents.filter(student => student.isBirthdayToday);
      const upcomingThisWeek = allStudents.filter(
        student => student.daysUntilBirthday > 0 && student.daysUntilBirthday <= 7
      );
      
      return [...todaysBirthdays, ...upcomingThisWeek].sort(
        (a, b) => a.daysUntilBirthday - b.daysUntilBirthday
      );
    } catch (error) {
      console.error('Error fetching this week\'s birthdays:', error);
      throw error;
    }
  },

  /**
   * Search students by name for birthday
   */
  async searchStudentsByName(searchTerm: string): Promise<BirthdayStudent[]> {
    try {
      const { data, error } = await supabase
        .schema(SCHEMA)
        .from(ID_CARD_TABLE)
        .select(`
          id,
          student_name,
          date_of_birth,
          class_id,
          student_photo_url,
          father_name,
          mother_name,
          father_photo_url,
          mother_photo_url,
          father_mobile,
          mother_mobile,
          address,
          class:${CLASS_TABLE} (
            id,
            name,
            section
          )
        `)
        .ilike('student_name', `%${searchTerm}%`)
        .not('date_of_birth', 'is', null);

      if (error) throw error;

      // Transform all rows with public URLs
      return (data || []).map(transformToBirthdayStudent);
    } catch (error) {
      console.error('Error searching students:', error);
      throw error;
    }
  },

  /**
   * Generate a shareable birthday link token
   */
  generateBirthdayToken(studentId: string): string {
    // Create a simple base64 encoded token with studentId and timestamp
    const payload = {
      studentId,
      timestamp: Date.now(),
    };
    return btoa(JSON.stringify(payload));
  },

  /**
   * Decode birthday token
   */
  decodeBirthdayToken(token: string): { studentId: string; timestamp: number } | null {
    try {
      const decoded = JSON.parse(atob(token));
      return decoded;
    } catch {
      return null;
    }
  },

  /**
   * Get birthday messages for sharing
   */
  getBirthdayMessages(): string[] {
    return [
      "🎂 Happy Birthday! May your day be filled with joy and laughter!",
      "🎈 Wishing you a wonderful birthday filled with love and happiness!",
      "🌟 May this special day bring you endless joy and precious memories!",
      "🎁 Happy Birthday! May all your dreams and wishes come true!",
      "🎉 Another year of amazing adventures awaits! Happy Birthday!",
      "✨ Sending you birthday blessings and warm wishes for the year ahead!",
      "🌈 May your birthday be as bright and beautiful as you are!",
      "🎊 Happy Birthday! Here's to another year of growth and learning!",
    ];
  },

  /**
   * Get school birthday greeting
   */
  getSchoolBirthdayGreeting(studentName: string, age: number): string {
    return `Dear ${studentName},

On behalf of the entire First Step School family, we wish you a very Happy ${age}th Birthday! 🎂

May this special day bring you joy, laughter, and wonderful memories. As you celebrate another year of life, we hope you continue to grow, learn, and achieve great things.

Your teachers and classmates are proud of your progress and excited to celebrate this milestone with you!

With warm wishes and blessings,
First Step School Family 🏫`;
  },
};

export default birthdayService;