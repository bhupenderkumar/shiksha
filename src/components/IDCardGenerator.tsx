import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, Printer } from 'lucide-react';
import { IDCardData } from '@/types/idCard';
import { idCardService } from '@/backend/idCardService';
import { toast } from 'react-hot-toast';
import { SCHOOL_INFO } from '@/lib/constants';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface IDCardGeneratorProps {
  data: IDCardData;
  idCardId: string;
}

export const IDCardGenerator: React.FC<IDCardGeneratorProps> = ({ data, idCardId }) => {
  const [downloading, setDownloading] = useState(false);
  
  // Add print styles
  useEffect(() => {
    // Create style element
    const style = document.createElement('style');
    style.innerHTML = `
      @media print {
        body * {
          visibility: hidden;
        }
        .id-card, .id-card * {
          visibility: visible;
        }
        .id-card {
          position: absolute;
          left: 0;
          top: 0;
          width: 105mm;
          height: 148mm;
        }
      }
    `;
    
    // Append to head
    document.head.appendChild(style);
    
    // Clean up on unmount
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  const studentCardRef = useRef<HTMLDivElement>(null);
  const parentCardRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    try {
      setDownloading(true);
      
      if (!studentCardRef.current || !parentCardRef.current) {
        toast.error('Could not generate ID card');
        return;
      }

      // Create a new PDF document
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a6', // 105 x 148 mm
      });

      // Capture student card
      const studentCanvas = await html2canvas(studentCardRef.current, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
      });

      // Add student card to PDF
      const studentImgData = studentCanvas.toDataURL('image/jpeg', 1.0);
      pdf.addImage(studentImgData, 'JPEG', 0, 0, 105, 148);

      // Add new page for parent card
      pdf.addPage();

      // Capture parent card
      const parentCanvas = await html2canvas(parentCardRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
      });

      // Add parent card to PDF
      const parentImgData = parentCanvas.toDataURL('image/jpeg', 1.0);
      pdf.addImage(parentImgData, 'JPEG', 0, 0, 105, 148);

      // Save the PDF
      pdf.save(`${data.studentName.replace(/\s+/g, '_')}_ID_Card.pdf`);

      // Increment download count
      await idCardService.incrementDownloadCount(idCardId);
      
      toast.success('ID card downloaded successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF');
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h2 className="text-lg sm:text-xl font-bold">ID Card Preview</h2>
        <div className="flex w-full sm:w-auto space-x-2">
          <Button
            onClick={handleDownload}
            disabled={downloading}
            className="print:hidden flex-1 sm:flex-none text-xs sm:text-sm py-1 sm:py-2 h-auto"
          >
            <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            {downloading ? 'Generating...' : 'Download PDF'}
          </Button>
          <Button
            variant="outline"
            onClick={handlePrint}
            className="print:hidden flex-1 sm:flex-none text-xs sm:text-sm py-1 sm:py-2 h-auto"
          >
            <Printer className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            Print
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
        {/* Student ID Card (Front) */}
        <div className="print:w-[105mm] print:h-[148mm]">
          <Card className="overflow-hidden shadow-md">
            <CardContent className="p-0">
              <div
                ref={studentCardRef}
                className="id-card bg-white p-3 sm:p-4 flex flex-col items-center"
                style={{ width: '100%', height: '100%', minHeight: '350px', maxWidth: '100%' }}
              >
                {/* School Header */}
                <div className="w-full text-center mb-3 sm:mb-4 bg-blue-600 text-white py-1 sm:py-2">
                  <h2 className="text-base sm:text-xl font-bold">{SCHOOL_INFO.name}</h2>
                  <p className="text-[10px] sm:text-xs">{SCHOOL_INFO.address}</p>
                </div>

                <h3 className="text-base sm:text-lg font-bold mb-2">STUDENT ID CARD</h3>

                {/* Student Photo */}
                <div className="mb-3 sm:mb-4 border-2 border-gray-300 p-1">
                  <img
                    src={data.studentPhoto as string}
                    alt="Student"
                    className="w-24 sm:w-32 h-32 sm:h-40 object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/128x160?text=No+Photo';
                    }}
                  />
                </div>

                {/* Student Details */}
                <div className="w-full space-y-1 sm:space-y-2 text-sm sm:text-base">
                  <div className="flex justify-between">
                    <span className="font-semibold">Name:</span>
                    <span className="text-right">{data.studentName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Class:</span>
                    <span>{data.className} {data.section}</span>
                  </div>
                  {data.admissionNumber && (
                    <div className="flex justify-between">
                      <span className="font-semibold">Admission No:</span>
                      <span>{data.admissionNumber}</span>
                    </div>
                  )}
                </div>

                {/* School Contact */}
                <div className="mt-auto w-full text-center text-[10px] sm:text-xs pt-3 sm:pt-4 border-t border-gray-200 mt-3 sm:mt-4">
                  <p>{SCHOOL_INFO.phone} | {SCHOOL_INFO.email}</p>
                  <p>{SCHOOL_INFO.website}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Parent ID Card (Back) */}
        <div className="print:w-[105mm] print:h-[148mm]">
          <Card className="overflow-hidden shadow-md">
            <CardContent className="p-0">
              <div
                ref={parentCardRef}
                className="id-card bg-white p-3 sm:p-4 flex flex-col items-center"
                style={{ width: '100%', height: '100%', minHeight: '350px', maxWidth: '100%' }}
              >
                {/* School Header */}
                <div className="w-full text-center mb-3 sm:mb-4 bg-blue-600 text-white py-1 sm:py-2">
                  <h2 className="text-base sm:text-xl font-bold">{SCHOOL_INFO.name}</h2>
                  <p className="text-[10px] sm:text-xs">Parent Information</p>
                </div>

                {/* Parent Photos */}
                <div className="flex justify-center space-x-3 sm:space-x-4 mb-3 sm:mb-4">
                  <div className="flex flex-col items-center">
                    <div className="border-2 border-gray-300 p-1">
                      <img
                        src={data.fatherPhoto as string}
                        alt="Father"
                        className="w-20 sm:w-24 h-24 sm:h-32 object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/96x128?text=No+Photo';
                        }}
                      />
                    </div>
                    <span className="text-xs sm:text-sm mt-1">Father</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="border-2 border-gray-300 p-1">
                      <img
                        src={data.motherPhoto as string}
                        alt="Mother"
                        className="w-20 sm:w-24 h-24 sm:h-32 object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/96x128?text=No+Photo';
                        }}
                      />
                    </div>
                    <span className="text-xs sm:text-sm mt-1">Mother</span>
                  </div>
                </div>

                {/* Parent Details */}
                <div className="w-full space-y-1 sm:space-y-2 text-xs sm:text-sm">
                  <div className="flex justify-between">
                    <span className="font-semibold">Father's Name:</span>
                    <span className="text-right">{data.fatherName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Mother's Name:</span>
                    <span className="text-right">{data.motherName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Contact:</span>
                    <span className="text-right">{data.fatherMobile}, {data.motherMobile}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Address:</span>
                    <span className="text-right max-w-[60%]">{data.address}</span>
                  </div>
                </div>

                {/* Student Name Reference */}
                <div className="mt-3 sm:mt-4 w-full text-center">
                  <p className="font-semibold text-xs sm:text-sm">Parent of: {data.studentName}</p>
                  <p className="text-xs">Class: {data.className} {data.section}</p>
                </div>

                {/* School Contact */}
                <div className="mt-auto w-full text-center text-[10px] sm:text-xs pt-3 sm:pt-4 border-t border-gray-200 mt-3 sm:mt-4">
                  <p>{SCHOOL_INFO.phone} | {SCHOOL_INFO.email}</p>
                  <p>{SCHOOL_INFO.website}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="print:hidden">
        <p className="text-xs sm:text-sm text-gray-500 px-1">
          Note: The ID card will be generated as a PDF with two pages. The first page contains the student's information, and the second page contains the parent's information.
        </p>
      </div>

      {/* Print Styles - Added via useEffect */}
    </div>
  );
};