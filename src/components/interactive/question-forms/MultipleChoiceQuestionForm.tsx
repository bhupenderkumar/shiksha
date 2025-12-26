import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { FormLabel } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Alert } from "@/components/ui/alert";
import { Plus, Trash, CheckCircle, HelpCircle, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

interface MultipleChoiceQuestionFormProps {
  value: any;
  onChange: (value: any) => void;
  error?: any;
}

export function MultipleChoiceQuestionForm({
  value,
  onChange,
  error
}: MultipleChoiceQuestionFormProps) {
  const [options, setOptions] = useState<any[]>(
    value?.options || [
      { id: uuidv4(), text: "", isCorrect: false },
      { id: uuidv4(), text: "", isCorrect: false }
    ]
  );
  const [allowMultiple, setAllowMultiple] = useState<boolean>(value?.allowMultiple || false);

  // We'll manually call onChange when needed
  // This prevents automatic updates when typing
  useEffect(() => {
    // Only update the parent component when allowMultiple changes
    // This is a deliberate choice since this is a toggle, not a text input
    onChange({
      options,
      allowMultiple
    });
  }, [allowMultiple, onChange]);

  const addOption = () => {
    const newOptions = [...options, { id: uuidv4(), text: "", isCorrect: false }];
    setOptions(newOptions);

    // Immediately update the parent component when adding an option
    onChange({
      options: newOptions,
      allowMultiple
    });
  };

  const removeOption = (index: number) => {
    if (options.length <= 2) {
      return; // Maintain at least 2 options
    }
    const newOptions = [...options];
    newOptions.splice(index, 1);
    setOptions(newOptions);

    // Immediately update the parent component when removing an option
    onChange({
      options: newOptions,
      allowMultiple
    });
  };

  const updateOptionText = (index: number, text: string) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], text };
    setOptions(newOptions);

    // Manually update the parent component after a short delay
    // This prevents rapid updates while typing
    clearTimeout((window as any).optionTextUpdateTimeout);
    (window as any).optionTextUpdateTimeout = setTimeout(() => {
      onChange({
        options: newOptions,
        allowMultiple
      });
    }, 500); // 500ms delay
  };

  const toggleOptionCorrect = (index: number, isCorrect: boolean) => {
    const newOptions = [...options];

    if (!allowMultiple) {
      // If not allowing multiple correct answers, uncheck all others
      newOptions.forEach((option, i) => {
        newOptions[i] = { ...option, isCorrect: i === index ? isCorrect : false };
      });
    } else {
      // If allowing multiple, just toggle the selected one
      newOptions[index] = { ...newOptions[index], isCorrect };
    }

    setOptions(newOptions);

    // Immediately update the parent component when correctness changes
    // This is a deliberate choice since this is a checkbox, not a text input
    onChange({
      options: newOptions,
      allowMultiple
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FormLabel className="text-base">Allow Multiple Correct Answers</FormLabel>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full p-0">
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">
                  {allowMultiple
                    ? "Students can select multiple options. You can mark multiple options as correct."
                    : "Students can select only one option. Only one option can be marked as correct."}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Switch
          checked={allowMultiple}
          onCheckedChange={setAllowMultiple}
        />
      </div>

      <Alert variant="info" className="flex items-start gap-2">
        <Info className="h-5 w-5 flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-medium">How to mark correct answers:</p>
          <p>Check the box next to each option that should be considered correct. {allowMultiple
            ? "You can select multiple correct answers."
            : "Only one answer can be marked as correct."}
          </p>
        </div>
      </Alert>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <FormLabel className="text-base">Options</FormLabel>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>= Correct Answer</span>
          </div>
        </div>

        {options.map((option, index) => (
          <Card
            key={option.id}
            className={`border ${option.isCorrect
              ? 'border-green-300 bg-green-50'
              : 'border-gray-200'}`}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-2">
                <div className="flex flex-col items-center gap-1">
                  <Checkbox
                    id={`option-${index}`}
                    checked={option.isCorrect}
                    onCheckedChange={(checked) => toggleOptionCorrect(index, checked === true)}
                    className={`mt-2 ${option.isCorrect ? 'border-green-500 text-green-500' : ''}`}
                  />
                  <span className="text-xs text-muted-foreground">Correct</span>
                </div>
                <div className="flex-1">
                  <Input
                    placeholder={`Option ${index + 1}`}
                    value={option.text}
                    onChange={(e) => updateOptionText(index, e.target.value)}
                    className={`mb-2 ${option.isCorrect ? 'border-green-300' : ''}`}
                  />
                  {option.isCorrect && (
                    <Badge variant="success" className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/40 dark:text-green-300">
                      <CheckCircle className="h-3 w-3 mr-1" /> Marked as correct
                    </Badge>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeOption(index)}
                  disabled={options.length <= 2}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={addOption}
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Option
      </Button>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      {!options.some(opt => opt.isCorrect) && (
        <Alert variant="warning">
          <p className="font-medium">Warning: No correct answer selected</p>
          <p>Please mark at least one option as correct by checking the box next to it.</p>
        </Alert>
      )}
    </div>
  );
}
