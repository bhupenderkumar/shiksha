import React from 'react';
import { Homework } from '@prisma/client';
import { Button } from './ui/button';

interface HomeworkCardProps {
  homework: Homework;
  isEditable: boolean;
  onEdit: (homework: Homework) => void;
  onDelete: (id: string) => void;
}

const HomeworkCard: React.FC<HomeworkCardProps> = ({ homework, isEditable, onEdit, onDelete }) => {
  return (
    <div className="border rounded-lg p-4 shadow-md">
      <h3 className="text-lg font-semibold">{homework.title}</h3>
      <p className="text-gray-600">{homework.description}</p>
      <p className="text-gray-500">Due Date: {new Date(homework.dueDate).toLocaleDateString()}</p>
      <div className="mt-4">
        {isEditable && (
          <>
            <Button onClick={() => onEdit(homework)} className="mr-2">
              Edit
            </Button>
            <Button onClick={() => onDelete(homework.id)} variant="destructive">
              Delete
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default HomeworkCard; 