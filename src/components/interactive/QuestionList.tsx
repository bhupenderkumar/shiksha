import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash, GripVertical } from 'lucide-react';

interface QuestionListProps {
  questions: any[];
  onReorder: (questions: any[]) => void;
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
}

export function QuestionList({
  questions,
  onReorder,
  onEdit,
  onDelete
}: QuestionListProps) {
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(questions);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    onReorder(items);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="questions">
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="space-y-2"
          >
            {questions.map((question, index) => (
              <Draggable
                key={question.id}
                draggableId={question.id}
                index={index}
              >
                {(provided) => (
                  <Card
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className="bg-white"
                  >
                    <CardContent className="flex items-center p-4">
                      <div
                        {...provided.dragHandleProps}
                        className="mr-2 cursor-move"
                      >
                        <GripVertical className="h-5 w-5 text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">
                          {index + 1}. {question.type}
                        </h4>
                        <p className="text-sm text-gray-500">
                          Points: {question.points}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(index)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(index)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}