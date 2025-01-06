import { Dialog } from './ui/dialog';
import { Button } from './ui/button';
import { format } from 'date-fns';
import { Download, Upload } from 'lucide-react';
import type { Homework } from '@/types/homework';

interface HomeworkDetailsDialogProps {
  homework: Homework;
  open: boolean;
  onClose: () => void;
  onSubmit?: () => void;
  isStudent?: boolean;
}

export function HomeworkDetailsDialog({
  homework,
  open,
  onClose,
  onSubmit,
  isStudent
}: HomeworkDetailsDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={homework.title}
      className="max-w-2xl"
    >
      <div className="space-y-6">
        <div className="prose prose-sm max-w-none">
          <p className="font-handwriting text-gray-600">{homework.description}</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          <p className="font-handwriting">
            <span className="font-medium">Subject:</span> {homework.subject.name}
          </p>
          <p className="font-handwriting">
            <span className="font-medium">Class:</span> {homework.class.name}
          </p>
          <p className="font-handwriting">
            <span className="font-medium">Due Date:</span>{' '}
            {format(new Date(homework.dueDate), 'PPP p')}
          </p>
        </div>

        {homework.attachments && homework.attachments.length > 0 && (
          <div>
            <h4 className="font-display text-primary-600 mb-2">Attachments</h4>
            <div className="space-y-2">
              {homework.attachments.map((file) => (
                <Button
                  key={file.id}
                  variant="outline"
                  className="w-full justify-start font-handwriting"
                  onClick={() => window.open(file.url)}
                >
                  <Download className="w-4 h-4 mr-2" />
                  {file.fileName}
                </Button>
              ))}
            </div>
          </div>
        )}

        {isStudent && (
          <div className="flex justify-end">
            <Button onClick={onSubmit}>
              <Upload className="w-4 h-4 mr-2" />
              Submit Homework
            </Button>
          </div>
        )}
      </div>
    </Dialog>
  );
} 