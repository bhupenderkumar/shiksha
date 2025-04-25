import { useNavigate, useParams } from 'react-router-dom';
import { InteractiveAssignmentForm } from '@/components/interactive/InteractiveAssignmentForm';
import { interactiveAssignmentService } from '@/services/interactiveAssignmentService';
import { useEffect, useState } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/lib/auth';
import { z } from 'zod';
import type { CreateInteractiveAssignmentData, UpdateInteractiveAssignmentData, InteractiveAssignmentType } from '@/types/interactiveAssignment';

// Import the form schema to ensure type consistency
const formSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  type: z.enum([
    'MATCHING', 'COMPLETION', 'DRAWING', 'COLORING', 'MULTIPLE_CHOICE', 'ORDERING',
    'SORTING', 'PUZZLE', 'IDENTIFICATION', 'COUNTING', 'TRACING', 'AUDIO_READING',
    'HANDWRITING', 'LETTER_TRACING', 'NUMBER_RECOGNITION', 'PICTURE_WORD_MATCHING',
    'PATTERN_COMPLETION', 'CATEGORIZATION'
  ] as const),
  classId: z.string().min(1, 'Class is required'),
  subjectId: z.string().min(1, 'Subject is required'),
  dueDate: z.date(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
  difficultyLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  estimatedTimeMinutes: z.number().min(1).optional(),
  hasAudioFeedback: z.boolean().default(false),
  hasCelebration: z.boolean().default(true),
  requiresParentHelp: z.boolean().default(false),
  questions: z.array(z.object({
    questionType: z.string() as z.ZodType<InteractiveAssignmentType>,
    questionText: z.string(),
    data: z.any()
  })).min(1, 'At least one question is required'),
});

type FormValues = z.infer<typeof formSchema>;

export default function InteractiveAssignmentFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const [initialData, setInitialData] = useState<FormValues | undefined>(undefined);
  const [loading, setLoading] = useState(!!id);

  useEffect(() => {
    if (id) {
      const fetchAssignment = async () => {
        try {
          const data = await interactiveAssignmentService.getById(id);
          if (data) {
            // Transform the data to match the form schema
            setInitialData({
              title: data.title,
              description: data.description,
              type: data.type as any,
              classId: data.classId,
              subjectId: data.subjectId,
              dueDate: data.dueDate,
              status: data.status,
              difficultyLevel: data.difficultyLevel,
              estimatedTimeMinutes: data.estimatedTimeMinutes,
              hasAudioFeedback: data.hasAudioFeedback || false,
              hasCelebration: data.hasCelebration !== false,
              requiresParentHelp: data.requiresParentHelp || false,
              questions: data.questions?.map(q => ({
                questionType: q.questionType,
                questionText: q.questionText,
                data: q.questionData
              })) || []
            });
          }
        } catch (error) {
          toast.error('Failed to load assignment');
          console.error(error);
        } finally {
          setLoading(false);
        }
      };
      fetchAssignment();
    }
  }, [id]);

  const handleSubmit = async (data: FormValues) => {
    if (!user) {
      toast.error('You must be logged in to create or edit assignments');
      return;
    }

    try {
      // Transform form data to match the API expected format
      const assignmentData: CreateInteractiveAssignmentData | UpdateInteractiveAssignmentData = {
        ...data,
        questions: data.questions.map(q => ({
          questionType: q.questionType as InteractiveAssignmentType,
          questionText: q.questionText,
          questionData: q.data,
          order: 0 // Will be set by the backend
        }))
      };

      if (id) {
        await interactiveAssignmentService.update(id, assignmentData as UpdateInteractiveAssignmentData);
        toast.success('Assignment updated successfully');
      } else {
        await interactiveAssignmentService.create(assignmentData as CreateInteractiveAssignmentData, user.id);
        toast.success('Assignment created successfully');
      }
      navigate('/interactive-assignments');
    } catch (error) {
      toast.error('Failed to save assignment');
      console.error(error);
    }
  };

  const handleCancel = () => {
    navigate('/interactive-assignments');
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  // Add id to initialData if it exists
  const formData = initialData && id ? { ...initialData, id } : initialData;

  return (
    <div className="container mx-auto py-8">
      <InteractiveAssignmentForm
        initialData={formData as any}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  );
}