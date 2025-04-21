import React, { useState, useEffect } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import { MultipleChoiceQuestion, MultipleChoiceResponse } from '@/types/interactiveAssignment';

interface MultipleChoiceExerciseProps {
  question: {
    id: string;
    questionText: string;
    questionData: MultipleChoiceQuestion;
  };
  readOnly?: boolean;
  initialResponse?: MultipleChoiceResponse;
  onSave?: (response: MultipleChoiceResponse) => void;
  showAnswers?: boolean;
}

export function MultipleChoiceExercise({ 
  question, 
  readOnly = false, 
  initialResponse, 
  onSave,
  showAnswers = false
}: MultipleChoiceExerciseProps) {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const { options, allowMultiple } = question.questionData;

  useEffect(() => {
    // Initialize selected options from initial response if available
    if (initialResponse?.selectedOptions) {
      setSelectedOptions(initialResponse.selectedOptions);
    }
  }, [initialResponse]);

  const handleOptionChange = (optionId: string, checked: boolean) => {
    if (allowMultiple) {
      // For multiple selection (checkboxes)
      if (checked) {
        setSelectedOptions(prev => [...prev, optionId]);
      } else {
        setSelectedOptions(prev => prev.filter(id => id !== optionId));
      }
    } else {
      // For single selection (radio buttons)
      setSelectedOptions([optionId]);
    }
  };

  const handleSave = () => {
    if (selectedOptions.length === 0) {
      toast.error('Please select at least one option');
      return;
    }
    
    if (onSave) {
      onSave({ selectedOptions });
    }
  };

  const handleReset = () => {
    setSelectedOptions([]);
  };

  const isOptionCorrect = (optionId: string) => {
    if (!showAnswers) return false;
    
    const option = options.find(opt => opt.id === optionId);
    return option?.isCorrect || false;
  };

  const isOptionSelected = (optionId: string) => {
    return selectedOptions.includes(optionId);
  };

  const getOptionClassName = (optionId: string) => {
    if (!showAnswers) return '';
    
    const isCorrect = isOptionCorrect(optionId);
    const isSelected = isOptionSelected(optionId);
    
    if (isSelected && isCorrect) return 'bg-green-50 border-green-300';
    if (isSelected && !isCorrect) return 'bg-red-50 border-red-300';
    if (!isSelected && isCorrect) return 'bg-yellow-50 border-yellow-300';
    
    return '';
  };

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-4">{question.questionText}</h3>
      
      <div className="p-4 bg-white border rounded-md">
        {allowMultiple ? (
          <div className="space-y-3">
            {options.map(option => (
              <div 
                key={option.id} 
                className={`flex items-start space-x-3 p-2 rounded border ${getOptionClassName(option.id)}`}
              >
                <Checkbox
                  id={option.id}
                  checked={isOptionSelected(option.id)}
                  onCheckedChange={(checked) => handleOptionChange(option.id, checked as boolean)}
                  disabled={readOnly}
                />
                <div className="flex-1">
                  <Label 
                    htmlFor={option.id} 
                    className="text-base cursor-pointer"
                  >
                    {option.text}
                  </Label>
                  
                  {option.imageUrl && (
                    <div className="mt-2">
                      <img 
                        src={option.imageUrl} 
                        alt={option.text} 
                        className="max-h-32 object-contain"
                      />
                    </div>
                  )}
                  
                  {showAnswers && isOptionCorrect(option.id) && (
                    <div className="mt-1 text-xs text-green-600">
                      Correct answer
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <RadioGroup
            value={selectedOptions[0] || ''}
            onValueChange={(value) => handleOptionChange(value, true)}
            disabled={readOnly}
          >
            <div className="space-y-3">
              {options.map(option => (
                <div 
                  key={option.id} 
                  className={`flex items-start space-x-3 p-2 rounded border ${getOptionClassName(option.id)}`}
                >
                  <RadioGroupItem 
                    value={option.id} 
                    id={option.id} 
                  />
                  <div className="flex-1">
                    <Label 
                      htmlFor={option.id} 
                      className="text-base cursor-pointer"
                    >
                      {option.text}
                    </Label>
                    
                    {option.imageUrl && (
                      <div className="mt-2">
                        <img 
                          src={option.imageUrl} 
                          alt={option.text} 
                          className="max-h-32 object-contain"
                        />
                      </div>
                    )}
                    
                    {showAnswers && isOptionCorrect(option.id) && (
                      <div className="mt-1 text-xs text-green-600">
                        Correct answer
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </RadioGroup>
        )}
      </div>
      
      {!readOnly && (
        <div className="mt-6 flex justify-end space-x-2">
          <Button variant="outline" onClick={handleReset}>
            Reset
          </Button>
          <Button onClick={handleSave}>
            Save Answer
          </Button>
        </div>
      )}
    </div>
  );
}

export default MultipleChoiceExercise;
