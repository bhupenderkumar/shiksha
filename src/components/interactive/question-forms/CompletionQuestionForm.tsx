import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormLabel } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash } from "lucide-react";

interface CompletionQuestionFormProps {
  value: any;
  onChange: (value: any) => void;
  error?: any;
}

export function CompletionQuestionForm({
  value,
  onChange,
  error
}: CompletionQuestionFormProps) {
  const [text, setText] = useState<string>(value?.text || "");
  const [blanks, setBlanks] = useState<any[]>(
    value?.blanks || [
      { id: uuidv4(), answer: "", position: 1 },
      { id: uuidv4(), answer: "", position: 2 }
    ]
  );

  // Update parent component when values change
  useEffect(() => {
    onChange({
      text,
      blanks
    });
  }, [text, blanks, onChange]);

  const addBlank = () => {
    const newPosition = blanks.length > 0 
      ? Math.max(...blanks.map(b => b.position)) + 1 
      : 1;
    
    setBlanks([...blanks, { id: uuidv4(), answer: "", position: newPosition }]);
  };

  const removeBlank = (index: number) => {
    if (blanks.length <= 1) {
      return; // Maintain at least 1 blank
    }
    const newBlanks = [...blanks];
    newBlanks.splice(index, 1);
    setBlanks(newBlanks);
  };

  const updateBlank = (index: number, field: string, value: any) => {
    const newBlanks = [...blanks];
    newBlanks[index] = { ...newBlanks[index], [field]: value };
    setBlanks(newBlanks);
  };

  // Helper function to render the text with blanks
  const renderTextWithBlanks = () => {
    if (!text) return <p className="text-gray-400">Text with blanks will appear here</p>;
    
    // Sort blanks by position
    const sortedBlanks = [...blanks].sort((a, b) => a.position - b.position);
    
    // Create a preview by replacing [blank1], [blank2], etc. with styled spans
    let previewText = text;
    sortedBlanks.forEach((blank, index) => {
      const placeholder = `[blank${blank.position}]`;
      const replacement = `<span class="px-2 py-1 bg-blue-100 rounded-md text-blue-800">${blank.answer || placeholder}</span>`;
      previewText = previewText.replace(new RegExp(placeholder, 'g'), replacement);
    });
    
    return <div dangerouslySetInnerHTML={{ __html: previewText }} />;
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <FormLabel className="text-base">Text with Blanks</FormLabel>
        <p className="text-sm text-gray-500">
          Enter your text and use [blank1], [blank2], etc. to indicate where blanks should appear.
        </p>
        <Textarea
          placeholder="Enter text with [blank1], [blank2], etc."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="min-h-[150px]"
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <FormLabel className="text-base">Blanks</FormLabel>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addBlank}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Blank
          </Button>
        </div>

        {blanks.map((blank, index) => (
          <Card key={blank.id} className="border border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="w-16">
                  <FormLabel className="text-sm">Position</FormLabel>
                  <Input
                    type="number"
                    min={1}
                    value={blank.position}
                    onChange={(e) => updateBlank(index, "position", parseInt(e.target.value) || 1)}
                    className="mt-1"
                  />
                </div>
                <div className="flex-1">
                  <FormLabel className="text-sm">Answer</FormLabel>
                  <Input
                    placeholder="Enter the correct answer"
                    value={blank.answer}
                    onChange={(e) => updateBlank(index, "answer", e.target.value)}
                    className="mt-1"
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeBlank(index)}
                  disabled={blanks.length <= 1}
                  className="mt-6"
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="border rounded-md p-4 bg-gray-50">
        <FormLabel className="text-base mb-2">Preview</FormLabel>
        <div className="p-4 bg-white rounded-md border">
          {renderTextWithBlanks()}
        </div>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}
