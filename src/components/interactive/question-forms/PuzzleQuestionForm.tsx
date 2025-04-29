import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormLabel } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageUploader } from "./ImageUploader";
import { Info, HelpCircle, Image as ImageIcon, CheckCircle, AlertCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { SimplifiedPuzzleExercise } from "../simplified-puzzle-exercise";

interface PuzzleQuestionFormProps {
  value: any;
  onChange: (value: any) => void;
  error?: any;
}

export function PuzzleQuestionForm({
  value,
  onChange,
  error
}: PuzzleQuestionFormProps) {
  const [imageUrl, setImageUrl] = useState<string>(value?.imageUrl || "");
  const [pieces, setPieces] = useState<number>(value?.pieces || 9);
  const [difficulty, setDifficulty] = useState<string>(value?.difficulty || "medium");
  const [previewEnabled, setPreviewEnabled] = useState<boolean>(value?.previewEnabled !== false);
  const [correctPieces, setCorrectPieces] = useState<number[]>(value?.correctPieces || []);
  const [activeTab, setActiveTab] = useState<string>("config");

  // Update parent component when values change
  useEffect(() => {
    onChange({
      imageUrl,
      pieces,
      difficulty,
      previewEnabled,
      correctPieces
    });
  }, [imageUrl, pieces, difficulty, previewEnabled, correctPieces, onChange]);

  // Handle image upload
  const handleImageUpload = (url: string) => {
    setImageUrl(url);
  };

  // Handle pieces change
  const handlePiecesChange = (value: number[]) => {
    setPieces(value[0]);
    
    // Reset correct pieces when total pieces changes
    setCorrectPieces([]);
  };

  // Toggle piece correctness
  const togglePieceCorrectness = (pieceIndex: number) => {
    if (correctPieces.includes(pieceIndex)) {
      setCorrectPieces(correctPieces.filter(p => p !== pieceIndex));
    } else {
      setCorrectPieces([...correctPieces, pieceIndex]);
    }
  };

  // Mark all pieces as correct
  const markAllCorrect = () => {
    const allPieces = Array.from({ length: pieces }, (_, i) => i);
    setCorrectPieces(allPieces);
  };

  // Clear all correct pieces
  const clearAllCorrect = () => {
    setCorrectPieces([]);
  };

  // Generate a grid of pieces for marking correct answers
  const renderPieceGrid = () => {
    const gridSize = Math.ceil(Math.sqrt(pieces));
    const pieceArray = Array.from({ length: pieces }, (_, i) => i);

    return (
      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}>
        {pieceArray.map(pieceIndex => (
          <Card 
            key={pieceIndex}
            className={`border cursor-pointer transition-all ${
              correctPieces.includes(pieceIndex) 
                ? 'border-green-300 bg-green-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => togglePieceCorrectness(pieceIndex)}
          >
            <CardContent className="p-3 flex flex-col items-center justify-center text-center">
              <div className="text-sm font-medium">Piece {pieceIndex + 1}</div>
              {correctPieces.includes(pieceIndex) && (
                <CheckCircle className="h-4 w-4 text-green-500 mt-1" />
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="config">Configuration</TabsTrigger>
          <TabsTrigger value="preview" disabled={!imageUrl}>Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="config" className="space-y-6">
          {/* Image Upload */}
          <div className="space-y-2">
            <FormLabel className="text-base flex items-center gap-2">
              Puzzle Image
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full p-0">
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">Upload an image that will be split into puzzle pieces.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </FormLabel>

            <ImageUploader
              onImageUpload={handleImageUpload}
              initialImageUrl={imageUrl}
              aspectRatio={1}
            />

            {!imageUrl && (
              <Alert className="bg-yellow-50 border-yellow-200">
                <AlertCircle className="h-4 w-4 text-yellow-500" />
                <AlertDescription className="text-sm text-yellow-700">
                  Please upload an image for the puzzle.
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Puzzle Configuration */}
          <div className="space-y-4">
            <FormLabel className="text-base">Puzzle Configuration</FormLabel>
            
            {/* Number of Pieces */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <FormLabel>Number of Pieces: {pieces}</FormLabel>
                <Badge variant="outline">{pieces} pieces</Badge>
              </div>
              <Slider
                value={[pieces]}
                min={4}
                max={16}
                step={1}
                onValueChange={handlePiecesChange}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Fewer (Easier)</span>
                <span>More (Harder)</span>
              </div>
            </div>

            {/* Difficulty */}
            <div className="space-y-2">
              <FormLabel>Difficulty Level</FormLabel>
              <Select
                value={difficulty}
                onValueChange={setDifficulty}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Preview Toggle */}
            <div className="flex items-center justify-between">
              <FormLabel className="text-base">Enable Preview</FormLabel>
              <Switch
                checked={previewEnabled}
                onCheckedChange={setPreviewEnabled}
              />
            </div>
          </div>

          {/* Correct Answers Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <FormLabel className="text-base">Mark Correct Pieces</FormLabel>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={markAllCorrect}
                >
                  Mark All
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={clearAllCorrect}
                >
                  Clear All
                </Button>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-3 flex items-start gap-2">
              <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-700">
                <p className="font-medium">How to mark correct pieces:</p>
                <p>Click on each piece that should be considered correct. Students will receive points for correctly placing these pieces.</p>
              </div>
            </div>

            {imageUrl ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    {correctPieces.length} of {pieces} pieces marked as correct ({Math.round((correctPieces.length / pieces) * 100)}%)
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>= Correct Piece</span>
                  </div>
                </div>
                
                {renderPieceGrid()}
                
                {correctPieces.length === 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 text-sm text-yellow-800">
                    <p className="font-medium">Warning: No correct pieces selected</p>
                    <p>Please mark at least one piece as correct by clicking on it.</p>
                  </div>
                )}
              </div>
            ) : (
              <Alert className="bg-gray-50 border-gray-200">
                <AlertDescription className="text-sm text-gray-700">
                  Please upload an image first to mark correct pieces.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </TabsContent>

        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Question Preview</CardTitle>
            </CardHeader>
            <CardContent>
              {!imageUrl ? (
                <Alert className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Please upload an image to see a preview.
                  </AlertDescription>
                </Alert>
              ) : (
                <SimplifiedPuzzleExercise
                  question={{
                    id: "preview",
                    questionText: "Complete the puzzle by arranging the pieces in the correct order",
                    questionData: {
                      imageUrl,
                      pieces,
                      difficulty,
                      previewEnabled,
                      correctPieces
                    }
                  }}
                  showAnswers={true}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}
