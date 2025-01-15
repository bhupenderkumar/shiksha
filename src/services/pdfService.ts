import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { SCHOOL_INFO, FEE_RECEIPT_TERMS } from '@/constants/schoolInfo';
import { format } from 'date-fns';
import { Fee, FeeStatus } from '@/types/fee';

// Format currency with Indian Rupee symbol
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(amount);
};

// Format date in a readable format
const formatDate = (date: Date | string) => {
  return format(new Date(date), 'dd MMMM yyyy');
};

// Generate unique receipt number
const generateReceiptNumber = (fee: Fee) => {
  const date = new Date();
  return `FEE/${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(fee.id).padStart(4, '0')}`;
};

export const generateFeePDF = async (fee: Fee, studentDetails: any) => {
  // Initialize PDF
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
    putOnlyUsedFonts: true
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  let yPosition = margin;

  // Helper functions
  const addCenteredText = (text: string, y: number, size = 12, style = 'normal') => {
    doc.setFontSize(size);
    const textWidth = doc.getTextWidth(text);
    doc.text(text, (pageWidth - textWidth) / 2, y);
  };

  const addText = (text: string, x: number, y: number, size = 12, style = 'normal') => {
    doc.setFontSize(size);
    doc.text(text, x, y);
  };

  const checkAndAddNewPage = () => {
    if (yPosition > pageHeight - 30) {
      doc.addPage();
      yPosition = margin;
      return true;
    }
    return false;
  };

  // Receipt Header
  const headerHeight = 60;
  doc.setFillColor(240, 247, 255);
  doc.rect(0, 0, pageWidth, headerHeight, 'F');
  
  // School Logo
  if (SCHOOL_INFO.logoUrl) {
    try {
      const logoSize = 25;
      doc.addImage(SCHOOL_INFO.logoUrl, 'PNG', margin, margin, logoSize, logoSize);
    } catch (error) {
      console.error('Error adding logo:', error);
    }
  }

  // School Information
  doc.setTextColor(0, 48, 87);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  addCenteredText(SCHOOL_INFO.name, margin + 15, 24, 'bold');
  
  doc.setTextColor(70, 70, 70);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  addCenteredText(SCHOOL_INFO.address, margin + 25);
  addCenteredText(`Tel: ${SCHOOL_INFO.phone} | Email: ${SCHOOL_INFO.email}`, margin + 32);

  yPosition = headerHeight + margin;

  // Receipt Title
  doc.setFillColor(0, 48, 87);
  doc.rect(0, yPosition - 5, pageWidth, 12, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  addCenteredText('FEE RECEIPT', yPosition + 3);
  yPosition += 20;

  // Receipt Details
  const receiptNo = generateReceiptNumber(fee);
  doc.setTextColor(70, 70, 70);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  
  // Create a details box
  doc.setFillColor(250, 250, 250);
  doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, 50, 3, 3, 'F');
  
  addText(`Receipt No: ${receiptNo}`, margin + 5, yPosition + 12);
  addText(`Date: ${formatDate(fee.createdAt)}`, margin + 5, yPosition + 24);
  addText(`Academic Year: ${new Date().getFullYear()}`, pageWidth - margin - 80, yPosition + 12);
  addText(`Payment Mode: ${fee.paymentMethod || 'N/A'}`, pageWidth - margin - 80, yPosition + 24);

  yPosition += 60;

  // Student Information
  doc.setFillColor(245, 247, 250);
  doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, 45, 3, 3, 'F');
  
  doc.setTextColor(0, 48, 87);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  addText('STUDENT DETAILS', margin + 5, yPosition + 12);
  
  doc.setTextColor(70, 70, 70);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  addText(`Name: ${studentDetails.name}`, margin + 5, yPosition + 24);
  addText(`Class: ${studentDetails.class}`, pageWidth - margin - 80, yPosition + 24);
  addText(`Admission No: ${studentDetails.admissionNumber}`, margin + 5, yPosition + 36);

  yPosition += 55;

  // Fee Details Table
  doc.autoTable({
    startY: yPosition,
    head: [['Description', 'Due Date', 'Amount', 'Status']],
    body: [[
      fee.feeType,
      formatDate(fee.dueDate),
      formatCurrency(fee.amount),
      fee.status
    ]],
    styles: {
      fontSize: 11,
      cellPadding: 8,
    },
    headStyles: {
      fillColor: [0, 48, 87],
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 40, halign: 'right' },
      3: { cellWidth: 35, halign: 'center' }
    },
    margin: { left: margin, right: margin },
  });

  // Start new page for payment summary and terms
  doc.addPage();
  yPosition = margin + 20;

  // Payment Summary
  doc.setFillColor(245, 247, 250);
  doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, 40, 3, 3, 'F');
  
  doc.setTextColor(0, 48, 87);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  addText('PAYMENT SUMMARY', margin + 5, yPosition + 12);
  
  doc.setTextColor(70, 70, 70);
  doc.setFontSize(11);
  addText('Total Amount:', margin + 5, yPosition + 28);
  doc.setFont('helvetica', 'bold');
  addText(formatCurrency(fee.amount), pageWidth - margin - 10, yPosition + 28, 11, 'right');

  if (fee.status === FeeStatus.PAID) {
    addText('Payment Date:', margin + 5, yPosition + 40);
    addText(formatDate(fee.paymentDate!), pageWidth - margin - 10, yPosition + 40, 11, 'right');
  }

  yPosition += 50;

  // Check if we need a new page for terms
  if (yPosition > pageHeight - 100) {
    doc.addPage();
    yPosition = margin;
  }

  // Terms and Conditions
  if (FEE_RECEIPT_TERMS && FEE_RECEIPT_TERMS.length > 0) {
    doc.setFillColor(250, 250, 250);
    doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, 80, 3, 3, 'F');
    
    doc.setTextColor(0, 48, 87);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    addText('TERMS & CONDITIONS', margin + 5, yPosition + 15);
    
    doc.setTextColor(70, 70, 70);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    
    let termsY = yPosition + 30;
    FEE_RECEIPT_TERMS.forEach((term, index) => {
      const lines = doc.splitTextToSize(term, pageWidth - 2 * margin - 20);
      lines.forEach((line: string, lineIndex: number) => {
        if (termsY > pageHeight - 40) {
          doc.addPage();
          termsY = margin + 10;
        }
        addText(`${lineIndex === 0 ? `${index + 1}. ` : '   '}${line}`, margin + 5, termsY);
        termsY += 12;
      });
    });
    
    yPosition = termsY + 10;
  }

  // Footer
  const addFooter = () => {
    const footerY = pageHeight - 25;
    
    // Signature line
    doc.setDrawColor(0, 48, 87);
    doc.setLineWidth(0.5);
    doc.line(pageWidth - margin - 50, footerY, pageWidth - margin, footerY);
    
    doc.setTextColor(70, 70, 70);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    addText('Authorized Signatory', pageWidth - margin - 45, footerY + 6);
    
    // Digital Stamp
    if (SCHOOL_INFO.stampUrl) {
      try {
        const stampSize = 30;
        doc.addImage(
          SCHOOL_INFO.stampUrl,
          'PNG',
          pageWidth - margin - stampSize - 10,
          footerY - stampSize,
          stampSize,
          stampSize
        );
      } catch (error) {
        console.error('Error adding stamp:', error);
      }
    }
    
    // Page number
    doc.setFontSize(8);
    addText(`Page ${doc.getCurrentPageInfo().pageNumber}`, margin, pageHeight - 10);
  };

  // Add footer to all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addFooter();
  }

  // Save the document
  doc.save(`Fee_Receipt_${receiptNo}.pdf`);
};