import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { SCHOOL_INFO, FEE_RECEIPT_TERMS } from '@/constants/schoolInfo';
import { format } from 'date-fns';
import { Fee, FeeStatus } from '@/types/fee';

// Professional color scheme - Burgundy/Maroon theme
const COLORS = {
  primary: [128, 0, 32] as [number, number, number],       // Burgundy/Maroon
  secondary: [64, 64, 64] as [number, number, number],     // Charcoal gray
  accent: [166, 30, 77] as [number, number, number],       // Rose accent
  success: [39, 174, 96] as [number, number, number],      // Green
  warning: [243, 156, 18] as [number, number, number],     // Orange
  danger: [192, 57, 43] as [number, number, number],       // Red
  light: [250, 248, 246] as [number, number, number],      // Warm light gray
  dark: [44, 44, 44] as [number, number, number],          // Dark gray
  white: [255, 255, 255] as [number, number, number],
  headerBg: [102, 0, 34] as [number, number, number],      // Deep burgundy header
  tableBorder: [200, 190, 185] as [number, number, number],// Warm table border
  tableRowAlt: [252, 248, 245] as [number, number, number],// Warm alternating row
  gold: [184, 134, 11] as [number, number, number],        // Gold accent
};

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
  return `FSPS/${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(fee.id).slice(-6).padStart(6, '0')}`;
};

// Convert number to words for Indian currency
const numberToWords = (num: number): string => {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  if (num === 0) return 'Zero';
  
  const convertLessThanThousand = (n: number): string => {
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
    return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + convertLessThanThousand(n % 100) : '');
  };
  
  const intNum = Math.floor(num);
  const paisa = Math.round((num - intNum) * 100);
  
  let result = '';
  if (intNum >= 10000000) {
    result += convertLessThanThousand(Math.floor(intNum / 10000000)) + ' Crore ';
    num = intNum % 10000000;
  }
  if (intNum >= 100000) {
    result += convertLessThanThousand(Math.floor((intNum % 10000000) / 100000)) + ' Lakh ';
    num = intNum % 100000;
  }
  if (intNum >= 1000) {
    result += convertLessThanThousand(Math.floor((intNum % 100000) / 1000)) + ' Thousand ';
    num = intNum % 1000;
  }
  result += convertLessThanThousand(intNum % 1000);
  
  result = result.trim() + ' Rupees';
  if (paisa > 0) {
    result += ' and ' + convertLessThanThousand(paisa) + ' Paise';
  }
  result += ' Only';
  
  return result;
};

