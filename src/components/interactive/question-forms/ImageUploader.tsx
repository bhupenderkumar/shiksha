import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, Image } from "lucide-react";
import { fileService } from "@/services/fileService";
import toast from "react-hot-toast";
import { supabase } from "@/lib/api-client";

interface ImageUploaderProps {
  onImageUploaded: (imageUrl: string) => void;
  placeholder?: string;
  className?: string;
}

export function ImageUploader({
  onImageUploaded,
  placeholder = "Upload Image",
  className = "",
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    try {
      setIsUploading(true);
      toast.loading("Uploading image...", { id: "image-upload" });

      // Upload the file to Supabase
      const filePath = `interactive-assignments/questions/${Date.now()}_${file.name}`;
      const uploadedFile = await fileService.uploadFile(file, filePath);

      if (!uploadedFile) {
        throw new Error("Failed to upload image");
      }

      // Get the public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from("File")
        .getPublicUrl(uploadedFile.path);

      // Call the callback with the image URL
      onImageUploaded(publicUrl);
      toast.success("Image uploaded successfully", { id: "image-upload" });
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error(
        `Failed to upload image: ${error instanceof Error ? error.message : "Unknown error"}`,
        { id: "image-upload" }
      );
    } finally {
      setIsUploading(false);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className={`${className}`}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      <Button
        type="button"
        variant="outline"
        className="w-full h-20"
        onClick={triggerFileInput}
        disabled={isUploading}
      >
        {isUploading ? (
          <div className="flex items-center">
            <div className="animate-spin mr-2 h-4 w-4 border-2 border-gray-500 border-t-transparent rounded-full"></div>
            Uploading...
          </div>
        ) : (
          <>
            <Upload className="h-4 w-4 mr-2" />
            {placeholder}
          </>
        )}
      </Button>
    </div>
  );
}
