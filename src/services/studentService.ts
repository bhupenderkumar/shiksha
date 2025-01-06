import { supabase, supabaseAdmin } from '@/lib/api-client';
import { v4 as uuidv4 } from 'uuid';

interface StudentCredentials {
  email: string;
  password: string;
  username: string;
}

export interface CreateStudentData {
  admissionNumber: string;
  name: string;
  dateOfBirth: Date;
  gender: string;
  address: string;
  contactNumber: string;
  parentName: string;
  parentContact: string;
  parentEmail: string;
  bloodGroup?: string;
  classId: string;
}

const generateStudentCredentials = (name: string, admissionNumber: string): StudentCredentials => {
  const username = name.toLowerCase().replace(/\s+/g, '.') + '.' + admissionNumber;
  const email = `${username}@firststeppublicschool.com`;
  const password = `FSP${admissionNumber}${Math.random().toString(36).slice(-4)}`;
  
  return {
    email,
    password,
    username
  };
};

export interface Student {
  id: string;
  admissionNumber: string;
  name: string;
  dateOfBirth: Date;
  gender: string;
  address: string;
  contactNumber: string;
  parentName: string;
  parentContact: string;
  parentEmail: string;
  bloodGroup?: string;
  classId: string;
  createdAt: Date;
  updatedAt: Date;
}

export const loadStudents = async () => {
  try {
    const { data, error } = await supabase
      .schema('school')
      .from('Student')
      .select(`
        *,
        class:Class (
          id,
          name,
          section
        )
      `)
      .order('name');

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error loading students:', error);
    throw error;
  }
};

export const getStudent = async (id: string) => {
  try {
    const { data, error } = await supabase
      .schema('school')
      .from('Student')
      .select(`
        *,
        class:Class (
          id,
          name,
          section
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting student:', error);
    throw error;
  }
};

export const createStudent = async (studentData: CreateStudentData) => {
  try {
    const credentials = generateStudentCredentials(studentData.name, studentData.admissionNumber);
    
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: credentials.email,
      password: credentials.password,
      email_confirm: true,
      user_metadata: {
        full_name: studentData.name,
        role: 'STUDENT',
        admission_number: studentData.admissionNumber
      }
    });

    if (authError) throw authError;

    const newStudent = {
      id: authData.user.id,
      ...studentData,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const { error: profileError } = await supabase
      .schema('school')
      .from('Profile')
      .insert([{
        id: authData.user.id,
        user_id: authData.user.id,
        role: 'STUDENT',
        full_name: studentData.name,
        email: credentials.email
      }]);

    if (profileError) {
      await supabase.auth.admin.deleteUser(authData.user.id);
      throw profileError;
    }

    const { data: studentRecord, error: studentError } = await supabase
      .schema('school')
      .from('Student')
      .insert([newStudent])
      .select(`
        *,
        class:Class (
          id,
          name,
          section
        )
      `)
      .single();

    if (studentError) {
      await supabase.auth.admin.deleteUser(authData.user.id);
      throw studentError;
    }

    return {
      student: studentRecord,
      credentials: {
        email: credentials.email,
        password: credentials.password,
        username: credentials.username
      }
    };
  } catch (error) {
    console.error('Error creating student:', error);
    throw error;
  }
};

export const updateStudent = async (id: string, studentData: Partial<CreateStudentData>) => {
  try {
    if (studentData.name) {
      const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
        id,
        {
          user_metadata: {
            full_name: studentData.name
          }
        }
      );

      if (authError) throw authError;

      const { error: profileError } = await supabase
        .schema('school')
        .from('Profile')
        .update({ full_name: studentData.name })
        .eq('user_id', id);

      if (profileError) throw profileError;
    }

    const { data, error } = await supabase
      .schema('school')
      .from('Student')
      .update({
        ...studentData,
        updatedAt: new Date()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating student:', error);
    throw error;
  }
};

export const deleteStudent = async (id: string) => {
  try {
    const { error: studentError } = await supabase
      .schema('school')
      .from('Student')
      .delete()
      .eq('id', id);

    if (studentError) throw studentError;

    const { error: profileError } = await supabase
      .schema('school')
      .from('Profile')
      .delete()
      .eq('user_id', id);

    if (profileError) throw profileError;

    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id);
    if (authError) throw authError;

  } catch (error) {
    console.error('Error deleting student:', error);
    throw error;
  }
};

export const loadStudentsByClass = async (classId: string) => {
  try {
    const { data, error } = await supabase
      .schema('school')
      .from('Student')
      .select(`
        id,
        name,
        admissionNumber,
        dateOfBirth,
        gender,
        contactNumber,
        parentName
      `)
      .eq('classId', classId)
      .order('name');

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error loading students by class:', error);
    throw error;
  }
};
