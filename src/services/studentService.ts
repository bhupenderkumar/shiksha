import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

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
    const newStudent = {
      id: uuidv4(),
      ...studentData,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const { data, error } = await supabase
      .schema('school')
      .from('Student')
      .insert([newStudent])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating student:', error);
    throw error;
  }
};

export const updateStudent = async (id: string, studentData: Partial<CreateStudentData>) => {
  try {
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
    const { error } = await supabase
      .schema('school')
      .from('Student')
      .delete()
      .eq('id', id);

    if (error) throw error;
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
