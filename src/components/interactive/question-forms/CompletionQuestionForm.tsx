import { useState, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormLabel } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";

import { Plus, Trash } from "lucide-react";
import DOMPurify from "dompurify";

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
  const [selectedText, setSelectedText] = useState<string>("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Update parent component when values change
  useEffect(() => {
    onChange({
      text,
      blanks
    });
  }, [text, blanks, onChange]);

  // Handle text selection in the textarea
  const handleTextSelection = () => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      const selection = text.substring(start, end);
      setSelectedText(selection);
    }
  };

  // Create a blank from the selected text
  const createBlankFromSelection = () => {
    if (!selectedText.trim()) return;

    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;

      // Create a new blank
      const newBlankPosition = blanks.length > 0
        ? Math.max(...blanks.map(b => b.position)) + 1
        : 1;

      const newBlank = {
        id: uuidv4(),
        answer: selectedText.trim(),
        position: newBlankPosition
      };

      // Replace the selected text with a placeholder
      const newText =
        text.substring(0, start) +
        `[blank${newBlankPosition}]` +
        text.substring(end);

      // Update state
      setText(newText);
      setBlanks([...blanks, newBlank]);
      setSelectedText("");
    }
  };

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

    const blankToRemove = blanks[index];
    const placeholder = `[blank${blankToRemove.position}]`;

    // Remove the placeholder from the text
    const newText = text.replace(placeholder, blankToRemove.answer || "");

    // Remove the blank from the array
    const newBlanks = [...blanks];
    newBlanks.splice(index, 1);

    setText(newText);
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
      const replacement = `<span class="px-3 py-1 bg-primary/10 border border-primary/30 rounded-md text-primary font-medium">${blank.answer || placeholder}</span>`;
      previewText = previewText.replace(new RegExp(placeholder, 'g'), replacement);
    });

    
    const sanitizedPreviewText = DOMPurify.sanitize(previewText);
    return <div dangerouslySetInnerHTML={{ __html: sanitizedPreviewText }} />;

  };

  // Update the actual position values for blanks based on their placeholders in the text
  useEffect(() => {
    if (!text) return;

    // For each blank, find its position in the text
    const updatedBlanks = blanks.map(blank => {
      const placeholder = `[blank${blank.position}]`;
      const position = text.indexOf(placeholder);

      // Only update if the placeholder exists in the text
      if (position !== -1) {
        return { ...blank, position };
      }
      return blank;
    });

    // Only update if positions have changed
    const positionsChanged = updatedBlanks.some((blank, index) =>
      blank.position !== blanks[index].position
    );

    if (positionsChanged) {
      setBlanks(updatedBlanks);
    }
  }, [text]);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <FormLabel className="text-base">Text with Blanks</FormLabel>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm">
                  <HelpCircle className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="max-w-sm">
                <p>Enter your text and create blanks by selecting text and clicking "Create Blank from Selection"</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <Alert className="bg-blue-50 border-blue-200">
          <AlertDescription className="text-sm text-blue-700">
            <strong>Quick tip:</strong> Select text and click "Create Blank" to automatically create blanks with the correct answers.
          </AlertDescription>
        </Alert>

        <div className="relative">
          <Textarea
            ref={textareaRef}
            placeholder="Enter your text here. Select words to create blanks."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onSelect={handleTextSelection}
            className="min-h-[150px]"
          />

          {selectedText && (
            <div className="absolute bottom-2 right-2">
              <Button
                type="button"
                size="sm"
                onClick={createBlankFromSelection}
                className="bg-primary/90 hover:bg-primary"
              >
                <Wand2 className="h-4 w-4 mr-2" />
                Create Blank
              </Button>
            </div>
          )}
        </div>
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

        <div className="grid gap-4 md:grid-cols-2">
          {blanks.map((blank, index) => (
            <Card key={blank.id} className="border border-gray-200 hover:border-primary/50 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="w-16">
                    <FormLabel className="text-sm">Number</FormLabel>
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
                    className="mt-6 text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="border rounded-md p-4 bg-gray-50">
        <FormLabel className="text-base mb-2">Preview</FormLabel>
        <div className="p-6 bg-white rounded-md border text-lg">
          {renderTextWithBlanks()}
        </div>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}
