import { supabase } from '../lib/supabase';
// Add uuid import
import { v4 as uuidv4 } from 'uuid';

export interface Fee {
  id: string;
  studentId: string;
  amount: number;
  dueDate: Date;
  feeType: FeeType;
  status: FeeStatus;
  paymentDate?: Date;
  paymentMethod?: string;
  receiptNumber?: string;
  createdAt: Date;
  updatedAt: Date;
  attachments?: File[];
}

export enum FeeType {
  TUITION = 'TUITION',
  EXAMINATION = 'EXAMINATION',
  TRANSPORT = 'TRANSPORT',
  LIBRARY = 'LIBRARY',
  LABORATORY = 'LABORATORY',
  MISCELLANEOUS = 'MISCELLANEOUS'
}

export enum FeeStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  PARTIAL
}

export interface CreateFeeData {
  studentId: string;
  amount: number;
  dueDate: Date;
  feeType: FeeType;
  status: FeeStatus;
  paymentMethod?: string;
  receiptNumber?: string;
}

export const loadFees = async (studentId?: string) => {
  try {
    let query = supabase
      .schema('school')
      .from('Fee')
      .select(`
        *,
        student:Student (
          id,
          name,
          admissionNumber
        ),
        attachments:File(*)
      `);

    if (studentId) {
      query = query.eq('studentId', studentId);
    }

    const { data, error } = await query.order('createdAt', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error loading fees:', error);
    throw error;
  }
};

export const createFee = async (feeData: CreateFeeData) => {
  try {
    const newFee = {
      id: uuidv4(), // Generate a new UUID for the fee
      ...feeData,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const { data, error } = await supabase
      .schema('school')
      .from('Fee')
      .insert([newFee])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating fee:', error);
    throw error;
  }
};

export const updateFee = async (id: string, feeData: Partial<CreateFeeData>) => {
  try {
    const { data, error } = await supabase
      .schema('school')
      .from('Fee')
      .update({
        ...feeData,
        updatedAt: new Date()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating fee:', error);
    throw error;
  }
};

export const deleteFee = async (id: string) => {
  try {
    const { error } = await supabase
      .schema('school')
      .from('Fee')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting fee:', error);
    throw error;
  }
};

export const deleteFileFromFee = async (fileId: string, filePath: string) => {
  try {
    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('fee-files')
      .remove([filePath]);

    if (storageError) throw storageError;

    // Delete from database
    const { error: dbError } = await supabase
      .schema('school')
      .from('fee_files')
      .delete()
      .eq('id', fileId);

    if (dbError) throw dbError;
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};
