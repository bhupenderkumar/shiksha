import React, { useRef, useState, useEffect } from 'react';
import { ParentFeedback } from '@/types/parentFeedback';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { SCHOOL_INFO } from '@/lib/constants';
import { isSupabaseSignedUrl } from '@/lib/supabase-helpers';
import { Download, Printer } from 'lucide-react';
import { toast } from 'react-hot-toast';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { parentFeedbackService } from '@/services/parentFeedbackService';
import { v4 as uuidv4 } from 'uuid';

interface ParentFeedbackCertificateProps {
  feedback: ParentFeedback;
  certificateId?: string;
}

export const ParentFeedbackCertificate: React.FC<ParentFeedbackCertificateProps> = ({
  feedback,
  certificateId
}) => {
  const certificateRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [generatedCertificateId] = useState(() => certificateId || `CERT-${uuidv4().substring(0, 8)}`);
  // We don't need these state variables anymore since we're using the getValidImageUrl function
  // directly in the render

  // Log image URLs for debugging
  useEffect(() => {
    if (!feedback) return;

    console.log('Certificate feedback data:', {
      studentPhotoUrl: feedback.student_photo_url ? 'Found' : 'Not found',
      fatherPhotoUrl: feedback.father_photo_url ? 'Found' : 'Not found',
      motherPhotoUrl: feedback.mother_photo_url ? 'Found' : 'Not found'
    });

    // Log the actual URLs for debugging
    if (feedback.student_photo_url) {
      console.log('Student photo URL:', feedback.student_photo_url);
      console.log('Processed student photo URL:', getValidImageUrl(feedback.student_photo_url));
    }

    if (feedback.father_photo_url) {
      console.log('Father photo URL:', feedback.father_photo_url);
      console.log('Processed father photo URL:', getValidImageUrl(feedback.father_photo_url));
    }

    if (feedback.mother_photo_url) {
      console.log('Mother photo URL:', feedback.mother_photo_url);
      console.log('Processed mother photo URL:', getValidImageUrl(feedback.mother_photo_url));
    }
  }, [feedback]);

  // Check if feedback is valid
  if (!feedback || !feedback.student_name || !feedback.className) {
    console.log("Invalid feedback data:", feedback);
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="text-center text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-medium mb-2">Certificate Unavailable</h3>
          <p className="mb-4">No valid feedback data found to generate a certificate.</p>
          <p className="text-sm">Please search for a student with feedback records.</p>
        </div>
      </div>
    );
  }

  // Helper function to show placeholder when image fails to load
  const showPlaceholder = (imgElement: HTMLImageElement) => {
    console.log('Showing placeholder for image:', imgElement.src);
    console.log('Image parent element:', imgElement.parentElement);

    imgElement.style.display = 'none';
    imgElement.parentElement!.classList.add('flex', 'items-center', 'justify-center', 'bg-gray-100');

    const fallback = document.createElement('div');
    fallback.className = 'text-gray-400 text-center';
    fallback.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg><p class="text-xs mt-0.5">Photo</p>`;

    imgElement.parentElement!.appendChild(fallback);
    console.log('Placeholder added to parent element');

    // Don't set image load error as we want to allow downloads even if some images fail
  };

  // Helper function to get a valid image URL
  const getValidImageUrl = (url: string | null): string | null => {
    if (!url) return null;

    // If it's already a public URL, return it as is
    if (url.includes('/storage/v1/object/public/')) {
      console.log('URL is already a public URL:', url);
      return url;
    }

    // If it's a signed URL (works with both cloud and self-hosted), extract the path and create a public URL
    if (isSupabaseSignedUrl(url)) {
      console.log('Converting signed URL to public URL');
      const pathMatch = url.match(/\/File\/(.+?)\?/);
      if (pathMatch && pathMatch[1]) {
        const filePath = pathMatch[1];
        const publicUrl = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/File/${filePath}`;
        console.log('Converted to public URL:', publicUrl);
        return publicUrl;
      }
    }

    // If it's a relative path, convert to absolute public URL
    if (!url.startsWith('http')) {
      const publicUrl = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/File/${url}`;
      console.log('Converted relative path to public URL:', publicUrl);
      return publicUrl;
    }

    // Return the original URL if we couldn't convert it
    return url;
  };

  const handleDownload = async () => {
    if (!certificateRef.current) return;

    try {
      setDownloading(true);
      toast.loading('Preparing certificate for download...', { id: 'certificate-download' });

      console.log('Starting certificate download process');
      console.log('Certificate ref current:', certificateRef.current);

      // Log all images in the certificate
      const images = certificateRef.current.querySelectorAll('img');
      console.log(`Found ${images.length} images in certificate`);
      images.forEach((img, index) => {
        console.log(`Image ${index + 1}:`, {
          src: img.src,
          width: img.width,
          height: img.height,
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
          complete: img.complete,
          alt: img.alt
        });
      });

      // Create a canvas from the certificate div
      console.log('Creating canvas from certificate div');

      // First, make a clone of the certificate element to modify it for PDF generation
      const certificateClone = certificateRef.current.cloneNode(true) as HTMLElement;

      // Apply specific styles for PDF generation
      certificateClone.style.width = '210mm'; // A4 width
      certificateClone.style.height = 'auto';
      certificateClone.style.padding = '15mm 10mm'; // Add some padding
      certificateClone.style.boxSizing = 'border-box';
      certificateClone.style.position = 'absolute';
      certificateClone.style.left = '-9999px';
      certificateClone.style.top = '-9999px';

      // Append to body temporarily
      document.body.appendChild(certificateClone);

      // Create canvas from the clone
      const canvas = await html2canvas(certificateClone, {
        scale: 1.5, // Reduced scale to ensure it fits on one page
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: true, // Enable logging
        onclone: (document) => {
          console.log('Document cloned for canvas rendering');
          const clonedImages = document.querySelectorAll('img');
          console.log(`Found ${clonedImages.length} images in cloned document`);
          clonedImages.forEach((img, index) => {
            console.log(`Cloned Image ${index + 1}:`, {
              src: img.src,
              width: img.width,
              height: img.height,
              naturalWidth: img.naturalWidth,
              naturalHeight: img.naturalHeight,
              complete: img.complete,
              alt: img.alt
            });
          });
        }
      });

      // Remove the clone after rendering
      document.body.removeChild(certificateClone);

      console.log('Canvas created:', {
        width: canvas.width,
        height: canvas.height
      });

      // Create a new PDF document
      console.log('Creating PDF document');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // Calculate dimensions to fit on one page
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      console.log('PDF dimensions:', {
        imgWidth,
        imgHeight,
        finalHeight: Math.min(imgHeight, 297)
      });

      // Add the canvas as an image to the PDF, ensuring it fits on one page
      console.log('Converting canvas to image data');
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      console.log('Image data created, adding to PDF');
      pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, Math.min(imgHeight, 297));

      // Save the PDF
      pdf.save(`${feedback.student_name}_${feedback.month}_Certificate.pdf`);

      // Increment download count if certificateId is provided
      if (certificateId) {
        await parentFeedbackService.incrementDownloadCount(certificateId);
      }

      toast.success('Certificate downloaded successfully', { id: 'certificate-download' });
    } catch (error) {
      console.error('Error downloading certificate:', error);
      toast.error('Failed to download certificate', { id: 'certificate-download' });
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = async () => {
    if (!certificateRef.current) return;

    try {
      setPrinting(true);
      toast.loading('Preparing certificate for printing...', { id: 'certificate-print' });

      // Create a canvas from the certificate div using the same approach as download
      // First, make a clone of the certificate element to modify it for printing
      const certificateClone = certificateRef.current.cloneNode(true) as HTMLElement;

      // Apply specific styles for printing
      certificateClone.style.width = '210mm'; // A4 width
      certificateClone.style.height = 'auto';
      certificateClone.style.padding = '15mm 10mm'; // Add some padding
      certificateClone.style.boxSizing = 'border-box';
      certificateClone.style.position = 'absolute';
      certificateClone.style.left = '-9999px';
      certificateClone.style.top = '-9999px';

      // Append to body temporarily
      document.body.appendChild(certificateClone);

      // Create canvas from the clone
      const canvas = await html2canvas(certificateClone, {
        scale: 1.5, // Reduced scale to ensure it fits on one page
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
      });

      // Remove the clone after rendering
      document.body.removeChild(certificateClone);

      // Create a new window with just the image
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast.error('Pop-up blocked. Please allow pop-ups and try again.', { id: 'certificate-print' });
        return;
      }

      // Create HTML content for the print window
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>${feedback.student_name} - Certificate</title>
            <style>
              body {
                margin: 0;
                padding: 0;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
              }
              img {
                max-width: 100%;
                max-height: 100vh;
              }
              @media print {
                @page {
                  size: A4 portrait;
                  margin: 0;
                }
                body {
                  height: auto;
                  margin: 0;
                }
                img {
                  width: 100%;
                  height: auto;
                  page-break-after: avoid;
                  page-break-inside: avoid;
                }
              }
            </style>
          </head>
          <body>
            <img src="${canvas.toDataURL('image/jpeg', 0.95)}" />
            <script>
              window.onload = function() {
                setTimeout(function() {
                  window.print();
                  window.close();
                }, 500);
              };
            </script>
          </body>
        </html>
      `;

      // Set the document content in a safer way
      printWindow.document.open();
      // Use document.write but suppress the TypeScript warning
      (printWindow.document as any).write(htmlContent);
      printWindow.document.close();
      toast.success('Certificate sent to printer', { id: 'certificate-print' });
    } catch (error) {
      console.error('Error printing certificate:', error);
      toast.error('Failed to print certificate', { id: 'certificate-print' });
    } finally {
      setPrinting(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="mb-4 flex flex-col sm:flex-row gap-2">
        <Button
          onClick={handleDownload}
          disabled={downloading}
          className="flex items-center justify-center gap-1 bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
          title="Download certificate as PDF"
        >
          <Download className="h-4 w-4" />
          {downloading ? 'Downloading...' : 'Download Certificate'}
        </Button>
        <Button
          onClick={handlePrint}
          disabled={printing}
          variant="outline"
          className="flex items-center justify-center gap-1 w-full sm:w-auto"
          title="Print certificate"
        >
          <Printer className="h-4 w-4" />
          {printing ? 'Printing...' : 'Print Certificate'}
        </Button>
      </div>

      <Card className="w-full max-w-4xl border-2 border-blue-200 shadow-lg">
        <CardContent className="p-0">
          <div
            ref={certificateRef}
            className="certificate bg-white p-4 sm:p-4"
            style={{
              backgroundImage: 'linear-gradient(to bottom right, rgba(219, 234, 254, 0.2), rgba(191, 219, 254, 0.2))',
              backgroundSize: 'cover',
              width: '100%',
              position: 'relative',
              fontFamily: 'Arial, sans-serif',
              borderRadius: '8px',
              border: '2px double #4682B4',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
              overflow: 'hidden',
              maxHeight: '100%', // Allow full height on mobile
              minHeight: '100%',
              fontSize: '14px', // Base font size for better mobile readability
            }}
          >
            {/* Decorative elements */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '8px',
                background: 'linear-gradient(90deg, #4682B4, #87CEEB, #4682B4)',
                opacity: 0.7,
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '8px',
                background: 'linear-gradient(90deg, #4682B4, #87CEEB, #4682B4)',
                opacity: 0.7,
              }}
            />
            {/* School Header */}
            <div className="text-center mb-2 sm:mb-3 mt-2">
              <h1 className="text-xl sm:text-2xl font-bold text-blue-800 mb-0.5" style={{ textShadow: '1px 1px 1px rgba(0,0,0,0.1)' }}>
                {SCHOOL_INFO?.name || 'School Name'}
              </h1>
              <p className="text-xs sm:text-sm text-gray-600">{SCHOOL_INFO?.address || 'School Address'}</p>
              <div className="w-20 sm:w-24 h-0.5 bg-gradient-to-r from-blue-300 via-blue-500 to-blue-300 mx-auto mt-1 sm:mt-2 rounded-full"></div>
            </div>

            {/* Family Photos Row */}
            <div className="flex justify-center items-center gap-3 mb-3 mt-2">
              {/* Father Photo */}
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 border-2 border-blue-300 overflow-hidden rounded-full shadow-md">
                  {feedback.father_photo_url ? (
                    <img
                      src={getValidImageUrl(feedback.father_photo_url) || feedback.father_photo_url}
                      alt="Father"
                      className="w-full h-full object-cover object-center"
                      crossOrigin="anonymous"
                      onError={(e) => {
                        console.error('Error loading father image in top row:', e);
                        showPlaceholder(e.target as HTMLImageElement);
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full w-full bg-gray-100">
                      <div className="text-gray-400 text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <p className="text-xs">Father</p>
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-xs font-medium text-center mt-1">Father</p>
              </div>

              {/* Student Photo (larger) */}
              <div className="flex flex-col items-center">
                <div className="w-28 h-28 border-3 border-blue-400 overflow-hidden rounded-full shadow-md">
                  {feedback.student_photo_url ? (
                    <img
                      src={getValidImageUrl(feedback.student_photo_url) || feedback.student_photo_url}
                      alt={feedback.student_name}
                      className="w-full h-full object-cover object-center"
                      crossOrigin="anonymous"
                      onError={(e) => {
                        console.error('Error loading student image in top row:', e);
                        showPlaceholder(e.target as HTMLImageElement);
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full w-full bg-gray-100">
                      <div className="text-gray-400 text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <p className="text-xs">Student</p>
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-xs font-semibold text-center mt-1">{feedback.student_name}</p>
              </div>

              {/* Mother Photo */}
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 border-2 border-blue-300 overflow-hidden rounded-full shadow-md">
                  {feedback.mother_photo_url ? (
                    <img
                      src={getValidImageUrl(feedback.mother_photo_url) || feedback.mother_photo_url}
                      alt="Mother"
                      className="w-full h-full object-cover object-center"
                      crossOrigin="anonymous"
                      onError={(e) => {
                        console.error('Error loading mother image in top row:', e);
                        showPlaceholder(e.target as HTMLImageElement);
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full w-full bg-gray-100">
                      <div className="text-gray-400 text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <p className="text-xs">Mother</p>
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-xs font-medium text-center mt-1">Mother</p>
              </div>
            </div>

            {/* Certificate Title */}
            <div className="text-center mb-3 sm:mb-4">
              <div className="relative inline-block">
                <h2 className="text-lg sm:text-xl font-bold text-blue-700 pb-1 px-2 sm:px-3 inline-block"
                    style={{
                      textShadow: '0.5px 0.5px 1px rgba(0,0,0,0.1)',
                      borderBottom: '1.5px solid #3B82F6',
                      borderImage: 'linear-gradient(to right, transparent, #3B82F6, transparent) 1'
                    }}>
                  CERTIFICATE OF ACHIEVEMENT
                </h2>
                <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
              </div>
              <p className="text-[10px] sm:text-xs text-gray-600 mt-1 italic">For Outstanding Academic Performance</p>
            </div>

            {/* Student Information */}
            <div className="flex justify-center mb-2">
              <div className="w-full max-w-md">
                <h3 className="text-base font-semibold mb-1 text-center">Student Information</h3>
                <div className="grid grid-cols-2 gap-x-2 bg-blue-50 p-2 rounded-md border border-blue-100">
                  <p className="mb-0.5 text-xs"><span className="font-semibold">Name:</span> {feedback.student_name}</p>
                  <p className="mb-0.5 text-xs"><span className="font-semibold">Class:</span> {feedback.className} {feedback.classSection}</p>
                  <p className="mb-0.5 text-xs"><span className="font-semibold">Month:</span> {feedback.month}</p>
                  <p className="mb-0.5 text-xs"><span className="font-semibold">Attendance:</span> {feedback.attendance_percentage}%</p>
                </div>
              </div>
            </div>

            {/* Feedback Sections */}
            <div className="mb-2">
              <h3 className="text-base font-semibold mb-1 text-blue-700 border-b border-blue-200 pb-0.5 text-center sm:text-left">Performance Feedback</h3>

              <div className="mb-2">
                <div className="flex items-center mb-0.5 justify-center sm:justify-start">
                  <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center mr-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h4 className="text-xs font-semibold text-green-700">Strengths & Achievements</h4>
                </div>
                <p className="p-2 sm:p-1.5 text-xs bg-green-50 border-l-2 border-green-400 rounded-r-md shadow-sm">{feedback.good_things}</p>
              </div>

              <div className="mb-2">
                <div className="flex items-center mb-0.5 justify-center sm:justify-start">
                  <div className="w-4 h-4 rounded-full bg-amber-100 flex items-center justify-center mr-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <h4 className="text-xs font-semibold text-amber-700">Growth Opportunities</h4>
                </div>
                <p className="p-2 sm:p-1.5 text-xs bg-amber-50 border-l-2 border-amber-400 rounded-r-md shadow-sm">{feedback.need_to_improve}</p>
              </div>

              <div className="mb-2">
                <div className="flex items-center mb-0.5 justify-center sm:justify-start">
                  <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center mr-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <h4 className="text-xs font-semibold text-blue-700">Action Plan</h4>
                </div>
                <p className="p-2 sm:p-1.5 text-xs bg-blue-50 border-l-2 border-blue-400 rounded-r-md shadow-sm">{feedback.best_can_do}</p>
              </div>
            </div>

            {/* Date and Signature */}
            <div className="flex flex-col sm:flex-row justify-between items-center sm:items-end mt-3 gap-3 sm:gap-0">
              <div className="bg-blue-50 border border-blue-200 rounded-md p-1.5 shadow-sm w-full sm:w-auto">
                <p className="font-semibold text-blue-800 text-xs text-center sm:text-left">Issue Date: {new Date().toLocaleDateString()}</p>
                <p className="text-[10px] text-gray-500 text-center sm:text-left">Valid for Academic Year 2025-26</p>
              </div>
              <div className="text-center">
                <div className="relative">
                  <img
                    src="/images/signature.png"
                    alt="Principal's Signature"
                    className="h-12 sm:h-10 mb-0.5"
                    crossOrigin="anonymous"
                    onError={(e) => {
                      // If image fails to load, show a fallback border
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.parentElement!.classList.add('border-t', 'border-black', 'w-32', 'sm:w-28', 'pt-0.5');
                      // Don't set imageLoadError for signature as it's not critical
                    }}
                  />
                  <div className="border-t border-black w-32 sm:w-28 pt-0.5">
                    <p className="font-semibold text-xs">Principal's Signature</p>
                  </div>
                </div>
              </div>
            </div>

            {/* School Seal */}
            <div className="absolute bottom-8 sm:bottom-12 right-8 sm:right-12 opacity-30">
              <div className="w-14 h-14 sm:w-16 sm:h-16 border-2 border-blue-300 rounded-full flex items-center justify-center">
                <div className="text-center">
                  <p className="text-[8px] sm:text-[10px] font-bold text-blue-800">SCHOOL SEAL</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="absolute bottom-1 sm:bottom-2 left-0 right-0 text-center text-[8px] sm:text-[10px] text-gray-500 px-2 sm:px-0">
              <p>This certificate is electronically generated and does not require a physical signature.</p>
              <p className="text-[8px] sm:text-[10px]">Certificate ID: {generatedCertificateId}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ParentFeedbackCertificate;
