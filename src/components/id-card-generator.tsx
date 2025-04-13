import React, { useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Printer } from 'lucide-react';
import { IDCardData } from '@/services/idCardService';
import { jsPDF } from 'jspdf';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { SCHOOL_INFO } from '@/lib/constants';

interface IDCardGeneratorProps {
  idCard: IDCardData;
}

export function IDCardGenerator({ idCard }: IDCardGeneratorProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [85.6, 54], // Standard ID card size (credit card size)
        compress: true,
        putOnlyUsedFonts: true
      });

      // Set background color
      doc.setFillColor(240, 240, 255);
      doc.rect(0, 0, 85.6, 54, 'F');

      // Add school name at the top
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 128);
      doc.text(SCHOOL_INFO?.name || 'School Name', 42.8, 5, { align: 'center' });

      // Add "STUDENT ID CARD" text
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(0, 0, 0);
      doc.text('STUDENT ID CARD', 42.8, 10, { align: 'center' });

      // Add horizontal line
      doc.setDrawColor(0, 0, 128);
      doc.setLineWidth(0.5);
      doc.line(5, 12, 80.6, 12);

      // Add student photo if available
      if (idCard.studentPhotoUrl) {
        try {
          const img = new Image();
          img.src = idCard.studentPhotoUrl;
          await new Promise((resolve) => {
            img.onload = resolve;
          });
          doc.addImage(img, 'JPEG', 5, 15, 20, 25);
        } catch (error) {
          console.error('Error adding student photo:', error);
        }
      }

      // Add student details
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(0, 0, 0);
      doc.text('Name:', 30, 18);
      doc.text('Class:', 30, 23);
      doc.text('Father:', 30, 28);
      doc.text('Mother:', 30, 33);
      doc.text('Address:', 30, 38);

      doc.setFont('helvetica', 'normal');
      doc.text(idCard.studentName, 45, 18);
      doc.text(`${idCard.className} ${idCard.classSection}`, 45, 23);
      doc.text(idCard.fatherName, 45, 28);
      doc.text(idCard.motherName, 45, 33);
      
      // Handle multi-line address
      const addressLines = doc.splitTextToSize(idCard.address, 35);
      doc.text(addressLines, 45, 38);

      // Add contact information
      doc.setFont('helvetica', 'bold');
      doc.text('Contact:', 5, 45);
      doc.setFont('helvetica', 'normal');
      doc.text(`Father: ${idCard.fatherMobile}`, 20, 45);
      doc.text(`Mother: ${idCard.motherMobile}`, 20, 49);

      // Add footer with school contact
      doc.setDrawColor(0, 0, 128);
      doc.setLineWidth(0.5);
      doc.line(5, 51, 80.6, 51);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6);
      doc.text(SCHOOL_INFO?.address || 'School Address', 42.8, 53, { align: 'center' });

      // Save the PDF
      const fileName = `${idCard.studentName.replace(/\s+/g, '_')}_ID_Card.pdf`;
      doc.save(fileName);
      toast.success('ID Card downloaded successfully');
    } catch (error) {
      console.error('Error generating ID card PDF:', error);
      toast.error('Failed to download ID card');
    }
  };

  const handlePrint = () => {
    if (!cardRef.current) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Please allow pop-ups to print the ID card');
      return;
    }
    
    const htmlContent = `
      <html>
        <head>
          <title>Student ID Card</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
            }
            .id-card {
              width: 85.6mm;
              height: 54mm;
              border: 1px solid #ccc;
              border-radius: 5px;
              padding: 10px;
              box-shadow: 0 2px 5px rgba(0,0,0,0.1);
              background-color: #f0f0ff;
              position: relative;
            }
            .school-name {
              text-align: center;
              font-weight: bold;
              color: #000080;
              margin-bottom: 5px;
            }
            .card-title {
              text-align: center;
              font-weight: bold;
              margin-bottom: 10px;
            }
            .divider {
              border-top: 1px solid #000080;
              margin-bottom: 10px;
            }
            .card-content {
              display: flex;
            }
            .photo {
              width: 25mm;
              height: 30mm;
              border: 1px solid #ccc;
              margin-right: 10px;
              overflow: hidden;
            }
            .photo img {
              width: 100%;
              height: 100%;
              object-fit: cover;
            }
            .details {
              flex: 1;
            }
            .detail-row {
              margin-bottom: 5px;
              font-size: 12px;
            }
            .label {
              font-weight: bold;
              display: inline-block;
              width: 50px;
            }
            .contact {
              margin-top: 10px;
              font-size: 11px;
            }
            .footer {
              margin-top: 10px;
              border-top: 1px solid #000080;
              padding-top: 5px;
              font-size: 10px;
              text-align: center;
            }
            @media print {
              body {
                margin: 0;
                padding: 0;
              }
              .id-card {
                box-shadow: none;
                border: none;
              }
              .print-button {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="id-card">
            <div class="school-name">${SCHOOL_INFO?.name || 'School Name'}</div>
            <div class="card-title">STUDENT ID CARD</div>
            <div class="divider"></div>
            <div class="card-content">
              <div class="photo">
                ${idCard.studentPhotoUrl ? `<img src="${idCard.studentPhotoUrl}" alt="Student Photo" />` : ''}
              </div>
              <div class="details">
                <div class="detail-row"><span class="label">Name:</span> ${idCard.studentName}</div>
                <div class="detail-row"><span class="label">Class:</span> ${idCard.className} ${idCard.classSection}</div>
                <div class="detail-row"><span class="label">Father:</span> ${idCard.fatherName}</div>
                <div class="detail-row"><span class="label">Mother:</span> ${idCard.motherName}</div>
                <div class="detail-row"><span class="label">Address:</span> ${idCard.address}</div>
              </div>
            </div>
            <div class="contact">
              <div><strong>Contact:</strong> Father: ${idCard.fatherMobile}, Mother: ${idCard.motherMobile}</div>
            </div>
            <div class="footer">
              ${SCHOOL_INFO?.address || 'School Address'}
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() {
                window.close();
              }, 500);
            };
          </script>
        </body>
      </html>
    `;
    
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Student ID Card Preview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center space-y-6">
          {/* ID Card Preview */}
          <div 
            ref={cardRef}
            className="w-full max-w-[340px] h-[215px] border rounded-md overflow-hidden shadow-md bg-blue-50 p-4"
          >
            <div className="text-center font-bold text-blue-900 text-sm">
              {SCHOOL_INFO?.name || 'School Name'}
            </div>
            <div className="text-center font-bold text-xs mb-1">
              STUDENT ID CARD
            </div>
            <div className="border-t border-blue-900 mb-2"></div>
            
            <div className="flex">
              {/* Student Photo */}
              <div className="w-20 h-24 border overflow-hidden mr-2 bg-white flex items-center justify-center">
                {idCard.studentPhotoUrl ? (
                  <img 
                    src={idCard.studentPhotoUrl} 
                    alt="Student" 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <div className="text-xs text-gray-400">No Photo</div>
                )}
              </div>
              
              {/* Student Details */}
              <div className="flex-1 text-xs space-y-1">
                <div><span className="font-bold">Name:</span> {idCard.studentName}</div>
                <div><span className="font-bold">Class:</span> {idCard.className} {idCard.classSection}</div>
                <div><span className="font-bold">Father:</span> {idCard.fatherName}</div>
                <div><span className="font-bold">Mother:</span> {idCard.motherName}</div>
                <div><span className="font-bold">Address:</span> {idCard.address.length > 30 ? `${idCard.address.substring(0, 30)}...` : idCard.address}</div>
              </div>
            </div>
            
            {/* Contact Information */}
            <div className="mt-2 text-xs">
              <span className="font-bold">Contact:</span> Father: {idCard.fatherMobile}, Mother: {idCard.motherMobile}
            </div>
            
            {/* Footer */}
            <div className="mt-2 border-t border-blue-900 pt-1 text-center text-[10px]">
              {SCHOOL_INFO?.address || 'School Address'}
            </div>
          </div>
          
          {/* ID Card Usage Guidelines */}
          <div className="w-full max-w-[340px] text-sm text-gray-600 space-y-2">
            <h3 className="font-medium">ID Card Usage Guidelines:</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Always carry this ID card while in school premises</li>
              <li>Present this card for identification during school events</li>
              <li>Required for library book issuance</li>
              <li>Necessary for entry during parent-teacher meetings</li>
              <li>Report loss of card immediately to school administration</li>
            </ul>
          </div>
          
          {/* Action Buttons */}
          <div className="flex space-x-4">
            <Button onClick={handleDownload} className="flex items-center">
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
            <Button onClick={handlePrint} variant="outline" className="flex items-center">
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
