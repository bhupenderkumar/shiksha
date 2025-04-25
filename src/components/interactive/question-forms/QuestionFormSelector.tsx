import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { MultipleChoiceQuestionForm } from "./MultipleChoiceQuestionForm";
import { AudioReadingQuestionForm } from "./AudioReadingQuestionForm";
import { DrawingQuestionForm } from "./DrawingQuestionForm";
import { MatchingQuestionForm2 } from "./MatchingQuestionForm2";
import { CompletionQuestionForm } from "./CompletionQuestionForm";
import { FormLabel } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

interface QuestionFormSelectorProps {
  questionType: string;
  initialData?: any;
  onChange: (data: any) => void;
}

export interface QuestionFormSelectorRef {
  getCurrentFormData: () => any;
}

export const QuestionFormSelector = forwardRef<QuestionFormSelectorRef, QuestionFormSelectorProps>(({
  questionType,
  initialData,
  onChange
}, ref) => {
  // Ensure questionType is not null or undefined
  const safeQuestionType = questionType || 'UNKNOWN';
  const [formData, setFormData] = useState<any>(initialData || {});

  // Reset form data when question type changes
  useEffect(() => {
    setFormData(initialData || {});
  }, [questionType, initialData]);

  // Update parent component when form data changes
  // We're removing the automatic update to prevent premature form submission
  // The parent component will get the data when the user clicks the update button

  // Store the form data locally but don't update the parent component
  const handleFormChange = (data: any) => {
    // Only update the local state, not the parent component
    setFormData(data);

    // Don't call onChange here to prevent automatic updates
    // The parent component will get the data when the user clicks the update button
  };

  // Expose methods to the parent component using useImperativeHandle
  useImperativeHandle(ref, () => ({
    getCurrentFormData: () => {
      return formData;
    }
  }));

  // We're not using useEffect to automatically update the parent component
  // Instead, we'll provide a method to get the current form data

  const renderFormByType = () => {
    switch (safeQuestionType) {
      case "MULTIPLE_CHOICE":
        return (
          <MultipleChoiceQuestionForm
            value={formData}
            onChange={handleFormChange}
          />
        );
      case "AUDIO_READING":
        return (
          <AudioReadingQuestionForm
            value={formData}
            onChange={handleFormChange}
          />
        );
      case "DRAWING":
        return (
          <DrawingQuestionForm
            value={formData}
            onChange={handleFormChange}
          />
        );
      case "MATCHING":
        return (
          <MatchingQuestionForm2
            value={formData}
            onChange={handleFormChange}
          />
        );
      case "COMPLETION":
        return (
          <CompletionQuestionForm
            value={formData}
            onChange={handleFormChange}
          />
        );
      default:
        return (
          <Card className="border border-yellow-200 bg-yellow-50">
            <CardContent className="p-4 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              <div>
                <FormLabel className="text-yellow-700">
                  {safeQuestionType} Configuration
                </FormLabel>
                <p className="text-sm text-yellow-600">
                  The form for {safeQuestionType.toLowerCase().replace(/_/g, ' ')} questions will be implemented in the next phase.
                </p>
              </div>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="space-y-4 overflow-y-auto">
      <FormLabel className="text-base">Question Configuration</FormLabel>
      {renderFormByType()}
    </div>
  );
});
