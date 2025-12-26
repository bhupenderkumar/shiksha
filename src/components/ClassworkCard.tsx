import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash, Paperclip, Download, File } from 'lucide-react';
import type { ClassworkType } from '@/services/classworkService';
import { fileService } from '@/services/fileService';
import toast from 'react-hot-toast';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

export type AttachmentType = {
  id: string;          // Unique identifier for the attachment
  fileName: string;    // Name of the file
  filePath: string;    // Path to the file (URL or local path)
  fileType: string;    // Type of the file (e.g., image/jpeg, application/pdf)
  uploadedAt: string;  // Timestamp of when the file was uploaded
  // You can add more properties as needed, such as:
  // size: number;      // Size of the file in bytes
  // uploadedBy: string; // ID or name of the user who uploaded the file
};
type ClassworkCardProps = {
  classwork: ClassworkType;
  onEdit?: (classwork: ClassworkType) => void;
  onDelete?: (classwork: ClassworkType) => void;
  isStudent?: boolean;
  attachments?: AttachmentType[];
};

export function ClassworkCard({ classwork, onEdit, onDelete, isStudent, attachments }: ClassworkCardProps) {
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const descriptionLineLimit = 3;

  const handleDownload = async (filePath: string, fileName: string) => {
    try {
      await fileService.downloadFile(filePath, fileName);
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Failed to download file');
    }
  };

  const isImage = (fileName: string) => {
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName);
  };

  const toggleDescription = () => {
    setShowFullDescription(!showFullDescription);
  };

  useEffect(() => {
    const loadViewUrls = async () => {
      if (!attachments) return;
      
      const urlPromises = attachments
        .filter(att => isImage(att.fileName))
        .map(async (att) => {
          const viewUrl = await fileService.getViewUrl(att.filePath);
          return [att.filePath, viewUrl] as [string, string];
        });

      const urls = Object.fromEntries(await Promise.all(urlPromises));
      setImageUrls(urls);
    };

    loadViewUrls();
  }, [attachments]);

  const handleImageClick = async (filePath: string) => {
    try {
      const viewUrl = await fileService.getViewUrl(filePath);
      setPreviewImage(viewUrl);
    } catch (error) {
      console.error('Error getting view URL:', error);
      toast.error('Failed to load image preview');
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold truncate text-foreground" title={classwork.title}>
              {classwork.title}
            </h3>
            <p className="text-sm text-muted-foreground truncate" title={`${classwork.class?.name} - ${classwork.class?.section}`}>
              {classwork.class?.name} - {classwork.class?.section}
            </p>
            <p className="text-sm text-muted-foreground">
              {new Date(classwork.date).toLocaleDateString()}
            </p>
          </div>
          {!isStudent && (
            <div className="flex space-x-2">
              {onEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(classwork)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(classwork)}
                >
                  <Trash className="w-4 h-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className={showFullDescription ? "" : "line-clamp-3"}>
          <p className="text-sm text-muted-foreground">
            {classwork.description}
          </p>
        </div>
        {classwork.description.split('\n').length > descriptionLineLimit && (
          <button onClick={toggleDescription} className="text-primary text-sm hover:underline focus:outline-none">
            {showFullDescription ? "Show Less" : "Show More"}
          </button>
        )}

        {attachments && attachments.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Paperclip className="w-4 h-4" />
              Attachments
            </h4>
            <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {attachments.map((file) => (
                <div
                  key={file.id}
                  className="relative group rounded-lg overflow-hidden border border-gray-200"
                >
                  {isImage(file.fileName) ? (
                    <div className="aspect-square">
                      <img
                        src={imageUrls[file.filePath]}
                        alt={file.fileName}
                        className="w-full h-full object-cover cursor-pointer"
                        onClick={() => handleImageClick(file.filePath)}
                        onError={(e) => {
                          console.error('Image load error, falling back to public URL');
                          const img = e.target as HTMLImageElement;
                          img.src = fileService.getPublicUrl(file.filePath);
                        }}
                      />
                    </div>
                  ) : (
                    <div className="aspect-square flex flex-col items-center justify-center bg-gray-50">
                      <File className="w-8 h-8 text-gray-400" />
                      <span className="mt-2 text-xs text-gray-500 text-center px-2 truncate max-w-full">
                        {file.fileName}
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleDownload(file.filePath, file.fileName)}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <p className="text-xs text-gray-400">
          Created {new Date(classwork.createdAt).toLocaleDateString()}
        </p>
      </CardFooter>

      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="max-w-4xl p-0">
          {previewImage && (
            <div className="relative w-full h-full flex items-center justify-center bg-black/5">
              <img
                src={previewImage}
                alt="Preview"
                className="max-w-full max-h-[80vh] object-contain"
                onError={(e) => {
                  console.error('Preview load error, falling back to public URL');
                  const img = e.target as HTMLImageElement;
                  if (previewImage) {
                    img.src = fileService.getPublicUrl(previewImage);
                  }
                }}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
