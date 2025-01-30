import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { SCHOOL_INFO, FEE_RECEIPT_TERMS } from '@/constants/schoolInfo';
import { format } from 'date-fns';
import { Fee, FeeStatus } from '@/types/fee';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(amount);
};

const formatDate = (date: Date | string) => {
  return format(new Date(date), 'dd MMMM yyyy');
};

const generateReceiptNumber = (fee: Fee) => {
  const date = new Date();
  return `FEE/${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(fee.id).padStart(4, '0')}`;
};

export const generateFeePDF = async (fee: Fee, studentDetails: any) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
    putOnlyUsedFonts: true
  });

  doc.setFont("helvetica", "normal");

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let yPosition = margin;

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return 'N/A';
    return String(value);
  };

  const addCenteredText = (text: string, y: number, size = 12, style = 'normal', color = [0, 0, 0]) => {
    doc.setFontSize(size);
    doc.setFont('helvetica', style);
    doc.setTextColor(color[0], color[1], color[2]);
    const textWidth = doc.getTextWidth(text);
    doc.text(formatValue(text), (pageWidth - textWidth) / 2, y);
  };

  const addText = (text: string, x: number, y: number, size = 12, style = 'normal', color = [60, 60, 60]) => {
    doc.setFontSize(size);
    doc.setFont('helvetica', style);
    doc.setTextColor(...color);
    doc.text(formatValue(text), x, y);
  };

  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageWidth, 60, 'F');

  doc.setTextColor(0, 0, 0);

  if (SCHOOL_INFO.logo) {
    try {
      doc.addImage(SCHOOL_INFO.logo, 'PNG', margin, 10, 40, 30);
    } catch (error) {
      console.warn('Could not add logo:', error);
    }
  }

  yPosition = 40;
  addCenteredText(SCHOOL_INFO.name.toUpperCase(), yPosition, 24, 'bold', [0, 0, 0]);
  yPosition += 10;
  addCenteredText(SCHOOL_INFO.address, yPosition, 12, 'normal', [0, 0, 0]);
  yPosition += 8;
  addCenteredText(`Tel: ${SCHOOL_INFO.phone} | Email: ${SCHOOL_INFO.email}`, yPosition, 10, 'normal', [0, 0, 0]);
  yPosition += 8;
  addCenteredText(SCHOOL_INFO.website, yPosition, 10, 'normal', [0, 0, 0]);
  yPosition += 25;

  doc.setFillColor(255, 255, 255);
  doc.rect(margin, yPosition, pageWidth - 2 * margin, 12, 'F');
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  const headerText = 'FEE RECEIPT';
  const headerWidth = doc.getTextWidth(headerText);
  doc.text(headerText, (pageWidth - headerWidth) / 2, yPosition + 8);
  yPosition += 25;

  doc.setFillColor(255, 218, 185);
  doc.rect(margin, yPosition, pageWidth - 2 * margin, 10, 'F');
  doc.setTextColor(60, 60, 60);
  doc.setFontSize(12);
  doc.text('Receipt Details', margin + 5, yPosition + 7);
  yPosition += 15;

  const receiptNumber = generateReceiptNumber(fee);
  const addDetailRow = (label: string, value: any) => {
    doc.setFillColor(255, 240, 245);
    doc.rect(margin, yPosition - 5, pageWidth - 2 * margin, 10, 'F');
    addText(label, margin + 5, yPosition, 11, 'normal');
    addText(formatValue(value), margin + 50, yPosition, 11, 'normal');
    yPosition += 12;
  };

  addDetailRow('Receipt No:', receiptNumber);
  addDetailRow('Date:', formatDate(new Date()));

  yPosition += 5;
  doc.setFillColor(221, 160, 221);
  doc.rect(margin, yPosition, pageWidth - 2 * margin, 10, 'F');
  doc.setTextColor(60, 60, 60);
  doc.setFontSize(12);
  doc.text('Student Information', margin + 5, yPosition + 7);
  yPosition += 15;

  const studentName = studentDetails?.student?.name || studentDetails?.name || 'N/A';
  const admissionNumber = studentDetails?.student?.admissionNumber || studentDetails?.admissionNumber || 'N/A';
  const className = studentDetails?.student?.class?.name || studentDetails?.class?.name || studentDetails?.class || 'N/A';
  const parentName = studentDetails?.student?.parentName || studentDetails?.parentName || 'N/A';
  const parentContact = studentDetails?.student?.parentContact || studentDetails?.parentContact || 'N/A';
  const parentEmail = studentDetails?.student?.parentEmail || studentDetails?.parentEmail || 'N/A';

  addDetailRow('Name:', studentName);
  addDetailRow('Admission No:', admissionNumber);
  addDetailRow('Class:', className);
  addDetailRow('Parent Name:', parentName);
  addDetailRow('Parent Contact:', parentContact);
  addDetailRow('Parent Email:', parentEmail);

  yPosition += 5;
  doc.setFillColor(152, 251, 152);
  doc.rect(margin, yPosition, pageWidth - 2 * margin, 10, 'F');
  doc.setTextColor(60, 60, 60);
  doc.text('Fee Details', margin + 5, yPosition + 7);
  yPosition += 15;

  addDetailRow('Fee Type:', fee.type || fee.feeType || 'N/A');
  addDetailRow('Amount:', formatCurrency(fee.amount));
  addDetailRow('Due Date:', fee.dueDate ? formatDate(fee.dueDate) : 'N/A');
  addDetailRow('Status:', fee.status || 'N/A');

  if (fee.paidDate) {
    addDetailRow('Paid Date:', formatDate(fee.paidDate));
  }
  if (fee.description) {
    addDetailRow('Description:', fee.description);
  }

  doc.addPage();
  yPosition = margin + 10;

  doc.setFillColor(255, 218, 185);
  doc.rect(margin, yPosition, pageWidth - 2 * margin, 10, 'F');
  doc.text('Principal:', margin + 5, yPosition + 7);
  doc.text(SCHOOL_INFO.principalName, margin + 50, yPosition + 7);
  yPosition += 15;

  doc.setFillColor(255, 218, 185);
  doc.rect(margin, yPosition, pageWidth - 2 * margin, 10, 'F');
  doc.text('Accountant:', margin + 5, yPosition + 7);
  doc.text(SCHOOL_INFO.accountantName, margin + 50, yPosition + 7);
  yPosition += 15;

  if (fee.status === FeeStatus.PAID) {
    doc.setFillColor(173, 216, 230);
    doc.rect(margin, yPosition, pageWidth - 2 * margin, 10, 'F');
    doc.setTextColor(60, 60, 60);
    doc.text('Payment Details', margin + 5, yPosition + 7);
    yPosition += 15;

    addDetailRow('Payment Mode:', fee?.paymentMode || fee.paymentMethod || 'Not specified');
    addDetailRow('Transaction ID:', fee.transactionId || 'Not specified');
    yPosition += 10;
  }

  doc.setFillColor(255, 218, 185);
  doc.rect(margin, yPosition, pageWidth - 2 * margin, 10, 'F');
  doc.text('Bank Details', margin + 5, yPosition + 7);
  yPosition += 15;

  addDetailRow('Bank Name:', SCHOOL_INFO.bankDetails.bankName);
  addDetailRow('Account Name:', SCHOOL_INFO.bankDetails.accountName);
  addDetailRow('Account Number:', SCHOOL_INFO.bankDetails.accountNumber);
  addDetailRow('IFSC Code:', SCHOOL_INFO.bankDetails.ifscCode);
  addDetailRow('Branch:', SCHOOL_INFO.bankDetails.branch);

  yPosition += 10;
  doc.setFillColor(221, 160, 221);
  doc.rect(margin, yPosition, pageWidth - 2 * margin, 10, 'F');
  doc.text('Terms & Conditions', margin + 5, yPosition + 7);
  yPosition += 15;

  FEE_RECEIPT_TERMS.forEach(term => {
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(9);
    doc.text(formatValue(term), margin, yPosition);
    yPosition += 7;
  });

  const addFooter = (pageNum: number) => {
    doc.setPage(pageNum);
    const footerY = pageHeight - 25;

    const bottomY = pageHeight - 10;
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(8);
    const pageText = `Page ${pageNum} of 2`;
    doc.text(pageText, margin, bottomY);
    const websiteWidth = doc.getTextWidth(SCHOOL_INFO.website);
    doc.text(SCHOOL_INFO.website, (pageWidth - websiteWidth) / 2, bottomY);
  };

  addFooter(1);
  addFooter(2);

  const fileName = `Fee_Receipt_${receiptNumber}.pdf`;
  doc.save(fileName);
};

