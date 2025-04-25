import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormLabel } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash, Upload, Volume2 } from "lucide-react";

interface AudioReadingQuestionFormProps {
  value: any;
  onChange: (value: any) => void;
  error?: any;
}

export function AudioReadingQuestionForm({
  value,
  onChange,
  error
}: AudioReadingQuestionFormProps) {
  const [text, setText] = useState<string>(value?.text || "");
  const [audioUrl, setAudioUrl] = useState<string>(value?.audioUrl || "");
  const [highlightWords, setHighlightWords] = useState<boolean>(value?.highlightWords || true);
  const [comprehensionQuestions, setComprehensionQuestions] = useState<any[]>(
    value?.comprehensionQuestions || []
  );

  // Update parent component when values change
  useEffect(() => {
    onChange({
      text,
      audioUrl,
      highlightWords,
      comprehensionQuestions
    });
  }, [text, audioUrl, highlightWords, comprehensionQuestions, onChange]);

  const addComprehensionQuestion = () => {
    setComprehensionQuestions([
      ...comprehensionQuestions,
      {
        id: uuidv4(),
        question: "",
        options: ["", "", "", ""],
        correctAnswer: ""
      }
    ]);
  };

  const removeComprehensionQuestion = (index: number) => {
    const newQuestions = [...comprehensionQuestions];
    newQuestions.splice(index, 1);
    setComprehensionQuestions(newQuestions);
  };

  const updateComprehensionQuestion = (index: number, field: string, value: any) => {
    const newQuestions = [...comprehensionQuestions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setComprehensionQuestions(newQuestions);
  };

  const updateComprehensionOption = (questionIndex: number, optionIndex: number, value: string) => {
    const newQuestions = [...comprehensionQuestions];
    const newOptions = [...newQuestions[questionIndex].options];
    newOptions[optionIndex] = value;
    newQuestions[questionIndex] = { ...newQuestions[questionIndex], options: newOptions };
    setComprehensionQuestions(newQuestions);
  };

  // Mock function for audio upload - in a real implementation, this would handle file uploads
  const handleAudioUpload = () => {
    // This is a placeholder - in a real implementation, you would handle file uploads
    const mockAudioUrl = "https://example.com/audio/sample.mp3";
    setAudioUrl(mockAudioUrl);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <FormLabel className="text-base">Reading Text</FormLabel>
        <Textarea
          placeholder="Enter the text for students to read"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="min-h-[150px]"
        />
      </div>

      <div className="space-y-4">
        <FormLabel className="text-base">Audio Recording</FormLabel>
        <div className="flex items-center gap-4">
          {audioUrl ? (
            <div className="flex-1 flex items-center gap-2 p-2 border rounded-md">
              <Volume2 className="h-5 w-5 text-gray-500" />
              <span className="text-sm truncate flex-1">{audioUrl.split('/').pop()}</span>
              <audio src={audioUrl} controls className="max-w-[200px]" />
            </div>
          ) : (
            <div className="flex-1 p-2 border rounded-md text-gray-500 text-sm">
              No audio uploaded
            </div>
          )}
          <Button type="button" variant="outline" onClick={handleAudioUpload}>
            <Upload className="h-4 w-4 mr-2" />
            Upload Audio
          </Button>
        </div>
        <p className="text-sm text-gray-500">
          Upload an audio recording of the text being read aloud.
        </p>
      </div>

      <div className="flex items-center justify-between">
        <FormLabel className="text-base">Highlight Words While Reading</FormLabel>
        <Switch
          checked={highlightWords}
          onCheckedChange={setHighlightWords}
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <FormLabel className="text-base">Comprehension Questions</FormLabel>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addComprehensionQuestion}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Question
          </Button>
        </div>

        {comprehensionQuestions.length === 0 ? (
          <p className="text-sm text-gray-500">
            No comprehension questions added. Add questions to test understanding.
          </p>
        ) : (
          <div className="space-y-4">
            {comprehensionQuestions.map((q, qIndex) => (
              <Card key={q.id} className="border border-gray-200">
                <CardHeader className="pb-2 flex flex-row items-start justify-between">
                  <CardTitle className="text-base">Question {qIndex + 1}</CardTitle>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeComprehensionQuestion(qIndex)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <FormLabel className="text-sm">Question</FormLabel>
                    <Input
                      placeholder="Enter question"
                      value={q.question}
                      onChange={(e) => updateComprehensionQuestion(qIndex, "question", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <FormLabel className="text-sm">Options</FormLabel>
                    {q.options.map((option: string, oIndex: number) => (
                      <div key={oIndex} className="flex items-center gap-2">
                        <div className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded-full text-sm">
                          {String.fromCharCode(65 + oIndex)}
                        </div>
                        <Input
                          placeholder={`Option ${String.fromCharCode(65 + oIndex)}`}
                          value={option}
                          onChange={(e) => updateComprehensionOption(qIndex, oIndex, e.target.value)}
                        />
                        <Switch
                          checked={q.correctAnswer === option}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              updateComprehensionQuestion(qIndex, "correctAnswer", option);
                            }
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}
