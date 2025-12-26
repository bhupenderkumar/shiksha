import React, { useState, useEffect } from 'react';
import { useAnonymousUser } from '@/contexts/AnonymousUserContext';
import { anonymousUserService } from '@/services/anonymousUserService';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Award, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface CompletedAssignmentsSidebarProps {
  className?: string;
}

export function CompletedAssignmentsSidebar({ className = '' }: CompletedAssignmentsSidebarProps) {
  const { anonymousUser } = useAnonymousUser();
  const [completedAssignments, setCompletedAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchCompletedAssignments = async () => {
      if (!anonymousUser) return;
      
      setLoading(true);
      try {
        const assignments = await anonymousUserService.getCompletedAssignments(anonymousUser.id);
        setCompletedAssignments(assignments);
      } catch (error) {
        console.error('Error fetching completed assignments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompletedAssignments();
  }, [anonymousUser]);

  if (!anonymousUser || completedAssignments.length === 0) return null;

  return (
    <>
      {/* Toggle button */}
      <Button
        variant="outline"
        size="icon"
        className="fixed right-0 top-1/2 transform -translate-y-1/2 z-20 bg-white shadow-md rounded-l-md rounded-r-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <ChevronRight /> : <ChevronLeft />}
      </Button>

      {/* Sidebar */}
      <div
        className={`fixed right-0 top-0 h-full bg-white shadow-lg z-10 transition-all duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } ${className}`}
        style={{ width: '300px' }}
      >
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold flex items-center">
            <Award className="mr-2 h-5 w-5 text-yellow-500" />
            Your Completed Activities
          </h3>
        </div>

        <ScrollArea className="h-[calc(100vh-64px)]">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {completedAssignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="border rounded-md p-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{assignment.assignment?.title || 'Unnamed Assignment'}</h4>
                      <p className="text-sm text-gray-500 mt-1">
                        {assignment.assignment?.type
                          ? assignment.assignment.type.split('_').map((word: string) => 
                              word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                            ).join(' ')
                          : 'Interactive Assignment'}
                      </p>
                    </div>
                    <div className="bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 text-sm font-medium px-2 py-1 rounded">
                      {assignment.score}%
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-400">
                    Completed {assignment.completed_at 
                      ? formatDistanceToNow(new Date(assignment.completed_at), { addSuffix: true }) 
                      : 'recently'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    </>
  );
}

export default CompletedAssignmentsSidebar;
