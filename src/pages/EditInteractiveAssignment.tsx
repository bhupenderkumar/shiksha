import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { interactiveAssignmentService } from "@/services/interactiveAssignmentService";
import { InteractiveAssignmentForm } from "@/components/interactive/InteractiveAssignmentForm";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { toast } from "react-hot-toast";
import { ROUTES } from "@/constants/app-constants";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { InteractiveAssignmentType } from "@/types/interactiveAssignment";

export default function EditInteractiveAssignment() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("Assignment ID is required");
      setLoading(false);
      return;
    }

    const fetchAssignment = async () => {
      try {
        const data = await interactiveAssignmentService.getById(id);
        if (!data) {
          setError("Assignment not found");
          return;
        }

        // Format the data for the form
        const formattedData = {
          ...data,
          // Ensure questions have the right format
          questions: data.questions?.map((q: any) => ({
            questionType: q.questionType,
            questionText: q.questionText,
            questionData: q.questionData,
            order: q.order,
            audioInstructions: q.audioInstructions,
            hintText: q.hintText,
            hintImageUrl: q.hintImageUrl,
            feedbackCorrect: q.feedbackCorrect,
            feedbackIncorrect: q.feedbackIncorrect
          })) || []
        };

        setAssignment(formattedData);
      } catch (err) {
        console.error("Error fetching assignment:", err);
        setError("Failed to load assignment");
      } finally {
        setLoading(false);
      }
    };

    fetchAssignment();
  }, [id]);

  // Use useCallback to memoize the submit handler
  const handleSubmit = useCallback(async (data: any) => {
    if (!id) {
      console.error("Missing assignment id", { id });
      toast.error("Missing assignment ID. Please try again.");
      alert("Error: Missing assignment ID. Please try again or contact support.");
      return;
    }

    // Validate required fields manually
    const validationErrors = [];
    if (!data.title || data.title.trim().length < 3) {
      validationErrors.push("Title must be at least 3 characters");
    }
    if (!data.description || data.description.trim().length < 10) {
      validationErrors.push("Description must be at least 10 characters");
    }
    if (!data.type) {
      validationErrors.push("Assignment type is required");
    }
    if (!data.classId) {
      validationErrors.push("Class is required");
    }
    if (!data.subjectId) {
      validationErrors.push("Subject is required");
    }
    if (!data.dueDate) {
      validationErrors.push("Due date is required");
    }
    if (data.questions.length === 0) {
      validationErrors.push("At least one question is required");
    } else {
      // Validate each question
      data.questions.forEach((question: any, index: number) => {
        if (!question.questionType) {
          validationErrors.push(`Question ${index + 1}: Question type is required`);
        }
        if (!question.questionText || question.questionText.trim() === '') {
          validationErrors.push(`Question ${index + 1}: Question text is required`);
        }
        if (!question.questionData) {
          validationErrors.push(`Question ${index + 1}: Question data is missing`);
        }
      });
    }

    // If there are validation errors, show them and stop
    if (validationErrors.length > 0) {
      console.error("Validation errors:", validationErrors);
      toast.error("Please fix the validation errors");
      alert("Please fix the following errors:\n\n" + validationErrors.join("\n"));
      return;
    }

    // Don't check for user here as it might trigger unnecessary profile fetches
    toast.loading("Updating assignment...", { id: "update-toast" });

    try {
      console.log("Updating assignment with ID:", id);
      console.log("Update data:", data);

      // Prepare the update data with all fields
      const updateData = {
        title: data.title,
        description: data.description,
        type: data.type,
        classId: data.classId,
        subjectId: data.subjectId,
        dueDate: data.dueDate,
        status: data.status,
        difficultyLevel: data.difficultyLevel,
        estimatedTimeMinutes: data.estimatedTimeMinutes,
        hasAudioFeedback: data.hasAudioFeedback,
        hasCelebration: data.hasCelebration,
        requiresParentHelp: data.requiresParentHelp
      };

      console.log("Formatted update data:", updateData);
      toast.loading("Saving assignment details...", { id: "update-toast" });

      // Update the assignment
      const updated = await interactiveAssignmentService.update(id, updateData);

      if (!updated) {
        toast.error("Failed to update assignment. No response from service.", { id: "update-toast" });
        throw new Error("Failed to update assignment. No response from service.");
      }

      console.log("Assignment update result:", updated);
      toast.loading("Assignment details saved. Processing questions...", { id: "update-toast" });

      // Update questions separately
      if (data.questions && data.questions.length > 0) {
        console.log("Updating questions for assignment ID:", id);
        console.log("Questions data:", data.questions);

        // The data should already be formatted by the form component
        // But let's double-check and fix any issues just to be safe
        const formattedQuestions = [];

        // Process each question individually to ensure proper types
        for (let index = 0; index < data.questions.length; index++) {
          const q = data.questions[index];

          // Make sure questionType is a valid string - MATCHING is our default
          let questionType = 'MATCHING';
          if (q.questionType && typeof q.questionType === 'string') {
            questionType = q.questionType;
          }

          // Make sure order is a number
          const order = index + 1;

          // Log the types for debugging
          console.log(`Question ${index + 1} types in EditInteractiveAssignment:`, {
            questionTypeOriginal: q.questionType,
            questionTypeConverted: questionType,
            questionTypeType: typeof questionType,
            orderOriginal: q.order,
            orderConverted: order,
            orderType: typeof order
          });

          // Create a properly formatted question object
          const formattedQuestion = {
            questionType: questionType as InteractiveAssignmentType,
            questionText: q.questionText || '',
            questionData: q.questionData || {},
            order,
            audioInstructions: q.audioInstructions || '',
            hintText: q.hintText || '',
            hintImageUrl: q.hintImageUrl || '',
            feedbackCorrect: q.feedbackCorrect || '',
            feedbackIncorrect: q.feedbackIncorrect || ''
          };

          formattedQuestions.push(formattedQuestion);
        }

        toast.loading("Saving questions...", { id: "update-toast" });
        const questionsUpdated = await interactiveAssignmentService.updateQuestions(id, formattedQuestions);

        if (!questionsUpdated) {
          console.warn("Questions may not have been updated successfully");
          toast.loading("Warning: Questions may not have saved correctly.", { id: "update-toast" });
        } else {
          toast.loading("Questions saved successfully.", { id: "update-toast" });
        }
      }

      toast.success("Assignment updated successfully", { id: "update-toast" });

      // Add a small delay before navigation to ensure the user sees the success message
      setTimeout(() => {
        navigate(ROUTES.INTERACTIVE_ASSIGNMENTS);
      }, 1000);
    } catch (err) {
      console.error("Error updating assignment:", err);
      toast.error("Failed to update assignment: " + (err instanceof Error ? err.message : 'Unknown error'), { id: "update-toast" });

      // Show an alert for critical errors
      alert("Error updating assignment: " + (err instanceof Error ? err.message : 'Unknown error') +
            "\n\nPlease check the console for more details.");
    }
  }, [id, navigate]);

  const handleCancel = () => {
    navigate(ROUTES.INTERACTIVE_ASSIGNMENTS);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={() => navigate(ROUTES.INTERACTIVE_ASSIGNMENTS)} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Assignments
          </Button>
        </div>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => navigate(ROUTES.INTERACTIVE_ASSIGNMENTS)} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Assignments
        </Button>
        <h1 className="text-2xl font-bold">Edit Interactive Assignment</h1>
      </div>

      {assignment && (
        <InteractiveAssignmentForm
          initialData={assignment}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
}