export const generateFeePDF = async (fee: Fee, studentDetails: any) => {
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

  // Helper function to safely get string values
  const safeString = (value: any): string => {
    if (value === null || value === undefined) return 'N/A';
    return String(value);
  };

  // Draw professional header with school logo and information
  const drawHeader = () => {
    // Header background
    doc.setFillColor(...COLORS.headerBg);
    doc.rect(0, 0, pageWidth, 45, 'F');
    
    // Gold accent line at the bottom of header for elegance
    doc.setFillColor(...COLORS.gold);
    doc.rect(0, 45, pageWidth, 2, 'F');
    
    // School logo placeholder (circle with initials FSPS)
    doc.setFillColor(...COLORS.white);
    doc.circle(margin + 12, 22, 12, 'F');
    // Inner gold ring for professional look
    doc.setDrawColor(...COLORS.gold);
    doc.setLineWidth(1);
    doc.circle(margin + 12, 22, 10, 'S');
    doc.setTextColor(...COLORS.headerBg);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('FSPS', margin + 5.5, 24);
    
    // School Name
    doc.setTextColor(...COLORS.white);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(SCHOOL_INFO.name.toUpperCase(), margin + 30, 18);
    
    // Tagline
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    const tagline = (SCHOOL_INFO as any).tagline || 'Excellence in Education';
    doc.text(tagline, margin + 30, 25);
    
    // Contact details
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(SCHOOL_INFO.address, margin + 30, 32);
    doc.text(`Tel: ${SCHOOL_INFO.phone}  |  Email: ${SCHOOL_INFO.email}  |  Web: ${SCHOOL_INFO.website}`, margin + 30, 38);
  };

  // Draw receipt title section
  const drawReceiptTitle = (yPos: number): number => {
    // Receipt Title with border
    doc.setFillColor(...COLORS.light);
    doc.setDrawColor(...COLORS.primary);
    doc.setLineWidth(0.5);
    doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 14, 2, 2, 'FD');
    
    doc.setTextColor(...COLORS.primary);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    const title = fee.status === FeeStatus.PAID ? 'FEE RECEIPT' : 'FEE INVOICE';
    const titleWidth = doc.getTextWidth(title);
    doc.text(title, (pageWidth - titleWidth) / 2, yPos + 9);
    
    return yPos + 20;
  };

  // Draw receipt info row (receipt no, date)
  const drawReceiptInfo = (yPos: number): number => {
    const receiptNumber = generateReceiptNumber(fee);
    
    doc.setFillColor(...COLORS.tableRowAlt);
    doc.rect(margin, yPos, pageWidth - 2 * margin, 12, 'F');
    
    // Left side - Receipt No
    doc.setTextColor(...COLORS.dark);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Receipt No:', margin + 5, yPos + 8);
    doc.setFont('helvetica', 'normal');
    doc.text(receiptNumber, margin + 32, yPos + 8);
    
    // Right side - Date
    const dateLabel = 'Date:';
    const dateValue = formatDate(new Date());
    doc.setFont('helvetica', 'bold');
    doc.text(dateLabel, pageWidth - margin - 55, yPos + 8);
    doc.setFont('helvetica', 'normal');
    doc.text(dateValue, pageWidth - margin - 42, yPos + 8);
    
    return yPos + 18;
  };

  // Draw student information section
  const drawStudentInfo = (yPos: number): number => {
    // Section header
    doc.setFillColor(...COLORS.primary);
    doc.rect(margin, yPos, pageWidth - 2 * margin, 8, 'F');
    doc.setTextColor(...COLORS.white);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('STUDENT INFORMATION', margin + 5, yPos + 5.5);
    yPos += 12;
    
    // Student details in a bordered box
    doc.setDrawColor(...COLORS.tableBorder);
    doc.setLineWidth(0.3);
    
    const studentName = studentDetails?.student?.name || studentDetails?.name || 'N/A';
    const admissionNumber = studentDetails?.student?.admissionNumber || studentDetails?.admissionNumber || 'N/A';
    const className = studentDetails?.student?.class?.name || studentDetails?.class?.name || studentDetails?.class || 'N/A';
    const section = studentDetails?.student?.class?.section || studentDetails?.class?.section || '';
    const parentName = studentDetails?.student?.parentName || studentDetails?.parentName || 'N/A';
    const parentContact = studentDetails?.student?.parentContact || studentDetails?.parentContact || 'N/A';
    
    const colWidth = (pageWidth - 2 * margin) / 2;
    
    // Row 1
    doc.setFillColor(...COLORS.light);
    doc.rect(margin, yPos, colWidth, 10, 'FD');
    doc.rect(margin + colWidth, yPos, colWidth, 10, 'FD');
    
    doc.setTextColor(...COLORS.secondary);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Student Name:', margin + 3, yPos + 6);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLORS.dark);
    doc.text(safeString(studentName), margin + 30, yPos + 6);
    
    doc.setTextColor(...COLORS.secondary);
    doc.setFont('helvetica', 'bold');
    doc.text('Admission No:', margin + colWidth + 3, yPos + 6);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLORS.dark);
    doc.text(safeString(admissionNumber), margin + colWidth + 30, yPos + 6);
    yPos += 10;
    
    // Row 2
    doc.setFillColor(...COLORS.white);
    doc.rect(margin, yPos, colWidth, 10, 'FD');
    doc.rect(margin + colWidth, yPos, colWidth, 10, 'FD');
    
    doc.setTextColor(...COLORS.secondary);
    doc.setFont('helvetica', 'bold');
    doc.text('Class:', margin + 3, yPos + 6);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLORS.dark);
    doc.text(`${safeString(className)}${section ? ' - ' + section : ''}`, margin + 30, yPos + 6);
    
    doc.setTextColor(...COLORS.secondary);
    doc.setFont('helvetica', 'bold');
    doc.text('Parent/Guardian:', margin + colWidth + 3, yPos + 6);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLORS.dark);
    doc.text(safeString(parentName), margin + colWidth + 35, yPos + 6);
    yPos += 10;
    
    // Row 3
    doc.setFillColor(...COLORS.light);
    doc.rect(margin, yPos, pageWidth - 2 * margin, 10, 'FD');
    
    doc.setTextColor(...COLORS.secondary);
    doc.setFont('helvetica', 'bold');
    doc.text('Contact:', margin + 3, yPos + 6);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLORS.dark);
    doc.text(safeString(parentContact), margin + 25, yPos + 6);
    yPos += 15;
    
    return yPos;
  };

  // Draw fee details table
  const drawFeeDetails = (yPos: number): number => {
    // Section header
    doc.setFillColor(...COLORS.primary);
    doc.rect(margin, yPos, pageWidth - 2 * margin, 8, 'F');
    doc.setTextColor(...COLORS.white);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('FEE DETAILS', margin + 5, yPos + 5.5);
    yPos += 12;
    
    // Table header
    const tableWidth = pageWidth - 2 * margin;
    const col1 = tableWidth * 0.1;  // S.No
    const col2 = tableWidth * 0.4;  // Description
    const col3 = tableWidth * 0.25; // Due Date
    const col4 = tableWidth * 0.25; // Amount
    
    doc.setFillColor(...COLORS.secondary);
    doc.rect(margin, yPos, tableWidth, 10, 'F');
    
    doc.setTextColor(...COLORS.white);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('S.No', margin + col1/2 - 5, yPos + 6);
    doc.text('Description', margin + col1 + 5, yPos + 6);
    doc.text('Due Date', margin + col1 + col2 + 5, yPos + 6);
    doc.text('Amount (₹)', margin + col1 + col2 + col3 + 5, yPos + 6);
    yPos += 10;
    
    // Table row
    doc.setFillColor(...COLORS.white);
    doc.setDrawColor(...COLORS.tableBorder);
    doc.setLineWidth(0.3);
    doc.rect(margin, yPos, tableWidth, 12, 'FD');
    
    // Vertical lines
    doc.line(margin + col1, yPos, margin + col1, yPos + 12);
    doc.line(margin + col1 + col2, yPos, margin + col1 + col2, yPos + 12);
    doc.line(margin + col1 + col2 + col3, yPos, margin + col1 + col2 + col3, yPos + 12);
    
    doc.setTextColor(...COLORS.dark);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('1', margin + col1/2 - 2, yPos + 7);
    // Map fee type to display name
    const feeTypeDisplay = (() => {
      const type = fee.type || fee.feeType;
      if (!type) return 'Monthly Fees';
      const typeMap: Record<string, string> = {
        'TUITION': 'Monthly Fees',
        'EXAMINATION': 'Examination Fees',
        'TRANSPORT': 'Transport Fees',
        'LIBRARY': 'Library Fees',
        'LABORATORY': 'Laboratory Fees',
        'MISCELLANEOUS': 'Miscellaneous Fees'
      };
      return typeMap[type] || type;
    })();
    doc.text(safeString(feeTypeDisplay), margin + col1 + 5, yPos + 7);
    doc.text(fee.dueDate ? formatDate(fee.dueDate) : 'N/A', margin + col1 + col2 + 5, yPos + 7);
    
    doc.setFont('helvetica', 'bold');
    doc.text(formatCurrency(fee.amount).replace('₹', '').trim(), margin + col1 + col2 + col3 + 5, yPos + 7);
    yPos += 12;
    
    // Total row
    doc.setFillColor(...COLORS.light);
    doc.rect(margin, yPos, tableWidth, 12, 'FD');
    doc.line(margin + col1 + col2 + col3, yPos, margin + col1 + col2 + col3, yPos + 12);
    
    doc.setTextColor(...COLORS.primary);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL', margin + col1 + col2 + 5, yPos + 8);
    doc.text(formatCurrency(fee.amount).replace('₹', '').trim(), margin + col1 + col2 + col3 + 5, yPos + 8);
    yPos += 15;
    
    // Amount in words
    doc.setFillColor(...COLORS.tableRowAlt);
    doc.rect(margin, yPos, tableWidth, 10, 'F');
    doc.setTextColor(...COLORS.secondary);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Amount in Words:', margin + 5, yPos + 6);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(...COLORS.dark);
    const amountWords = numberToWords(fee.amount);
    const truncatedWords = amountWords.length > 70 ? amountWords.substring(0, 67) + '...' : amountWords;
    doc.text(truncatedWords, margin + 38, yPos + 6);
    yPos += 15;
    
    return yPos;
  };

  // Draw payment status
  const drawPaymentStatus = (yPos: number): number => {
    // Section header
    doc.setFillColor(...COLORS.primary);
    doc.rect(margin, yPos, pageWidth - 2 * margin, 8, 'F');
    doc.setTextColor(...COLORS.white);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('PAYMENT STATUS', margin + 5, yPos + 5.5);
    yPos += 12;
    
    const statusColor = fee.status === FeeStatus.PAID ? COLORS.success : 
                       fee.status === FeeStatus.PENDING ? COLORS.warning : COLORS.danger;
    
    // Status box
    doc.setFillColor(...COLORS.light);
    doc.setDrawColor(...COLORS.tableBorder);
    doc.rect(margin, yPos, pageWidth - 2 * margin, 28, 'FD');
    
    // Status badge
    doc.setFillColor(...statusColor);
    doc.roundedRect(margin + 5, yPos + 4, 40, 8, 2, 2, 'F');
    doc.setTextColor(...COLORS.white);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    const statusText = safeString(fee.status).toUpperCase();
    doc.text(statusText, margin + 25 - doc.getTextWidth(statusText)/2, yPos + 9);
    
    // Payment details (if paid)
    if (fee.status === FeeStatus.PAID) {
      doc.setTextColor(...COLORS.dark);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      
      doc.setFont('helvetica', 'bold');
      doc.text('Payment Date:', margin + 50, yPos + 9);
      doc.setFont('helvetica', 'normal');
      // Use paymentDate (correct field name from database schema)
      doc.text(fee.paymentDate ? formatDate(fee.paymentDate) : formatDate(new Date()), margin + 80, yPos + 9);
      
      doc.setFont('helvetica', 'bold');
      doc.text('Payment Mode:', margin + 5, yPos + 20);
      doc.setFont('helvetica', 'normal');
      // Use paymentMethod (correct field name from database schema)
      doc.text(safeString(fee.paymentMethod || 'Cash'), margin + 35, yPos + 20);
      
      if (fee.receiptNumber) {
        doc.setFont('helvetica', 'bold');
        doc.text('Receipt No:', margin + 80, yPos + 20);
        doc.setFont('helvetica', 'normal');
        doc.text(safeString(fee.receiptNumber), margin + 105, yPos + 20);
      }
    }
    yPos += 33;
    
    return yPos;
  };

  // Draw bank details
  const drawBankDetails = (yPos: number): number => {
    // Section header
    doc.setFillColor(...COLORS.primary);
    doc.rect(margin, yPos, pageWidth - 2 * margin, 8, 'F');
    doc.setTextColor(...COLORS.white);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('BANK DETAILS FOR ONLINE PAYMENT', margin + 5, yPos + 5.5);
    yPos += 10;
    
    // Bank details box
    doc.setFillColor(...COLORS.light);
    doc.setDrawColor(...COLORS.tableBorder);
    doc.rect(margin, yPos, pageWidth - 2 * margin, 32, 'FD');
    
    const bankDetails = [
      { label: 'Bank Name:', value: SCHOOL_INFO.bankDetails.bankName },
      { label: 'Account Name:', value: SCHOOL_INFO.bankDetails.accountName },
      { label: 'Account Number:', value: SCHOOL_INFO.bankDetails.accountNumber },
      { label: 'IFSC Code:', value: SCHOOL_INFO.bankDetails.ifscCode },
      { label: 'Branch:', value: SCHOOL_INFO.bankDetails.branch },
    ];
    
    let detailY = yPos + 6;
    const colWidth = (pageWidth - 2 * margin) / 2;
    
    bankDetails.forEach((detail, index) => {
      const xPos = index % 2 === 0 ? margin + 5 : margin + colWidth + 5;
      if (index > 0 && index % 2 === 0) detailY += 8;
      
      doc.setTextColor(...COLORS.secondary);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text(detail.label, xPos, detailY);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...COLORS.dark);
      doc.text(detail.value, xPos + 28, detailY);
    });
    yPos += 38;
    
    return yPos;
  };

  // Draw signature section
  const drawSignatures = (yPos: number): number => {
    const colWidth = (pageWidth - 2 * margin) / 3;
    
    // Signature lines
    doc.setDrawColor(...COLORS.dark);
    doc.setLineWidth(0.3);
    
    // Parent signature
    doc.line(margin, yPos + 15, margin + colWidth - 10, yPos + 15);
    doc.setTextColor(...COLORS.secondary);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Parent/Guardian Signature', margin, yPos + 20);
    
    // Accountant signature
    doc.line(margin + colWidth + 5, yPos + 15, margin + 2 * colWidth - 5, yPos + 15);
    doc.text('Accountant', margin + colWidth + 15, yPos + 20);
    doc.setFontSize(7);
    doc.text(SCHOOL_INFO.accountantName, margin + colWidth + 12, yPos + 25);
    
    // Principal/Authorized signature
    doc.line(margin + 2 * colWidth + 10, yPos + 15, pageWidth - margin, yPos + 15);
    doc.setFontSize(8);
    doc.text('Authorized Signatory', margin + 2 * colWidth + 18, yPos + 20);
    
    yPos += 30;
    return yPos;
  };

  // Draw terms and conditions
  const drawTerms = (yPos: number): number => {
    doc.setFillColor(...COLORS.tableRowAlt);
    doc.rect(margin, yPos, pageWidth - 2 * margin, 6, 'F');
    doc.setTextColor(...COLORS.secondary);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('Terms & Conditions', margin + 3, yPos + 4);
    yPos += 8;
    
    doc.setTextColor(...COLORS.dark);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    FEE_RECEIPT_TERMS.forEach((term, index) => {
      doc.text(term, margin + 3, yPos);
      yPos += 5;
    });
    
    return yPos;
  };

  // Draw footer
  const drawFooter = () => {
    const footerY = pageHeight - 12;
    
    // Footer line
    doc.setDrawColor(...COLORS.primary);
    doc.setLineWidth(0.5);
    doc.line(margin, footerY - 3, pageWidth - margin, footerY - 3);
    
    // Footer text
    doc.setTextColor(...COLORS.secondary);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text('This is a computer-generated receipt and does not require a physical signature.', margin, footerY + 2);
    doc.text(SCHOOL_INFO.website, pageWidth - margin - doc.getTextWidth(SCHOOL_INFO.website), footerY + 2);
    
    // Thank you message
    doc.setTextColor(...COLORS.primary);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    const thankYou = 'Thank you for your payment!';
    doc.text(thankYou, (pageWidth - doc.getTextWidth(thankYou)) / 2, footerY - 8);
  };

  // Build the PDF
  drawHeader();
  yPosition = 55;
  yPosition = drawReceiptTitle(yPosition);
  yPosition = drawReceiptInfo(yPosition);
  yPosition = drawStudentInfo(yPosition);
  yPosition = drawFeeDetails(yPosition);
  yPosition = drawPaymentStatus(yPosition);
  yPosition = drawBankDetails(yPosition);
  yPosition = drawSignatures(yPosition);
  yPosition = drawTerms(yPosition);
  drawFooter();

  // Save the PDF
  const receiptNumber = generateReceiptNumber(fee);
  const fileName = `Fee_Receipt_${receiptNumber.replace(/\//g, '_')}.pdf`;
  doc.save(fileName);
};

