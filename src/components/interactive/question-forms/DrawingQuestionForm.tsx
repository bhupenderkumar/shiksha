import { useState, useEffect } from "react";
import { FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, Image } from "lucide-react";
import { Slider } from "@/components/ui/slider";

interface DrawingQuestionFormProps {
  value: any;
  onChange: (value: any) => void;
  error?: any;
}

export function DrawingQuestionForm({
  value,
  onChange,
  error
}: DrawingQuestionFormProps) {
  const [instructions, setInstructions] = useState<string>(value?.instructions || "");
  const [backgroundImageUrl, setBackgroundImageUrl] = useState<string>(value?.backgroundImageUrl || "");
  const [canvasWidth, setCanvasWidth] = useState<number>(value?.canvasWidth || 600);
  const [canvasHeight, setCanvasHeight] = useState<number>(value?.canvasHeight || 400);

  // Update parent component when values change
  useEffect(() => {
    onChange({
      instructions,
      backgroundImageUrl,
      canvasWidth,
      canvasHeight
    });
  }, [instructions, backgroundImageUrl, canvasWidth, canvasHeight, onChange]);

  // Mock function for image upload - in a real implementation, this would handle file uploads
  const handleImageUpload = () => {
    // This is a placeholder - in a real implementation, you would handle file uploads
    const mockImageUrl = "https://example.com/images/drawing-background.jpg";
    setBackgroundImageUrl(mockImageUrl);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <FormLabel className="text-base">Drawing Instructions</FormLabel>
        <Textarea
          placeholder="Enter instructions for the drawing exercise"
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          className="min-h-[100px]"
        />
      </div>

      <div className="space-y-4">
        <FormLabel className="text-base">Background Image (Optional)</FormLabel>
        <div className="flex items-center gap-4">
          {backgroundImageUrl ? (
            <Card className="w-full border border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Image className="h-5 w-5 text-gray-500" />
                  <span className="text-sm truncate flex-1">{backgroundImageUrl.split('/').pop()}</span>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => setBackgroundImageUrl("")}
                  >
                    Remove
                  </Button>
                </div>
                <div className="mt-2 border rounded-md overflow-hidden">
                  <img 
                    src={backgroundImageUrl} 
                    alt="Background" 
                    className="max-h-[200px] object-contain mx-auto"
                  />
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="flex-1 p-4 border rounded-md text-gray-500 text-sm flex flex-col items-center justify-center min-h-[100px]">
              <Image className="h-8 w-8 mb-2 text-gray-400" />
              <p>No background image uploaded</p>
            </div>
          )}
        </div>
        <Button type="button" variant="outline" onClick={handleImageUpload}>
          <Upload className="h-4 w-4 mr-2" />
          Upload Background Image
        </Button>
      </div>

      <div className="space-y-4">
        <FormLabel className="text-base">Canvas Size</FormLabel>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <FormLabel className="text-sm">Width (px)</FormLabel>
            <div className="flex items-center gap-4">
              <Slider
                value={[canvasWidth]}
                min={300}
                max={1200}
                step={50}
                onValueChange={(value) => setCanvasWidth(value[0])}
                className="flex-1"
              />
              <Input
                type="number"
                value={canvasWidth}
                onChange={(e) => setCanvasWidth(Number(e.target.value))}
                className="w-20"
                min={300}
                max={1200}
              />
            </div>
          </div>
          <div className="space-y-2">
            <FormLabel className="text-sm">Height (px)</FormLabel>
            <div className="flex items-center gap-4">
              <Slider
                value={[canvasHeight]}
                min={200}
                max={800}
                step={50}
                onValueChange={(value) => setCanvasHeight(value[0])}
                className="flex-1"
              />
              <Input
                type="number"
                value={canvasHeight}
                onChange={(e) => setCanvasHeight(Number(e.target.value))}
                className="w-20"
                min={200}
                max={800}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="border rounded-md p-4 bg-gray-50">
        <div className="text-sm text-gray-500 mb-2">Canvas Preview</div>
        <div 
          className="border border-dashed border-gray-300 bg-white"
          style={{ 
            width: '100%', 
            height: '200px',
            maxWidth: `${canvasWidth}px`,
            maxHeight: `${canvasHeight}px`,
            aspectRatio: `${canvasWidth} / ${canvasHeight}`,
            backgroundImage: backgroundImageUrl ? `url(${backgroundImageUrl})` : 'none',
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            {!backgroundImageUrl && "Drawing Canvas"}
          </div>
        </div>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}
