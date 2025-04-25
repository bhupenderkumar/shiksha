import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { FormLabel } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash } from "lucide-react";

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
        <FormLabel className="text-base">Allow Multiple Correct Answers</FormLabel>
        <Switch
          checked={allowMultiple}
          onCheckedChange={setAllowMultiple}
        />
      </div>

      <div className="space-y-2">
        <FormLabel className="text-base">Options</FormLabel>
        {options.map((option, index) => (
          <Card key={option.id} className="border border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-2">
                <Checkbox
                  id={`option-${index}`}
                  checked={option.isCorrect}
                  onCheckedChange={(checked) => toggleOptionCorrect(index, checked === true)}
                  className="mt-2"
                />
                <div className="flex-1">
                  <Input
                    placeholder={`Option ${index + 1}`}
                    value={option.text}
                    onChange={(e) => updateOptionText(index, e.target.value)}
                    className="mb-2"
                  />
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
    </div>
  );
}
