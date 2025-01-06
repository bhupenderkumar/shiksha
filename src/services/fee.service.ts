import { BaseService } from './base.service';
import { queryBuilder, handleError } from '@/lib/api-client';
import type { Fee, CreateFeeData } from '@/types/fee';

export class FeeService extends BaseService {
  constructor() {
    super('Fee');
  }

  async getAll() {
    return this.findMany({
      select: `
        *,
        student:Student (
          id,
          name,
          admissionNumber,
          class:Class (
            id,
            name,
            section
          )
        )
      `,
      orderBy: { column: 'dueDate' }
    }) as Promise<Fee[]>;
  }

  async getByStudent(studentId: string) {
    return this.findMany({
      select: `
        *,
        student:Student (
          id,
          name,
          admissionNumber,
          class:Class (
            id,
            name,
            section
          )
        )
      `,
      filters: { studentId },
      orderBy: { column: 'dueDate' }
    }) as Promise<Fee[]>;
  }

  async create(data: CreateFeeData) {
    const feeData = {
      ...data,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'PENDING'
    };

    return this.create(feeData) as Promise<Fee>;
  }

  async updateStatus(id: string, status: FeeStatus, paymentDetails?: {
    paymentDate: Date;
    paymentMethod: string;
    receiptNumber: string;
  }) {
    const updateData = {
      status,
      ...paymentDetails,
      updatedAt: new Date()
    };

    return this.update(id, updateData) as Promise<Fee>;
  }

  async uploadAttachment(feeId: string, file: File) {
    try {
      const filePath = `fees/${feeId}/${file.name}`;
      const { error: uploadError } = await queryBuilder.storage
        .from('fee-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const fileRecord = {
        id: generateId(),
        feeId,
        fileName: file.name,
        filePath,
        fileType: file.type,
        uploadedAt: new Date()
      };

      const { error: dbError } = await queryBuilder
        .from('FeeFile')
        .insert([fileRecord]);

      if (dbError) throw dbError;

      return fileRecord;
    } catch (error) {
      handleError(error, 'Error uploading fee attachment');
    }
  }

  async deleteAttachment(fileId: string, filePath: string) {
    try {
      const { error: storageError } = await queryBuilder.storage
        .from('fee-files')
        .remove([filePath]);

      if (storageError) throw storageError;

      const { error: dbError } = await queryBuilder
        .from('FeeFile')
        .delete()
        .eq('id', fileId);

      if (dbError) throw dbError;
    } catch (error) {
      handleError(error, 'Error deleting fee attachment');
    }
  }
}

export const feeService = new FeeService(); 