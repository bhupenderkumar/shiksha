import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Users, BookOpen, Edit, Trash, Eye, Share2, Play } from 'lucide-react';
import { format } from 'date-fns';
import { InteractiveAssignment } from '@/types/interactiveAssignment';
import { PlayButton } from '@/components/ui/play-button';
import { interactiveAssignmentService } from '@/services/interactiveAssignmentService';

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
  const [playUrl, setPlayUrl] = useState<string>('');
  const [isGeneratingUrl, setIsGeneratingUrl] = useState<boolean>(false);

  // Generate the play URL when the component mounts
  useEffect(() => {
    const generatePlayUrl = async () => {
      if (!assignment.id) return;

      try {
        setIsGeneratingUrl(true);
        // Generate a shareable link for the assignment
        const link = await interactiveAssignmentService.generateShareableLink(assignment.id);
        if (link) {
          setPlayUrl(link);
        }
      } catch (error) {
        console.error('Error generating play URL:', error);
      } finally {
        setIsGeneratingUrl(false);
      }
    };

    generatePlayUrl();
  }, [assignment.id]);
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return 'border-yellow-200 dark:border-yellow-700';
      case 'PUBLISHED':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/40 dark:text-green-300 dark:border-green-700';
      case 'ARCHIVED':
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-700';
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
    <Card className="h-full flex flex-col hover:shadow-md transition-shadow overflow-hidden">
      <CardHeader className="pb-2 px-4 pt-4">
        <div className="flex justify-between items-start mb-2">
          <Badge variant="outline" className={`${getStatusColor(assignment.status)}`}>
            {assignment.status}
          </Badge>
          <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-100 truncate max-w-[50%]">
            {getTypeIcon(assignment.type)} {assignment.type.replace(/_/g, ' ')}
          </Badge>
        </div>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold line-clamp-2 flex-1">{assignment.title}</CardTitle>
          {playUrl ? (
            <PlayButton
              url={playUrl}
              variant="outline"
              size="sm"
              className="ml-2 flex-shrink-0 bg-white hover:bg-blue-50 border-blue-200 text-blue-600 sm:block hidden"
              label=""
            />
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="ml-2 flex-shrink-0 bg-white hover:bg-blue-50 border-blue-200 text-blue-600 opacity-50 sm:block hidden"
              disabled={true}
            >
              <Play className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-grow px-4 py-2">
        <p className="text-gray-600 text-sm line-clamp-3 mb-4">{assignment.description}</p>

        <div className="space-y-2 text-sm">
          <div className="flex items-center text-gray-500 flex-wrap">
            <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="truncate">Due: {format(new Date(assignment.dueDate), 'MMM d, yyyy')}</span>
            {isOverdue && !isStudent && (
              <Badge variant="outline" className="ml-2 bg-red-50 text-red-800 border-red-100 flex-shrink-0">
                Overdue
              </Badge>
            )}
          </div>

          {assignment.class && (
            <div className="flex items-center text-gray-500">
              <Users className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="truncate">{assignment.class.name} {assignment.class.section}</span>
            </div>
          )}

          {assignment.subject && (
            <div className="flex items-center text-gray-500">
              <BookOpen className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="truncate">{assignment.subject.name}</span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-2 px-4 pb-4">
        {isStudent ? (
          <div className="w-full flex gap-2">
            <Button
              className="flex-1"
              onClick={() => onView && onView(assignment)}
            >
              Start Assignment
            </Button>
            {playUrl ? (
              <PlayButton
                url={playUrl}
                variant="outline"
                size="icon"
                className="flex-shrink-0 h-10 w-10 bg-white hover:bg-blue-50 border-blue-200 text-blue-600"
                label=""
                mobileHighlight={true}
              />
            ) : (
              <Button
                variant="outline"
                size="icon"
                className="flex-shrink-0 h-10 w-10 bg-white hover:bg-blue-50 border-blue-200 text-blue-600 opacity-50"
                disabled={true}
              >
                <Play className="h-4 w-4" />
              </Button>
            )}
          </div>
        ) : (
          <div className="w-full">
            {/* Desktop view - 2x2 grid */}
            <div className="hidden sm:block w-full">
              {/* First row of buttons */}
              <div className="flex justify-between gap-2 mb-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => onView && onView(assignment)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => onEdit && onEdit(assignment)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>

                {playUrl ? (
                  <PlayButton
                    url={playUrl}
                    variant="outline"
                    size="sm"
                    className="flex-shrink-0 bg-white hover:bg-blue-50 border-blue-200 text-blue-600"
                    label="Play"
                    mobileHighlight={false}
                  />
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-shrink-0 bg-white hover:bg-blue-50 border-blue-200 text-blue-600 opacity-50"
                    disabled={true}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Play
                  </Button>
                )}
              </div>

              {/* Second row of buttons */}
              <div className="flex justify-between gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => onShare && onShare(assignment)}
                >
                  <Share2 className="h-4 w-4 mr-1" />
                  Share
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={() => onDelete && onDelete(assignment)}
                >
                  <Trash className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </div>

            {/* Mobile view - icon buttons in a single row */}
            <div className="flex sm:hidden justify-between w-full">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => onView && onView(assignment)}
                title="View"
              >
                <Eye className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => onEdit && onEdit(assignment)}
                title="Edit"
              >
                <Edit className="h-4 w-4" />
              </Button>

              {playUrl ? (
                <PlayButton
                  url={playUrl}
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 bg-white hover:bg-blue-50 border-blue-200 text-blue-600"
                  label=""
                  mobileHighlight={true}
                />
              ) : (
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 bg-white hover:bg-blue-50 border-blue-200 text-blue-600 opacity-50"
                  disabled={true}
                >
                  <Play className="h-4 w-4" />
                </Button>
              )}

              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => onShare && onShare(assignment)}
                title="Share"
              >
                <Share2 className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                onClick={() => onDelete && onDelete(assignment)}
                title="Delete"
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}

export default InteractiveAssignmentCard;
