export interface Fee {
  id: string;
  studentId: string;
  amount: number;
  dueDate: string;  // ISO string from database
  feeType: FeeType;
  status: FeeStatus;
  paymentDate?: string | null;  // ISO string from database
  paymentMethod?: string | null;
  receiptNumber?: string | null;
  createdAt: string;  // ISO string from database
  updatedAt: string;  // ISO string from database
  student?: {
    id: string;
    name: string;
    admissionNumber: string;
    classId?: string;
    class?: {
      id: string;
      name: string;
      section: string;
    };
  };
}

export interface FeeFile {
  id: string;
  feeId: string;
  fileName: string;
  filePath: string;
  fileType: string;
  uploadedAt: string;  // ISO string
}

export interface CreateFeeData {
  studentId: string;
  amount: number;
  dueDate: string;  // ISO string
  feeType: FeeType;
  status?: FeeStatus;
  paymentDate?: string | null;
  paymentMethod?: string | null;
}

export interface FeeFilter {
  classId?: string;
  studentId?: string;
  month?: number;
  year?: number;
  status?: FeeStatus;
}

export interface FeeSummary {
  totalCollected: number;
  totalPending: number;
  totalOverdue: number;
  countByStatus: Record<FeeStatus, number>;
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