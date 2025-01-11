import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { SCHOOL_INFO, FEE_RECEIPT_TERMS } from '@/constants/schoolInfo';
import { Fee, FeeType, FeeStatus } from './feeService';
import { format } from 'date-fns';

// Add custom fonts
const addFonts = (doc: jsPDF) => {
  doc.addFont('helvetica', 'normal');
  doc.addFont('helvetica-bold', 'bold');
  doc.addFont('helvetica-oblique', 'italic');
};

// Format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(amount);
};

// Format date
const formatDate = (date: Date | string) => {
  return format(new Date(date), 'dd MMM yyyy');
};

export const generateFeePDF = async (fee: Fee, studentDetails: any) => {
  // Initialize PDF with better quality
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true
  });

  // Add custom fonts
  addFonts(doc);

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let yPosition = margin;

  // Helper functions
  const addCenteredText = (text: string, y: number, size = 12, style = 'normal') => {
    doc.setFont('helvetica', style);
    doc.setFontSize(size);
    const textWidth = doc.getTextWidth(text);
    doc.text(text, (pageWidth - textWidth) / 2, y);
  };

  const addText = (text: string, x: number, y: number, size = 12, style = 'normal') => {
    doc.setFont('helvetica', style);
    doc.setFontSize(size);
    doc.text(text, x, y);
  };

  // Add watermark
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(60);
  doc.setTextColor(230, 230, 230);
  const watermarkText = SCHOOL_INFO.name;
  const watermarkWidth = doc.getTextWidth(watermarkText);
  doc.text(watermarkText, (pageWidth - watermarkWidth) / 2, pageHeight / 2, {
    angle: 45
  });

  // Reset text color
  doc.setTextColor(0, 0, 0);

  // Add school logo if available
  if (SCHOOL_INFO.logoUrl) {
    try {
      const logoSize = 20;
      doc.addImage(SCHOOL_INFO.logoUrl, 'PNG', margin, yPosition, logoSize, logoSize);
      yPosition += logoSize + 5;
    } catch (error) {
      console.error('Error adding logo:', error);
    }
  }

  // Add school header with professional styling
  addCenteredText(SCHOOL_INFO.name, yPosition, 24, 'bold');
  yPosition += 10;

  doc.setFontSize(12);
  addCenteredText(SCHOOL_INFO.address, yPosition);
  yPosition += 8;
  addCenteredText(`Phone: ${SCHOOL_INFO.phone} | Email: ${SCHOOL_INFO.email}`, yPosition);
  yPosition += 15;

  // Add decorative line
  doc.setDrawColor(0, 0, 150);
  doc.setLineWidth(0.5);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 10;

  // Receipt header with professional styling
  addCenteredText('FEE RECEIPT', yPosition, 20, 'bold');
  yPosition += 15;

  // Receipt details with improved layout
  const receiptDetailsY = yPosition;
  addText(`Receipt No: ${fee.receiptNumber || 'N/A'}`, margin, yPosition, 12, 'bold');
  addText(`Date: ${formatDate(fee.createdAt)}`, pageWidth - margin - 60, yPosition);
  yPosition += 15;

  // Add QR code if available
  const qrData = `Receipt:${fee.receiptNumber},Amount:${fee.amount},Date:${fee.createdAt}`;
  try {
    const qrImage = await generateQRCode(qrData);
    const qrSize = 20;
    doc.addImage(qrImage, 'PNG', pageWidth - margin - qrSize, receiptDetailsY - qrSize, qrSize, qrSize);
  } catch (error) {
    console.error('Error adding QR code:', error);
  }

  // Student details with improved styling
  doc.setFillColor(240, 240, 250);
  doc.rect(margin, yPosition, pageWidth - 2 * margin, 25, 'F');
  yPosition += 8;
  
  addText('Student Details:', margin + 5, yPosition, 14, 'bold');
  yPosition += 8;
  
  const detailsX = margin + 10;
  addText(`Name: ${studentDetails.name}`, detailsX, yPosition, 12);
  addText(`Class: ${studentDetails.class || 'N/A'}`, pageWidth - margin - 80, yPosition);
  yPosition += 8;
  addText(`Admission No: ${studentDetails.admissionNumber}`, detailsX, yPosition);
  yPosition += 15;

  // Fee details table with improved styling
  const tableHeaders = [
    ['Description', 'Amount', 'Status', 'Payment Date']
  ];
  
  const tableData = [[
    fee.feeType,
    formatCurrency(fee.amount),
    fee.status,
    fee.paymentDate ? formatDate(fee.paymentDate) : 'N/A'
  ]];

  doc.autoTable({
    startY: yPosition,
    head: tableHeaders,
    body: tableData,
    margin: { left: margin, right: margin },
    styles: {
      fontSize: 12,
      cellPadding: 5,
      overflow: 'linebreak',
      halign: 'center'
    },
    headStyles: {
      fillColor: [0, 0, 150],
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [240, 240, 250]
    },
    columnStyles: {
      0: { cellWidth: 60 },
      1: { cellWidth: 40, halign: 'right' },
      2: { cellWidth: 40 },
      3: { cellWidth: 40 }
    }
  });

  yPosition = (doc as any).lastAutoTable.finalY + 20;

  // Payment summary with styled box
  doc.setFillColor(245, 245, 250);
  doc.rect(margin, yPosition, pageWidth - 2 * margin, 25, 'F');
  yPosition += 8;
  
  addText('Payment Summary:', margin + 5, yPosition, 14, 'bold');
  yPosition += 8;
  
  if (fee.status === 'PAID') {
    addText(`Paid via ${fee.paymentMethod || 'N/A'}`, margin + 10, yPosition);
    addText(`Total Paid: ${formatCurrency(fee.amount)}`, pageWidth - margin - 80, yPosition, 12, 'bold');
  } else {
    addText('Payment Pending', margin + 10, yPosition);
    addText(`Due Amount: ${formatCurrency(fee.amount)}`, pageWidth - margin - 80, yPosition, 12, 'bold');
  }
  yPosition += 20;

  // Terms and conditions with better formatting
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.2);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 10;

  addText('Terms & Conditions:', margin, yPosition, 10, 'bold');
  yPosition += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  FEE_RECEIPT_TERMS.forEach(term => {
    doc.text('• ' + term, margin + 5, yPosition);
    yPosition += 4;
  });

  // Footer with signatures
  yPosition = pageHeight - 40;
  
  // Signature lines with improved styling
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  
  // Left signature
  doc.line(margin, yPosition, margin + 50, yPosition);
  addText('Accountant', margin, yPosition + 5, 10);
  
  // Center text
  addCenteredText('This is a computer-generated document', yPosition + 5, 8, 'italic');
  
  // Right signature
  doc.line(pageWidth - margin - 50, yPosition, pageWidth - margin, yPosition);
  addText('Principal', pageWidth - margin - 50, yPosition + 5, 10);

  // Add page number
  const pageNumber = `Page ${doc.getCurrentPageInfo().pageNumber}`;
  doc.setFontSize(8);
  doc.text(pageNumber, pageWidth - margin - doc.getTextWidth(pageNumber), pageHeight - 10);

  // Save with improved file naming
  const timestamp = format(new Date(), 'yyyyMMdd_HHmmss');
  const fileName = `Fee_Receipt_${studentDetails.admissionNumber}_${timestamp}.pdf`;
  doc.save(fileName);
};

// Helper function to generate QR code (you'll need to implement this)
async function generateQRCode(data: string): Promise<string> {
  // Implement QR code generation here
  // You can use libraries like qrcode or similar
  // Return the QR code as a data URL
  return '';
}