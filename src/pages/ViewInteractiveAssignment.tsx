import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { interactiveAssignmentService } from "@/services/interactiveAssignmentService";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { toast } from "react-hot-toast";
import { ROUTES } from "@/constants/app-constants";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Trash, Share2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { useProfileAccess } from "@/services/profileService";
import { format } from "date-fns";

export default function ViewInteractiveAssignment() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isAdminOrTeacher } = useProfileAccess();
  const [assignment, setAssignment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [shareableLink, setShareableLink] = useState("");

  useEffect(() => {
    if (!id) {
      setError("Assignment ID is required");
      setLoading(false);
      return;
    }

    const fetchAssignment = async () => {
      try {
        const data = await interactiveAssignmentService.getById(id);
        if (!data) {
          setError("Assignment not found");
          return;
        }
        setAssignment(data);
      } catch (err) {
        console.error("Error fetching assignment:", err);
        setError("Failed to load assignment");
      } finally {
        setLoading(false);
      }
    };

    fetchAssignment();
  }, [id]);

  const handleDelete = async () => {
    if (!id) return;

    try {
      const success = await interactiveAssignmentService.delete(id);
      if (success) {
        toast.success("Assignment deleted successfully");
        navigate(ROUTES.INTERACTIVE_ASSIGNMENTS);
      }
    } catch (error) {
      console.error("Error deleting assignment:", error);
      toast.error("Failed to delete assignment");
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };

  const handleShare = async () => {
    if (!id) return;

    try {
      const link = await interactiveAssignmentService.generateShareableLink(id);
      if (link) {
        setShareableLink(link);
        setIsShareDialogOpen(true);
      }
    } catch (error) {
      console.error("Error generating shareable link:", error);
      toast.error("Failed to generate shareable link");
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareableLink);
    toast.success("Link copied to clipboard");
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "DRAFT":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
      case "PUBLISHED":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "ARCHIVED":
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
      default:
        return "bg-blue-100 text-blue-800 hover:bg-blue-100";
    }
  };

  const formatDate = (date: string | Date) => {
    return format(new Date(date), "PPP");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={() => navigate(ROUTES.INTERACTIVE_ASSIGNMENTS)} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Assignments
          </Button>
        </div>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button variant="ghost" onClick={() => navigate(ROUTES.INTERACTIVE_ASSIGNMENTS)} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Assignments
          </Button>
          <h1 className="text-2xl font-bold">View Assignment</h1>
        </div>
        
        {isAdminOrTeacher && (
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" onClick={() => navigate(`${ROUTES.INTERACTIVE_ASSIGNMENT_EDIT.replace(':id', id!)}`)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button variant="outline" className="text-red-500 hover:text-red-700" onClick={() => setIsDeleteDialogOpen(true)}>
              <Trash className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        )}
      </div>

      {assignment && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">{assignment.title}</CardTitle>
                  <CardDescription className="mt-2">{assignment.description}</CardDescription>
                </div>
                <Badge className={getStatusBadgeColor(assignment.status)}>
                  {assignment.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Assignment Type</h3>
                  <p>{assignment.type.split('_').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Due Date</h3>
                  <p>{formatDate(assignment.dueDate)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Difficulty Level</h3>
                  <p>{assignment.difficultyLevel ? assignment.difficultyLevel.charAt(0).toUpperCase() + assignment.difficultyLevel.slice(1) : 'Not specified'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Class</h3>
                  <p>{assignment.class ? `${assignment.class.name} ${assignment.class.section}` : 'Not specified'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Subject</h3>
                  <p>{assignment.subject ? assignment.subject.name : 'Not specified'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Estimated Time</h3>
                  <p>{assignment.estimatedTimeMinutes ? `${assignment.estimatedTimeMinutes} minutes` : 'Not specified'}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${assignment.hasAudioFeedback ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <span>Audio Feedback</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${assignment.hasCelebration ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <span>Celebration</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${assignment.requiresParentHelp ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <span>Parent Help Required</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Questions</CardTitle>
              <CardDescription>This assignment has {assignment.questions?.length || 0} questions</CardDescription>
            </CardHeader>
            <CardContent>
              {assignment.questions && assignment.questions.length > 0 ? (
                <div className="space-y-4">
                  {assignment.questions.map((question: any, index: number) => (
                    <Card key={index} className="border border-gray-200">
                      <CardContent className="p-4">
                        <div>
                          <h3 className="font-medium">Question {index + 1}</h3>
                          <p className="text-sm text-gray-500">Type: {question.questionType}</p>
                          <p className="mt-2">{question.questionText}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <p>No questions available for this assignment.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the assignment and all associated submissions.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Share Dialog */}
      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Assignment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p>Share this link with students to complete the assignment:</p>
            <div className="flex items-center space-x-2">
              <Input value={shareableLink} readOnly className="flex-1" />
              <Button onClick={copyToClipboard}>Copy</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
