import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ProcessTimeline } from '@/components/admission/ProcessTimeline';
import { ButtonWithIcon } from '@/components/ui/button-with-icon';
import { Card } from '@/components/ui/card';
import { admissionService } from '@/services/admissionService';
import { toast } from 'react-hot-toast';
import { Loader2, ArrowRight, Save } from 'lucide-react';
import { AdmissionProgress as Progress } from '@/types/admission';

export default function AdmissionProgress() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<Progress | null>(null);

  useEffect(() => {
    if (id) {
      loadProgress();
    }
  }, [id]);

  const loadProgress = async () => {
    try {
      setLoading(true);
      const progressData = await admissionService.getAdmissionProgress(id as string);
      setProgress(progressData);
    } catch (error) {
      toast.error('Failed to load admission progress');
      console.error('Error loading progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStepClick = (route: string) => {
    navigate(`${route}?id=${id}`);
  };

  const handleResume = () => {
    if (progress?.nextStep) {
      navigate(`/admission/${progress.nextStep}?id=${id}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!progress) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold mb-4">Admission Not Found</h1>
        <ButtonWithIcon onClick={() => navigate('/admission-enquiry')}>
          Start New Admission
        </ButtonWithIcon>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto py-8 px-4"
    >
      <div className="max-w-4xl mx-auto">
        {/* Mobile Progress Header */}
        <div className="md:hidden mb-6">
          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-2">Admission Progress</h2>
            <div className="text-sm text-muted-foreground mb-4">
              Last saved: {progress.lastSaved.toLocaleString()}
            </div>
            <ButtonWithIcon 
              className="w-full" 
              onClick={handleResume}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Continue Application
            </ButtonWithIcon>
          </Card>
        </div>

        {/* Desktop Progress Header */}
        <div className="hidden md:flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Admission Progress</h1>
            <p className="text-muted-foreground">
              Last saved: {progress.lastSaved.toLocaleString()}
            </p>
          </div>
          <div className="flex gap-4">
            <ButtonWithIcon
              variant="outline"
              onClick={() => navigate('/admission-enquiry')}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Save and Exit
            </ButtonWithIcon>
            <ButtonWithIcon 
              onClick={handleResume}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Continue Application
            </ButtonWithIcon>
          </div>
        </div>

        {/* Timeline */}
        <ProcessTimeline
          currentStep={progress.currentStep}
          completedSteps={progress.completedSteps}
          onStepClick={handleStepClick}
          className="mb-8"
        />

        {/* Mobile Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 md:hidden bg-background border-t p-4 flex gap-4">
          <ButtonWithIcon
            variant="outline"
            className="flex-1"
            onClick={() => navigate('/admission-enquiry')}
          >
            Save & Exit
          </ButtonWithIcon>
          <ButtonWithIcon 
            className="flex-1" 
            onClick={handleResume}
          >
            Continue
          </ButtonWithIcon>
        </div>
      </div>
    </motion.div>
  );
}