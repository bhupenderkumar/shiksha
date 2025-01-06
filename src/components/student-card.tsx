import { Student } from '@/types/student';
import { AnimatedCard } from './ui/animated-card';
import { Button } from './ui/button';
import { UserCircle, Edit, Trash } from 'lucide-react';

interface StudentCardProps {
  student: Student;
  onEdit: () => void;
  onDelete: () => void;
}

export function StudentCard({ student, onEdit, onDelete }: StudentCardProps) {
  return (
    <AnimatedCard className="bg-gradient-to-br from-white to-primary-50">
      <div className="flex items-start space-x-4">
        <div className="p-2 bg-primary-100 rounded-full text-primary-600">
          <UserCircle size={40} />
        </div>
        <div className="flex-1">
          <h3 className="font-display text-lg text-primary-600 mb-1">
            {student.name}
          </h3>
          <div className="space-y-1 text-sm text-gray-500 font-handwriting">
            <p>Admission: {student.admissionNumber}</p>
            <p>Class: {student.class?.name} {student.class?.section}</p>
          </div>
          <div className="flex space-x-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={onEdit}
              className="font-handwriting"
            >
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={onDelete}
              className="font-handwriting"
            >
              <Trash className="w-4 h-4 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      </div>
    </AnimatedCard>
  );
} 