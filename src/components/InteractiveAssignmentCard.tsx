import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Users, BookOpen, Edit, Trash, Eye, Share2 } from 'lucide-react';
import { format } from 'date-fns';
import { InteractiveAssignment } from '@/types/interactiveAssignment';

interface InteractiveAssignmentCardProps {
  assignment: InteractiveAssignment;
  onEdit?: (assignment: InteractiveAssignment) => void;
  onDelete?: (assignment: InteractiveAssignment) => void;
  onView?: (assignment: InteractiveAssignment) => void;
  onShare?: (assignment: InteractiveAssignment) => void;
  isStudent?: boolean;
}

export function InteractiveAssignmentCard({
  assignment,
  onEdit,
  onDelete,
  onView,
  onShare,
  isStudent = false
}: InteractiveAssignmentCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'PUBLISHED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'ARCHIVED':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'MATCHING':
        return '🔄';
      case 'COMPLETION':
        return '✏️';
      case 'DRAWING':
        return '🎨';
      case 'COLORING':
        return '🖌️';
      case 'MULTIPLE_CHOICE':
        return '☑️';
      case 'ORDERING':
        return '🔢';
      case 'TRACING':
        return '✍️';
      case 'AUDIO_READING':
        return '🔊';
      case 'COUNTING':
        return '🔢';
      case 'IDENTIFICATION':
        return '🔍';
      case 'PUZZLE':
        return '🧩';
      case 'SORTING':
        return '📊';
      case 'HANDWRITING':
        return '✍️';
      case 'LETTER_TRACING':
        return '🔤';
      case 'NUMBER_RECOGNITION':
        return '🔢';
      case 'PICTURE_WORD_MATCHING':
        return '🖼️';
      case 'PATTERN_COMPLETION':
        return '🔄';
      case 'CATEGORIZATION':
        return '📋';
      default:
        return '📝';
    }
  };

  const isOverdue = new Date(assignment.dueDate) < new Date();

  return (
    <Card className="h-full flex flex-col hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <Badge variant="outline" className={`${getStatusColor(assignment.status)}`}>
            {assignment.status}
          </Badge>
          <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-100">
            {getTypeIcon(assignment.type)} {assignment.type}
          </Badge>
        </div>
        <CardTitle className="text-lg font-semibold line-clamp-2">{assignment.title}</CardTitle>
      </CardHeader>

      <CardContent className="flex-grow">
        <p className="text-gray-600 text-sm line-clamp-3 mb-4">{assignment.description}</p>

        <div className="space-y-2 text-sm">
          <div className="flex items-center text-gray-500">
            <Calendar className="h-4 w-4 mr-2" />
            <span>Due: {format(new Date(assignment.dueDate), 'MMM d, yyyy')}</span>
            {isOverdue && !isStudent && (
              <Badge variant="outline" className="ml-2 bg-red-50 text-red-800 border-red-100">
                Overdue
              </Badge>
            )}
          </div>

          {assignment.class && (
            <div className="flex items-center text-gray-500">
              <Users className="h-4 w-4 mr-2" />
              <span>{assignment.class.name} {assignment.class.section}</span>
            </div>
          )}

          {assignment.subject && (
            <div className="flex items-center text-gray-500">
              <BookOpen className="h-4 w-4 mr-2" />
              <span>{assignment.subject.name}</span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-2 flex justify-between">
        {isStudent ? (
          <Button
            className="w-full"
            onClick={() => onView && onView(assignment)}
          >
            Start Assignment
          </Button>
        ) : (
          <div className="flex space-x-2 w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onView && onView(assignment)}
            >
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit && onEdit(assignment)}
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onShare && onShare(assignment)}
            >
              <Share2 className="h-4 w-4 mr-1" />
              Share
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="text-red-500 hover:text-red-700"
              onClick={() => onDelete && onDelete(assignment)}
            >
              <Trash className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}

export default InteractiveAssignmentCard;
