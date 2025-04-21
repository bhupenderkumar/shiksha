import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface SubmissionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (status: 'draft' | 'publish') => void;
  assignment: any;
}

export function SubmissionDialog({
  isOpen,
  onClose,
  onConfirm,
  assignment
}: SubmissionDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save Assignment</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <h3 className="font-medium">Assignment Summary</h3>
          <div className="mt-2 text-sm text-gray-600">
            <p>Title: {assignment.title}</p>
            <p>Questions: {assignment.questions.length}</p>
            <p>Difficulty: {assignment.difficultyLevel}</p>
            <p>Estimated Time: {assignment.estimatedTimeMinutes} minutes</p>
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => onConfirm('draft')}>
            Save as Draft
          </Button>
          <Button onClick={() => onConfirm('publish')}>
            Publish
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}