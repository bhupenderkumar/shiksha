import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { SCHOOL_INFO, FEE_RECEIPT_TERMS } from '@/constants/schoolInfo';
import { format } from 'date-fns';
import { Fee, FeeStatus } from '@/types/fee';

// Re-export from the main services pdfService for consistency
export { generateFeePDF, generateProfilePDF } from '@/services/pdfService';