import React, { useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StudentFeedback } from '@/types/feedback';
import { SCHOOL_INFO } from '@/lib/constants';
import { Download, Printer } from 'lucide-react';
import { toast } from 'react-hot-toast';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { LoadingSpinner } from './ui/loading-spinner';

interface StudentFeedbackCertificateProps {
  feedback: StudentFeedback;
}

export const StudentFeedbackCertificate: React.FC<StudentFeedbackCertificateProps> = ({ feedback }) => {
  const certificateRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [printing, setPrinting] = useState(false);

  // Format date
  const formattedDate = new Date().toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  // Handle certificate download
  const handleDownload = async () => {
    if (!certificateRef.current) return;

    try {
      setDownloading(true);
      toast.loading('Preparing certificate for download...', { id: 'certificate-download' });

      // Create a canvas from the certificate div
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
      });

      // Create PDF
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      // Add the canvas as an image to the PDF
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      pdf.addImage(imgData, 'JPEG', 0, 0, 297, 210); // A4 size in landscape

      // Save the PDF
      pdf.save(`${feedback.student_name}_Feedback_Certificate_${feedback.month}.pdf`);

      toast.success('Certificate downloaded successfully!', { id: 'certificate-download' });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to download certificate', { id: 'certificate-download' });
    } finally {
      setDownloading(false);
    }
  };

  // Handle certificate printing
  const handlePrint = async () => {
    if (!certificateRef.current) return;

    try {
      setPrinting(true);
      toast.loading('Preparing certificate for printing...', { id: 'certificate-print' });

      // Create a canvas from the certificate div
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
      });

      // Create a new window with just the image
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast.error('Pop-up blocked. Please allow pop-ups and try again.', { id: 'certificate-print' });
        return;
      }

      // Add the image to the new window
      printWindow.document.write(`
        <html>
          <head>
            <title>${feedback.student_name} - Feedback Certificate</title>
            <style>
              body { margin: 0; display: flex; justify-content: center; align-items: center; height: 100vh; }
              img { max-width: 100%; max-height: 100vh; }
              @media print {
                body { height: auto; }
                img { max-height: none; }
              }
            </style>
          </head>
          <body>
            <img src="${canvas.toDataURL('image/jpeg')}" />
            <script>
              setTimeout(() => {
                window.print();
                setTimeout(() => window.close(), 500);
              }, 500);
            </script>
          </body>
        </html>
      `);

      printWindow.document.close();
      toast.success('Certificate sent to printer!', { id: 'certificate-print' });
    } catch (error) {
      console.error('Error printing certificate:', error);
      toast.error('Failed to print certificate', { id: 'certificate-print' });
    } finally {
      setPrinting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2">
        <Button 
          variant="outline" 
          onClick={handlePrint} 
          disabled={printing || downloading}
        >
          {printing ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              Printing...
            </>
          ) : (
            <>
              <Printer className="h-4 w-4 mr-2" />
              Print Certificate
            </>
          )}
        </Button>
        <Button 
          onClick={handleDownload} 
          disabled={printing || downloading}
        >
          {downloading ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              Downloading...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Download Certificate
            </>
          )}
        </Button>
      </div>

      {/* Certificate Template */}
      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
        <div 
          ref={certificateRef} 
          className="p-8 bg-gradient-to-r from-blue-50 to-indigo-50"
          style={{ width: '100%', height: 'auto', aspectRatio: '1.414/1' }} // A4 aspect ratio
        >
          {/* Certificate Header */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-blue-800">{SCHOOL_INFO.name}</h1>
            <p className="text-gray-600">{SCHOOL_INFO.address}</p>
            <div className="mt-4 mx-auto w-3/4 border-b-2 border-blue-800"></div>
          </div>

          {/* Certificate Title */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-blue-900">Student Feedback Certificate</h2>
            <p className="text-lg text-gray-700 mt-1">For the Month of {feedback.month}</p>
          </div>

          {/* Student Information */}
          <div className="flex justify-between items-start mb-8">
            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-2">{feedback.student_name}</h3>
              <p className="text-gray-700">Class: {feedback.className}</p>
              <p className="text-gray-700">Attendance: {feedback.attendance_percentage}%</p>
            </div>
            
            {feedback.student_photo_url && (
              <div className="border-2 border-blue-300 p-1 rounded-md shadow-sm bg-white">
                <img
                  src={feedback.student_photo_url}
                  alt={feedback.student_name}
                  className="w-24 h-32 object-cover rounded-sm"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/96x128?text=No+Photo';
                  }}
                />
              </div>
            )}
          </div>

          {/* Feedback Content */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-2">Good Things</h4>
              <p className="text-gray-700">{feedback.good_things}</p>
            </div>
            
            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
              <h4 className="font-semibold text-amber-800 mb-2">Need to Improve</h4>
              <p className="text-gray-700">{feedback.need_to_improve}</p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-800 mb-2">Best Can Do</h4>
              <p className="text-gray-700">{feedback.best_can_do}</p>
            </div>
          </div>

          {/* Certificate Footer */}
          <div className="mt-auto">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-gray-700">Date: {formattedDate}</p>
              </div>
              <div className="text-center">
                <div className="border-t-2 border-gray-400 w-40 mt-12 mb-1"></div>
                <p className="text-gray-700">Principal's Signature</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentFeedbackCertificate;
