import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { idCardService } from '@/backend/idCardService';
import { IDCardData } from '@/types/idCard';
import { IDCardGenerator } from '@/components/IDCardGenerator';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'react-hot-toast';
import { Download, Printer, AlertCircle, ArrowLeft } from 'lucide-react';
import { SCHOOL_INFO } from '@/lib/constants';
import IDCardForm from './IDCardForm';

const IDCardView: React.FC = () => {
  const [searchParams] = useSearchParams();
  const idCardId = searchParams.get('id');
  const [idCard, setIdCard] = useState<IDCardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Fetch ID card data based on ID parameter
  useEffect(() => {
    const fetchIDCard = async () => {
      if (!idCardId) {
        // If no ID is provided, show the form instead of an error
        setShowForm(true);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await idCardService.getIDCardById(idCardId);

        if (!data) {
          setError('ID card not found');
        } else {
          setIdCard(data);
        }
      } catch (err) {
        console.error('Error fetching ID card:', err);
        setError('Failed to load ID card details');
        toast.error('Failed to load ID card details');
      } finally {
        setLoading(false);
      }
    };

    fetchIDCard();
  }, [idCardId]);

  // Handle download
  const handleDownload = async () => {
    if (idCard && idCardId) {
      try {
        // Increment download count
        await idCardService.incrementDownloadCount(idCardId);

        // The actual download is handled by the IDCardGenerator component
        const downloadButton = document.querySelector('[data-download-button]') as HTMLButtonElement;
        if (downloadButton) {
          downloadButton.click();
        } else {
          toast.error('Download button not found');
        }
      } catch (err) {
        console.error('Error downloading ID card:', err);
        toast.error('Failed to download ID card');
      }
    }
  };

  // Handle print
  const handlePrint = () => {
    const printButton = document.querySelector('[data-print-button]') as HTMLButtonElement;
    if (printButton) {
      printButton.click();
    } else {
      window.print();
    }
  };

  // Handle back to form
  const handleBackToForm = () => {
    setShowForm(true);
    setIdCard(null);
  };

  if (showForm || (!idCardId && !loading)) {
    return <IDCardForm />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-between items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToForm}
              className="flex items-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Form
            </Button>
            <div>
              <CardTitle className="text-2xl font-bold">{SCHOOL_INFO.name}</CardTitle>
              <CardDescription>ID Card Details</CardDescription>
            </div>
            <div className="w-24"></div> {/* Empty div for balance */}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Error Loading ID Card</h3>
              <p className="text-muted-foreground">{error}</p>
              <Button
                className="mt-6"
                onClick={handleBackToForm}
              >
                Go to ID Card Form
              </Button>
            </div>
          ) : idCard ? (
            <div className="space-y-6">
              {/* Student Information Card */}
              <Card className="bg-blue-50/50 border-blue-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-blue-800">Student Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div>
                        <span className="font-semibold">Name:</span> {idCard.studentName}
                      </div>
                      <div>
                        <span className="font-semibold">Class:</span> {idCard.className} {idCard.section}
                      </div>
                      {idCard.dateOfBirth && (
                        <div>
                          <span className="font-semibold">Date of Birth:</span> {new Date(idCard.dateOfBirth).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          })}
                        </div>
                      )}
                    </div>
                    <div className="flex justify-center md:justify-end">
                      {typeof idCard.studentPhoto === 'string' && idCard.studentPhoto ? (
                        <div className="border-2 border-blue-300 p-1 rounded-md shadow-sm bg-white">
                          <img
                            src={idCard.studentPhoto}
                            alt="Student"
                            className="w-24 h-32 object-cover rounded-sm"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/96x128?text=No+Photo';
                            }}
                          />
                        </div>
                      ) : (
                        <div className="w-24 h-32 bg-gray-100 flex items-center justify-center rounded-md border border-gray-200">
                          No photo
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Parent Information Card */}
              <Card className="bg-blue-50/50 border-blue-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-blue-800">Parent Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div>
                        <span className="font-semibold">Father's Name:</span> {idCard.fatherName}
                      </div>
                      <div>
                        <span className="font-semibold">Mother's Name:</span> {idCard.motherName}
                      </div>
                      <div>
                        <span className="font-semibold">Father's Mobile:</span> {idCard.fatherMobile}
                      </div>
                      <div>
                        <span className="font-semibold">Mother's Mobile:</span> {idCard.motherMobile}
                      </div>
                      <div>
                        <span className="font-semibold">Address:</span> {idCard.address}
                      </div>
                    </div>
                    <div className="flex justify-center md:justify-end gap-4">
                      {typeof idCard.fatherPhoto === 'string' && idCard.fatherPhoto ? (
                        <div className="border-2 border-blue-300 p-1 rounded-md shadow-sm bg-white">
                          <img
                            src={idCard.fatherPhoto}
                            alt="Father"
                            className="w-20 h-24 object-cover rounded-sm"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/80x96?text=No+Photo';
                            }}
                          />
                          <div className="text-center text-xs mt-1 font-medium">Father</div>
                        </div>
                      ) : (
                        <div className="w-20 h-24 bg-gray-100 flex items-center justify-center rounded-md border border-gray-200">
                          No photo
                        </div>
                      )}

                      {typeof idCard.motherPhoto === 'string' && idCard.motherPhoto ? (
                        <div className="border-2 border-blue-300 p-1 rounded-md shadow-sm bg-white">
                          <img
                            src={idCard.motherPhoto}
                            alt="Mother"
                            className="w-20 h-24 object-cover rounded-sm"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/80x96?text=No+Photo';
                            }}
                          />
                          <div className="text-center text-xs mt-1 font-medium">Mother</div>
                        </div>
                      ) : (
                        <div className="w-20 h-24 bg-gray-100 flex items-center justify-center rounded-md border border-gray-200">
                          No photo
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* ID Card Preview */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">ID Card Preview</h3>
                <IDCardGenerator data={idCard} idCardId={idCardId} />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center gap-4 mt-6">
                <Button
                  onClick={handleDownload}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download ID Card
                </Button>
                <Button
                  variant="outline"
                  onClick={handlePrint}
                >
                  <Printer className="mr-2 h-4 w-4" />
                  Print ID Card
                </Button>
              </div>

              {/* Help Section */}
              <div className="mt-8 text-center">
                <p className="text-sm text-muted-foreground mb-2">Having issues with your ID card?</p>
                <a
                  href={`https://wa.me/919311872001?text=${encodeURIComponent(`Hi, I'm having issues with the ID card for ${idCard.studentName}. ID: ${idCardId}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/>
                  </svg>
                  Contact Support on WhatsApp
                </a>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
};

export default IDCardView;
