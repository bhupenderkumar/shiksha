import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { SCHOOL_INFO, FEE_RECEIPT_TERMS } from '@/constants/schoolInfo';
import { Fee, FeeType, FeeStatus } from './feeService';

export const generateFeePDF = async (fee: Fee, studentDetails: any) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let yPosition = margin;

  // Helper function for centered text
  const addCenteredText = (text: string, y: number, size = 12) => {
    doc.setFontSize(size);
    const textWidth = doc.getTextWidth(text);
    doc.text(text, (pageWidth - textWidth) / 2, y);
  };

  // Add school header
  doc.setFontSize(20);
  addCenteredText(SCHOOL_INFO.name, yPosition, 20);
  yPosition += 10;

  doc.setFontSize(12);
  addCenteredText(SCHOOL_INFO.address, yPosition);
  yPosition += 8;
  addCenteredText(`Phone: ${SCHOOL_INFO.phone} | Email: ${SCHOOL_INFO.email}`, yPosition);
  yPosition += 15;

  // Receipt header
  doc.setFontSize(16);
  addCenteredText('FEE RECEIPT', yPosition);
  yPosition += 15;

  // Receipt details
  doc.setFontSize(12);
  doc.text(`Receipt No: ${fee.receiptNumber || 'N/A'}`, margin, yPosition);
  doc.text(`Date: ${new Date(fee.createdAt).toLocaleDateString()}`, pageWidth - margin - 60, yPosition);
  yPosition += 10;

  // Student details
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 10;
  doc.text(`Student Name: ${studentDetails.name}`, margin, yPosition);
  doc.text(`Class: ${studentDetails.class || 'N/A'}`, pageWidth - margin - 60, yPosition);
  yPosition += 8;
  doc.text(`Admission No: ${studentDetails.admissionNumber}`, margin, yPosition);
  yPosition += 15;

  // Fee details
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 10;
  doc.text('Fee Details:', margin, yPosition);
  yPosition += 8;

  // Fee table headers
  const columns = ['Description', 'Amount'];
  const data = [
    [fee.feeType, `₹ ${fee.amount.toFixed(2)}`],
  ];

  // Create table
  doc.autoTable({
    startY: yPosition,
    head: [columns],
    body: data,
    margin: { left: margin, right: margin },
    theme: 'grid',
  });

  yPosition = (doc as any).lastAutoTable.finalY + 20;

  // Payment details
  doc.text(`Payment Status: ${fee.status}`, margin, yPosition);
  yPosition += 8;
  if (fee.paymentMethod) {
    doc.text(`Payment Method: ${fee.paymentMethod}`, margin, yPosition);
    yPosition += 8;
  }
  if (fee.paymentDate) {
    doc.text(`Payment Date: ${new Date(fee.paymentDate).toLocaleDateString()}`, margin, yPosition);
    yPosition += 15;
  }

  // Terms and conditions
  doc.setFontSize(10);
  yPosition += 10;
  doc.text('Terms & Conditions:', margin, yPosition);
  yPosition += 5;
  FEE_RECEIPT_TERMS.forEach(term => {
    doc.text(term, margin, yPosition);
    yPosition += 5;
  });

  // Signatures
  yPosition = pageHeight - 40;
  doc.line(margin, yPosition, margin + 50, yPosition);
  doc.line(pageWidth - margin - 50, yPosition, pageWidth - margin, yPosition);
  doc.text('Accountant', margin, yPosition + 5);
  doc.text('Principal', pageWidth - margin - 50, yPosition + 5);

  // Save the PDF
  const fileName = `Fee_Receipt_${studentDetails.admissionNumber}_${new Date().getTime()}.pdf`;
  doc.save(fileName);
}; 