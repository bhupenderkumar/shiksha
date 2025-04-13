import React, { useState, useRef, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Upload, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { PhotoType } from '@/types/idCard';

interface PhotoUploaderProps {
  onPhotoChange: (file: File | null) => void;
  photoType: PhotoType;
  initialPhoto?: string;
}

export const PhotoUploader: React.FC<PhotoUploaderProps> = ({
  onPhotoChange,
  photoType,
  initialPhoto,
}) => {
  const [preview, setPreview] = useState<string | null>(initialPhoto || null);
  const [isCapturing, setIsCapturing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Compress image function
  const compressImage = (file: File, maxWidth = 800, quality = 0.7): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          // Create canvas
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Calculate new dimensions while maintaining aspect ratio
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          // Draw and compress image
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Convert to blob with reduced quality
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Canvas to Blob conversion failed'));
                return;
              }
              
              // Create new file from blob
              const newFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              
              resolve(newFile);
            },
            'image/jpeg',
            quality
          );
        };
        img.onerror = () => {
          reject(new Error('Image loading error'));
        };
      };
      reader.onerror = () => {
        reject(new Error('File reading error'));
      };
    });
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (max 4MB)
    if (file.size > 4 * 1024 * 1024) {
      toast.error('File size should be less than 4MB');
      return;
    }

    try {
      // Compress the image
      const compressedFile = await compressImage(file);
      console.log(`Original size: ${(file.size / 1024).toFixed(2)}KB, Compressed size: ${(compressedFile.size / 1024).toFixed(2)}KB`);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result as string);
        onPhotoChange(compressedFile);
      };
      reader.readAsDataURL(compressedFile);
    } catch (error) {
      console.error('Error compressing image:', error);
      // Fall back to original file if compression fails
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result as string);
        onPhotoChange(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    try {
      // Use responsive dimensions and try to use environment camera on mobile
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      const facingMode = isMobile ? 'environment' : 'user'; // Use back camera on mobile devices
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 300 },
          height: { ideal: 300 }
        },
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCapturing(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error('Could not access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      setIsCapturing(false);
    }
  };

  const capturePhoto = async () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw video frame to canvas
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert canvas to blob with reduced quality (0.7)
        canvas.toBlob(async (blob) => {
          if (blob) {
            try {
              // Create file from blob
              const file = new File([blob], `${photoType}_photo.jpg`, { type: 'image/jpeg' });
              
              // Compress the captured image
              const compressedFile = await compressImage(file, 800, 0.7);
              console.log(`Camera capture - Original size: ${(file.size / 1024).toFixed(2)}KB, Compressed size: ${(compressedFile.size / 1024).toFixed(2)}KB`);
              
              // Set preview and notify parent
              const imageUrl = URL.createObjectURL(compressedFile);
              setPreview(imageUrl);
              onPhotoChange(compressedFile);
              
              // Stop camera
              stopCamera();
            } catch (error) {
              console.error('Error compressing captured image:', error);
              // Fall back to original file if compression fails
              const file = new File([blob], `${photoType}_photo.jpg`, { type: 'image/jpeg' });
              const imageUrl = URL.createObjectURL(blob);
              setPreview(imageUrl);
              onPhotoChange(file);
              stopCamera();
            }
          }
        }, 'image/jpeg', 0.8); // Initial quality reduced from 0.9 to 0.8
      }
    }
  };

  const handleRetake = () => {
    setPreview(null);
    onPhotoChange(null);
  };

  // Clean up on unmount
  React.useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const getPlaceholderText = () => {
    switch (photoType) {
      case 'student':
        return 'Student Photo';
      case 'father':
        return 'Father\'s Photo';
      case 'mother':
        return 'Mother\'s Photo';
      default:
        return 'Photo';
    }
  };

  return (
    <div className="space-y-2">
      {!isCapturing && !preview && (
        <div
          className="flex flex-col items-center justify-center w-full h-32 sm:h-40 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="flex flex-col items-center justify-center pt-3 pb-4 sm:pt-5 sm:pb-6">
            <Upload className="w-6 h-6 sm:w-8 sm:h-8 mb-1 sm:mb-2" />
            <p className="mb-1 sm:mb-2 text-xs sm:text-sm text-center px-2">
              <span className="font-semibold">Tap to upload</span> or use camera
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileChange}
            accept="image/*"
            capture={/iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ? "environment" : undefined}
          />
        </div>
      )}

      {!isCapturing && !preview && (
        <div className="flex justify-center space-x-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="text-xs sm:text-sm py-1 px-2 sm:py-2 sm:px-3 h-auto"
            onClick={() => fileInputRef.current?.click()}
          >
            Upload Photo
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="text-xs sm:text-sm py-1 px-2 sm:py-2 sm:px-3 h-auto"
            onClick={startCamera}
          >
            <Camera className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            Use Camera
          </Button>
        </div>
      )}

      {isCapturing && (
        <div className="space-y-2">
          <div className="relative w-full max-w-md mx-auto overflow-hidden rounded-lg">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-auto"
              style={{ maxHeight: '70vh' }} /* Prevent video from being too tall on mobile */
            />
            <canvas ref={canvasRef} className="hidden" />
          </div>
          <div className="flex justify-center space-x-2 mt-2">
            <Button
              type="button"
              variant="default"
              size="sm"
              className="text-xs sm:text-sm py-1 px-3 sm:py-2 sm:px-4 h-auto"
              onClick={capturePhoto}
            >
              <Camera className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              Capture
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-xs sm:text-sm py-1 px-3 sm:py-2 sm:px-4 h-auto"
              onClick={stopCamera}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {preview && (
        <div className="space-y-2">
          <div className="relative w-full max-w-md mx-auto overflow-hidden rounded-lg">
            <img
              src={preview}
              alt={getPlaceholderText()}
              className="w-full h-auto object-cover"
              style={{ maxHeight: '200px' }} /* Limit height on mobile */
            />
          </div>
          <div className="flex justify-center mt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-xs sm:text-sm py-1 px-3 sm:py-2 sm:px-4 h-auto"
              onClick={handleRetake}
            >
              <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              Retake
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};