export const generateProfilePDF = async (student: any, profile: any) => {
  // Initialize PDF
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
    putOnlyUsedFonts: true
  });

  // Set default font to Calibri
  doc.setFont("calibri", "normal");

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  let yPosition = margin;

  // Helper functions
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

  // Add school header - skip logo if not available
  yPosition += 5;
  
  // School Name with larger font
  doc.setFillColor(255, 255, 255); // Set header background color to white
  doc.rect(0, 0, pageWidth, 40, 'F'); // Header rectangle

  // Set text color to black
  doc.setTextColor(0, 0, 0);
  addCenteredText(SCHOOL_INFO.name.toUpperCase(), yPosition, 22, 'bold');
  yPosition += 8;
  
  // School contact details
  doc.setTextColor(60, 60, 60);
  addCenteredText(SCHOOL_INFO.address, yPosition, 11);
  yPosition += 6;
  
  addCenteredText(`Tel: ${SCHOOL_INFO.phone} | Email: ${SCHOOL_INFO.email}`, yPosition, 10);
  yPosition += 6;
  
  addCenteredText(`Website: ${SCHOOL_INFO.website}`, yPosition, 10);
  yPosition += 15;

  // Reset text color
  doc.setTextColor(0, 0, 0);

  // Title
  doc.setDrawColor(0);
  doc.setFillColor(240, 240, 255);
  doc.rect(margin, yPosition, pageWidth - 2 * margin, 10, 'F');
  addCenteredText('STUDENT PROFILE', yPosition + 7, 14, 'bold');
  yPosition += 20;

  // Student Details
  const detailsStartX = margin + 5;
  const labelWidth = 50;
  
  // Personal Information Section
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

  // Academic Information Section
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

  // Footer
  const footerY = pageHeight - 25;
  doc.line(margin, footerY, pageWidth - margin, footerY);
  
  addText('Principal:', margin, footerY + 10, 10);
  addText(SCHOOL_INFO.principalName, margin + 20, footerY + 10, 10);
  
  addText('Generated on:', pageWidth - margin - 80, footerY + 10, 8);
  addText(formatDate(new Date()), pageWidth - margin - 40, footerY + 10, 8);

  // Bottom line with website
  const bottomY = pageHeight - 10;
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  addCenteredText(SCHOOL_INFO.website, bottomY);

  // Save the PDF
  const fileName = `${student.admissionNumber}_profile_${format(new Date(), 'yyyyMMdd')}.pdf`;
  doc.save(fileName);
};