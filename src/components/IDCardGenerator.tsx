import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, Printer } from 'lucide-react';
import { IDCardData } from '@/services/idCardService';
import { toast } from 'react-hot-toast';
import { SCHOOL_INFO } from '@/lib/constants';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface IDCardGeneratorProps {
  data: IDCardData;
  idCardId: string;
}

export const IDCardGenerator: React.FC<IDCardGeneratorProps> = ({ data }) => {
  const studentCardRef = useRef<HTMLDivElement>(null);
  const parentCardRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!studentCardRef.current || !parentCardRef.current) {
      toast.error('Could not generate ID card. Card elements not found.');
      return;
    }

    const toastId = toast.loading('Generating PDF...');

    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a6', // 105 x 148 mm
      });

      // --- Student Card ---
      const studentCanvas = await html2canvas(studentCardRef.current, {
        scale: 3, // Increased scale for better quality
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
      });
      const studentImgData = studentCanvas.toDataURL('image/jpeg', 1.0);
      pdf.addImage(studentImgData, 'JPEG', 0, 0, 105, 148);

      // --- Parent Card ---
      pdf.addPage();
      const parentCanvas = await html2canvas(parentCardRef.current, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
      });
      const parentImgData = parentCanvas.toDataURL('image/jpeg', 1.0);
      pdf.addImage(parentImgData, 'JPEG', 0, 0, 105, 148);

      pdf.save(`${data.student_name.replace(/\s+/g, '_')}_ID_Card.pdf`);

      toast.success('ID card downloaded successfully!', { id: toastId });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF.', { id: toastId });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const renderPlaceholder = (e: React.SyntheticEvent<HTMLImageElement, Event>, text: string) => {
    (e.target as HTMLImageElement).src = `https://via.placeholder.com/128x160?text=${text}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-center gap-4">
        <Button onClick={handleDownload}>
          <Download className="mr-2 h-4 w-4" />
          Download PDF
        </Button>
        <Button variant="outline" onClick={handlePrint}>
          <Printer className="mr-2 h-4 w-4" />
          Print
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Student ID Card */}
        <Card className="overflow-hidden shadow-lg">
          <CardContent className="p-0">
            <div ref={studentCardRef} className="id-card bg-white p-4">
              <div className="text-center mb-4">
                <h2 className="text-xl font-bold text-blue-800">{SCHOOL_INFO.name}</h2>
                <p className="text-xs">{SCHOOL_INFO.address}</p>
              </div>
              <div className="flex justify-center mb-4">
                <img
                  src={data.student_photo_url || ''}
                  alt="Student"
                  className="w-32 h-40 object-cover rounded-md border-4 border-blue-200"
                  onError={(e) => renderPlaceholder(e, 'Student')}
                />
              </div>
              <div className="text-center space-y-1">
                <h3 className="text-lg font-bold">{data.student_name}</h3>
                <p>Class: {data.class_id}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Parent ID Card */}
        <Card className="overflow-hidden shadow-lg">
          <CardContent className="p-0">
            <div ref={parentCardRef} className="id-card bg-white p-4">
              <div className="text-center mb-4">
                <h2 className="text-xl font-bold text-blue-800">Parent Card</h2>
                <p className="text-sm">Guardian of: {data.student_name}</p>
              </div>
              <div className="flex justify-around mb-4">
                <div className="text-center">
                  <img
                    src={data.father_photo_url || ''}
                    alt="Father"
                    className="w-24 h-32 object-cover rounded-md border-4 border-blue-200"
                    onError={(e) => renderPlaceholder(e, 'Father')}
                  />
                  <p className="mt-2 font-semibold">Father</p>
                  <p>{data.father_name}</p>
                </div>
                <div className="text-center">
                  <img
                    src={data.mother_photo_url || ''}
                    alt="Mother"
                    className="w-24 h-32 object-cover rounded-md border-4 border-blue-200"
                    onError={(e) => renderPlaceholder(e, 'Mother')}
                  />
                  <p className="mt-2 font-semibold">Mother</p>
                  <p>{data.mother_name}</p>
                </div>
              </div>
              <div className="space-y-1 text-sm">
                <p><strong>Address:</strong> {data.address}</p>
                <p><strong>Father's Mobile:</strong> {data.father_mobile}</p>
                <p><strong>Mother's Mobile:</strong> {data.mother_mobile}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};