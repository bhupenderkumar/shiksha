import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash, Paperclip, Download, File } from 'lucide-react';
import type { ClassworkType } from '@/services/classworkService';
import { fileService } from '@/services/fileService';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

type ClassworkCardProps = {
  classwork: ClassworkType;
  onEdit?: (classwork: ClassworkType) => void;
  onDelete?: (classwork: ClassworkType) => void;
  isStudent?: boolean;
};

export function ClassworkCard({ classwork, onEdit, onDelete, isStudent }: ClassworkCardProps) {
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
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

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold truncate" title={classwork.title}>
              {classwork.title}
            </h3>
            <p className="text-sm text-gray-500 truncate" title={`${classwork.class?.name} - ${classwork.class?.section}`}>
              {classwork.class?.name} - {classwork.class?.section}
            </p>
            <p className="text-sm text-gray-500">
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
          <p className="text-sm text-gray-600">
            {classwork.description}
          </p>
        </div>
        {classwork.description.split('\n').length > descriptionLineLimit && (
          <button onClick={toggleDescription} className="text-blue-500 text-sm hover:underline focus:outline-none">
            {showFullDescription ? "Show Less" : "Show More"}
          </button>
        )}

        {classwork.attachments && classwork.attachments.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Paperclip className="w-4 h-4" />
              Attachments
            </h4>
            <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {classwork.attachments.map((file) => (
                <div
                  key={file.id}
                  className="relative group rounded-lg overflow-hidden border border-gray-200"
                >
                  {isImage(file.fileName) ? (
                    <div className="aspect-square">
                      <img
                        src={fileService.getPublicUrl(file.filePath)}
                        alt={file.fileName}
                        className="w-full h-full object-cover cursor-pointer"
                        onClick={() => setPreviewImage(fileService.getPublicUrl(file.filePath))}
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
            <img
              src={previewImage}
              alt="Preview"
              className="w-full h-auto"
            />
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
