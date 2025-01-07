import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash, Paperclip, Download, Calendar, Eye } from 'lucide-react';
import type { HomeworkType } from '@/services/homeworkService';
import { Badge } from '@/components/ui/badge';
import { fileService } from '@/services/fileService';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

type HomeworkCardProps = {
  homework: HomeworkType;
  onEdit?: (homework: HomeworkType) => void;
  onDelete?: (homework: HomeworkType) => void;
  isStudent?: boolean;
};

export function HomeworkCard({ homework, onEdit, onDelete, isStudent }: HomeworkCardProps) {
  const navigate = useNavigate();

  const handleDownload = async (fileId: string, fileName: string) => {
    try {
      await fileService.downloadFile(fileId, fileName, homework.id);
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Failed to download file');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "success" | "warning" | "error"> = {
      PENDING: "warning",
      COMPLETED: "success",
      OVERDUE: "error",
      SUBMITTED: "default"
    };

    return (
      <Badge variant={variants[status]}>
        {status.charAt(0) + status.slice(1).toLowerCase()}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold">{homework.title}</h3>
            <p className="text-sm text-gray-500">
              {homework.class?.name} - {homework.class?.section}
            </p>
            <p className="text-sm text-gray-500">
              Subject: {homework.subject?.name}
            </p>
          </div>
          {!isStudent && (
            <div className="flex space-x-2">
              {onEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent navigation
                    onEdit(homework);
                  }}
                >
                  <Edit className="w-4 h-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/homework/${homework.id}`)}
              >
                <Eye className="w-4 h-4" />
              </Button>
              {onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(homework);
                  }}
                >
                  <Trash className="w-4 h-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600">{homework.description}</p>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar className="w-4 h-4" />
            Due: {new Date(homework.dueDate).toLocaleDateString()}
          </div>
          {getStatusBadge(homework.status)}
        </div>

        {homework.attachments && homework.attachments.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Paperclip className="w-4 h-4" />
              Attachments
            </h4>
            <ul className="mt-2 space-y-2">
              {homework.attachments.map((file) => (
                <li key={file.id} className="flex items-center justify-between text-sm">
                  <span>{file.fileName}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownload(file.id, file.fileName)}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <p className="text-xs text-gray-400">
          Created {new Date(homework.createdAt).toLocaleDateString()}
        </p>
      </CardFooter>
    </Card>
  );
}
