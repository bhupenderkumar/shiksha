import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormLabel } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash, ArrowRight, Upload, Image } from "lucide-react";

interface MatchingQuestionFormProps {
  value: any;
  onChange: (value: any) => void;
  error?: any;
}

export function MatchingQuestionForm2({
  value,
  onChange,
  error
}: MatchingQuestionFormProps) {
  const [pairs, setPairs] = useState<any[]>(
    value?.pairs || [
      { id: uuidv4(), left: "", right: "", leftType: "text", rightType: "text" },
      { id: uuidv4(), left: "", right: "", leftType: "text", rightType: "text" }
    ]
  );

  // Update parent component when pairs change
  useEffect(() => {
    onChange({ pairs });
  }, [pairs, onChange]);

  const addPair = () => {
    setPairs([...pairs, { id: uuidv4(), left: "", right: "", leftType: "text", rightType: "text" }]);
  };

  const removePair = (index: number) => {
    if (pairs.length <= 2) {
      return; // Maintain at least 2 pairs
    }
    const newPairs = [...pairs];
    newPairs.splice(index, 1);
    setPairs(newPairs);
  };

  const updatePair = (index: number, field: string, value: string) => {
    const newPairs = [...pairs];
    newPairs[index] = { ...newPairs[index], [field]: value };
    setPairs(newPairs);
  };

  // Mock function for image upload - in a real implementation, this would handle file uploads
  const handleImageUpload = (index: number, side: 'left' | 'right') => {
    // This is a placeholder - in a real implementation, you would handle file uploads
    const mockImageUrl = `https://example.com/images/matching-${side}-${index}.jpg`;
    const newPairs = [...pairs];
    newPairs[index] = { ...newPairs[index], [side]: mockImageUrl };
    setPairs(newPairs);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <FormLabel className="text-base">Matching Pairs</FormLabel>
        <p className="text-sm text-gray-500">Create pairs of items that students will match together.</p>
        
        {pairs.map((pair, index) => (
          <Card key={pair.id} className="border border-gray-200">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] gap-2 items-start">
                {/* Left Item */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <FormLabel className="text-sm">Left Item</FormLabel>
                    <Select
                      value={pair.leftType}
                      onValueChange={(value) => updatePair(index, "leftType", value)}
                    >
                      <SelectTrigger className="w-24 h-7 text-xs">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Text</SelectItem>
                        <SelectItem value="image">Image</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {pair.leftType === "text" ? (
                    <Input
                      placeholder="Enter left item"
                      value={pair.left}
                      onChange={(e) => updatePair(index, "left", e.target.value)}
                    />
                  ) : (
                    <div className="space-y-2">
                      {pair.left ? (
                        <div className="border rounded-md p-2 flex flex-col items-center">
                          <img 
                            src={pair.left} 
                            alt="Left item" 
                            className="max-h-[100px] object-contain"
                          />
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm"
                            onClick={() => updatePair(index, "left", "")}
                            className="mt-2"
                          >
                            Remove
                          </Button>
                        </div>
                      ) : (
                        <Button 
                          type="button" 
                          variant="outline" 
                          className="w-full h-20"
                          onClick={() => handleImageUpload(index, 'left')}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Image
                        </Button>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Arrow */}
                <div className="flex items-center justify-center py-4">
                  <ArrowRight className="h-5 w-5 text-gray-400" />
                </div>
                
                {/* Right Item */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <FormLabel className="text-sm">Right Item</FormLabel>
                    <Select
                      value={pair.rightType}
                      onValueChange={(value) => updatePair(index, "rightType", value)}
                    >
                      <SelectTrigger className="w-24 h-7 text-xs">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Text</SelectItem>
                        <SelectItem value="image">Image</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {pair.rightType === "text" ? (
                    <Input
                      placeholder="Enter right item"
                      value={pair.right}
                      onChange={(e) => updatePair(index, "right", e.target.value)}
                    />
                  ) : (
                    <div className="space-y-2">
                      {pair.right ? (
                        <div className="border rounded-md p-2 flex flex-col items-center">
                          <img 
                            src={pair.right} 
                            alt="Right item" 
                            className="max-h-[100px] object-contain"
                          />
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm"
                            onClick={() => updatePair(index, "right", "")}
                            className="mt-2"
                          >
                            Remove
                          </Button>
                        </div>
                      ) : (
                        <Button 
                          type="button" 
                          variant="outline" 
                          className="w-full h-20"
                          onClick={() => handleImageUpload(index, 'right')}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Image
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Remove Button */}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removePair(index)}
                disabled={pairs.length <= 2}
                className="absolute top-2 right-2"
              >
                <Trash className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={addPair}
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Pair
      </Button>

      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}
