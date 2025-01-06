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
  student?: {
    id: string;
    name: string;
    admissionNumber: string;
    class?: {
      id: string;
      name: string;
      section: string;
    };
  };
  attachments?: FeeFile[];
}

export interface FeeFile {
  id: string;
  feeId: string;
  fileName: string;
  filePath: string;
  fileType: string;
  uploadedAt: Date;
}

export interface CreateFeeData {
  studentId: string;
  amount: number;
  dueDate: Date;
  feeType: FeeType;
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
  PARTIAL = 'PARTIAL'
} 