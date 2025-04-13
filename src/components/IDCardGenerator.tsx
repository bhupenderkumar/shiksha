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
                className="id-card bg-white flex flex-col items-center"
                style={{
                  width: '100%',
                  height: '100%',
                  minHeight: '350px',
                  maxWidth: '100%',
                  backgroundImage: 'linear-gradient(to bottom right, rgba(219, 234, 254, 0.3), rgba(191, 219, 254, 0.3))',
                  backgroundSize: 'cover',
                  border: '1px solid #ccc',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  position: 'relative'
                }}
              >
                {/* School Header */}
                <div className="w-full text-center mb-3 sm:mb-4 bg-gradient-to-r from-blue-700 to-blue-500 text-white py-2 sm:py-3 px-3 shadow-md">
                  <h2 className="text-base sm:text-xl font-bold tracking-wide">{SCHOOL_INFO.name}</h2>
                  <p className="text-[10px] sm:text-xs">{SCHOOL_INFO.address}</p>
                </div>

                {/* Watermark */}
                <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                  <h1 className="text-9xl font-bold transform rotate-45">{SCHOOL_INFO.name}</h1>
                </div>

                <div className="relative z-10 w-full px-3 sm:px-4">
                  <div className="bg-blue-100 text-blue-800 text-center py-1 rounded-md mb-3">
                    <h3 className="text-base sm:text-lg font-bold tracking-wider">STUDENT ID CARD</h3>
                  </div>

                {/* Student Photo */}
                <div className="mb-3 sm:mb-4 border-2 border-blue-300 p-1 rounded-md shadow-sm bg-white">
                  <img
                    src={data.studentPhoto as string}
                    alt="Student"
                    className="w-24 sm:w-32 h-32 sm:h-40 object-cover rounded-sm"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/128x160?text=No+Photo';
                    }}
                  />
                </div>

                {/* Student Details */}
                <div className="w-full space-y-2 text-sm sm:text-base bg-white rounded-lg p-3 border border-blue-200 shadow-sm">
                  <div className="flex justify-between border-b border-gray-100 pb-1">
                    <span className="font-semibold text-gray-700">Name:</span>
                    <span className="text-right font-medium">{data.studentName}</span>
                  </div>
                  
                  {data.dateOfBirth && (
                    <div className="flex justify-between border-b border-gray-100 pb-1">
                      <span className="font-semibold text-gray-700">Date of Birth:</span>
                      <span className="text-right">
                        {new Date(data.dateOfBirth).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex justify-between border-b border-gray-100 pb-1">
                    <span className="font-semibold text-gray-700">Class:</span>
                    <span className="text-right">{data.className} {data.section}</span>
                  </div>
                  
                  {data.admissionNumber && (
                    <div className="flex justify-between border-b border-gray-100 pb-1">
                      <span className="font-semibold text-gray-700">Admission No:</span>
                      <span className="text-right">{data.admissionNumber}</span>
                    </div>
                  )}
                </div>
                </div>

                {/* School Contact */}
                <div className="mt-auto w-full text-center text-[10px] sm:text-xs pt-3 sm:pt-4 border-t border-blue-200 mt-3 sm:mt-4 bg-gradient-to-r from-blue-50 to-blue-100 py-2">
                  <p className="font-medium">{SCHOOL_INFO.phone} | {SCHOOL_INFO.email}</p>
                  <p>{SCHOOL_INFO.website}</p>
                  <p className="text-[8px] mt-1 text-blue-600">ID Card valid for Academic Year 2025-26</p>
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
                className="id-card bg-white flex flex-col items-center"
                style={{
                  width: '100%',
                  height: '100%',
                  minHeight: '350px',
                  maxWidth: '100%',
                  backgroundImage: 'linear-gradient(to bottom right, rgba(219, 234, 254, 0.3), rgba(191, 219, 254, 0.3))',
                  backgroundSize: 'cover',
                  border: '1px solid #ccc',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  position: 'relative'
                }}
              >
                {/* School Header */}
                <div className="w-full text-center mb-3 sm:mb-4 bg-gradient-to-r from-blue-700 to-blue-500 text-white py-2 sm:py-3 px-3 shadow-md">
                  <h2 className="text-base sm:text-xl font-bold tracking-wide">{SCHOOL_INFO.name}</h2>
                  <p className="text-[10px] sm:text-xs">Parent Information</p>
                </div>

                {/* Watermark */}
                <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                  <h1 className="text-9xl font-bold transform rotate-45">{SCHOOL_INFO.name}</h1>
                </div>

                <div className="relative z-10 w-full px-3 sm:px-4">
                  <div className="bg-blue-100 text-blue-800 text-center py-1 rounded-md mb-3">
                    <h3 className="text-base sm:text-lg font-bold tracking-wider">PARENT ID CARD</h3>
                  </div>
                </div>

                {/* Parent Photos */}
                <div className="flex justify-center space-x-4 sm:space-x-6 mb-3 sm:mb-4">
                  <div className="flex flex-col items-center">
                    <div className="border-2 border-blue-300 p-1 rounded-md shadow-sm bg-white">
                      <img
                        src={data.fatherPhoto as string}
                        alt="Father"
                        className="w-20 sm:w-24 h-24 sm:h-32 object-cover rounded-sm"
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/96x128?text=No+Photo';
                        }}
                      />
                    </div>
                    <span className="text-xs sm:text-sm mt-1 bg-blue-100 px-3 py-0.5 rounded-full text-blue-800 font-medium">Father</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="border-2 border-blue-300 p-1 rounded-md shadow-sm bg-white">
                      <img
                        src={data.motherPhoto as string}
                        alt="Mother"
                        className="w-20 sm:w-24 h-24 sm:h-32 object-cover rounded-sm"
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/96x128?text=No+Photo';
                        }}
                      />
                    </div>
                    <span className="text-xs sm:text-sm mt-1 bg-blue-100 px-3 py-0.5 rounded-full text-blue-800 font-medium">Mother</span>
                  </div>
                </div>

                {/* Parent Details */}
                <div className="w-full space-y-2 text-xs sm:text-sm bg-white rounded-lg p-3 border border-blue-200 shadow-sm">
                  <div className="flex justify-between border-b border-gray-100 pb-1">
                    <span className="font-semibold text-gray-700">Father's Name:</span>
                    <span className="text-right font-medium">{data.fatherName}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 pb-1">
                    <span className="font-semibold text-gray-700">Mother's Name:</span>
                    <span className="text-right font-medium">{data.motherName}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 pb-1">
                    <span className="font-semibold text-gray-700">Father's Contact:</span>
                    <span className="text-right">{data.fatherMobile}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 pb-1">
                    <span className="font-semibold text-gray-700">Mother's Contact:</span>
                    <span className="text-right">{data.motherMobile}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 pb-1">
                    <span className="font-semibold text-gray-700">Address:</span>
                    <span className="text-right max-w-[60%] break-words">{data.address}</span>
                  </div>
                </div>

                {/* Student Name Reference */}
                <div className="mt-3 sm:mt-4 w-full text-center bg-blue-50 rounded-md p-2 border border-blue-100">
                  <p className="font-semibold text-xs sm:text-sm text-blue-800">Parent of: {data.studentName}</p>
                  <p className="text-xs text-blue-700">Class: {data.className} {data.section}</p>
                  {data.dateOfBirth && (
                    <p className="text-xs text-blue-700">Date of Birth: {new Date(data.dateOfBirth).toLocaleDateString('en-IN')}</p>
                  )}
                </div>

                {/* School Contact */}
                <div className="mt-auto w-full text-center text-[10px] sm:text-xs pt-3 sm:pt-4 border-t border-blue-200 mt-3 sm:mt-4 bg-gradient-to-r from-blue-50 to-blue-100 py-2">
                  <p className="font-medium">{SCHOOL_INFO.phone} | {SCHOOL_INFO.email}</p>
                  <p>{SCHOOL_INFO.website}</p>
                  <p className="text-[8px] mt-1 text-blue-600">ID Card valid for Academic Year 2025-26</p>
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