import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { idCardService, IDCardData } from '@/services/idCardService';
import { IDCardGenerator } from '@/components/IDCardGenerator';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'react-hot-toast';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { SCHOOL_INFO } from '@/lib/constants';

const IDCardView: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const studentId = searchParams.get('id');
  const [idCard, setIdCard] = useState<IDCardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchIDCard = async () => {
      if (!studentId) {
        // Redirect to new ID card form if no student ID is provided
        navigate('/id-card/new');
        return;
      }

      try {
        setLoading(true);
        const data = await idCardService.getByStudentId(studentId);

        if (!data) {
          setError('ID card not found for the specified student.');
          toast.error('ID card not found.');
        } else {
          setIdCard(data);
        }
      } catch (err) {
        console.error('Error fetching ID card:', err);
        setError('Failed to load ID card details.');
        toast.error('Failed to load ID card details.');
      } finally {
        setLoading(false);
      }
    };

    fetchIDCard();
  }, [studentId, navigate]);

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-5xl mx-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleGoBack}
              className="flex items-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div className="text-center">
              <CardTitle className="text-2xl font-bold">{SCHOOL_INFO.name}</CardTitle>
              <CardDescription>ID Card Details</CardDescription>
            </div>
            <Link to="/id-cards" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">View All ID Cards</Link>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <LoadingSpinner size="lg" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Error Loading ID Card</h3>
              <p className="text-muted-foreground">{error}</p>
              <Button
                className="mt-6"
                onClick={() => navigate('/id-card/new')}
              >
                Create New ID Card
              </Button>
            </div>
          ) : idCard ? (
            <IDCardGenerator data={idCard} idCardId={idCard.id!} />
          ) : (
            <div className="text-center py-20">
              <p>No ID card data to display.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default IDCardView;