export const generateProfilePDF = async (student: any, profile: any) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
    putOnlyUsedFonts: true
  });

  doc.setFont("calibri", "normal");

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  let yPosition = margin;

  const addCenteredText = (text: string, y: number, size = 12, style = 'normal') => {
    doc.setFontSize(size);
    doc.setFont('calibri', style);
    const textWidth = doc.getTextWidth(text);
    doc.text(text, (pageWidth - textWidth) / 2, y);
  };

  const addText = (text: string, x: number, y: number, size = 12, style = 'normal') => {
    doc.setFontSize(size);
    doc.setFont('calibri', style);
    doc.text(text, x, y);
  };

  yPosition += 5;

  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageWidth, 40, 'F');

  doc.setTextColor(0, 0, 0);
  addCenteredText(SCHOOL_INFO.name.toUpperCase(), yPosition, 22, 'bold');
  yPosition += 8;

  doc.setTextColor(60, 60, 60);
  addCenteredText(SCHOOL_INFO.address, yPosition, 11);
  yPosition += 6;

  addCenteredText(`Tel: ${SCHOOL_INFO.phone} | Email: ${SCHOOL_INFO.email}`, yPosition, 10);
  yPosition += 6;

  addCenteredText(`Website: ${SCHOOL_INFO.website}`, yPosition, 10);
  yPosition += 15;

  doc.setTextColor(0, 0, 0);

  doc.setDrawColor(0);
  doc.setFillColor(240, 240, 255);
  doc.rect(margin, yPosition, pageWidth - 2 * margin, 10, 'F');
  addCenteredText('STUDENT PROFILE', yPosition + 7, 14, 'bold');
  yPosition += 20;

  const detailsStartX = margin + 5;
  const labelWidth = 50;

  addText('Personal Information', margin, yPosition, 12, 'bold');
  yPosition += 8;
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 10;

  const personalInfo = [
    { label: 'Name', value: profile.full_name },
    { label: 'Email', value: profile.email },
    { label: 'Role', value: profile.role },
    { label: 'Admission No', value: student.admissionNumber },
    { label: 'Date of Birth', value: formatDate(student.dateOfBirth) },
    { label: 'Blood Group', value: student.bloodGroup || 'Not specified' },
  ];

  personalInfo.forEach(info => {
    addText(info.label + ':', detailsStartX, yPosition, 10, 'bold');
    addText(info.value, detailsStartX + labelWidth, yPosition, 10);
    yPosition += 8;
  });

  yPosition += 10;

  addText('Academic Information', margin, yPosition, 12, 'bold');
  yPosition += 8;
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 10;

  const academicInfo = [
    { label: 'Class', value: student.class?.name || 'Not assigned' },
    { label: 'Section', value: student.class?.section || 'Not assigned' },
    { label: 'Roll No', value: student.rollNumber || 'Not assigned' },
  ];

  academicInfo.forEach(info => {
    addText(info.label + ':', detailsStartX, yPosition, 10, 'bold');
    addText(info.value, detailsStartX + labelWidth, yPosition, 10);
    yPosition += 8;
  });

  yPosition += 20;

  const footerY = pageHeight - 25;
  doc.line(margin, footerY, pageWidth - margin, footerY);

  addText('Principal:', margin, footerY + 10, 10);
  addText(SCHOOL_INFO.principalName, margin + 20, footerY + 10, 10);

  addText('Generated on:', pageWidth - margin - 80, footerY + 10, 8);
  addText(formatDate(new Date()), pageWidth - margin - 40, footerY + 10, 8);

  const bottomY = pageHeight - 10;
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  addCenteredText(SCHOOL_INFO.website, bottomY);

  const fileName = `${student.admissionNumber}_profile_${format(new Date(), 'yyyyMMdd')}.pdf`;
  doc.save(fileName);
};