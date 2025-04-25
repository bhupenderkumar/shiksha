import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { interactiveAssignmentService } from "@/services/interactiveAssignmentService";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Search, Calendar, Clock, BookOpen, Users, Edit, Trash, Share2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "react-hot-toast";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { InteractiveAssignment, InteractiveAssignmentStatus, InteractiveAssignmentType } from "@/types/interactiveAssignment";

export function InteractiveAssignmentsPage() {
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const [assignments, setAssignments] = useState<InteractiveAssignment[]>([]);
  const [filteredAssignments, setFilteredAssignments] = useState<InteractiveAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<InteractiveAssignmentStatus>("PUBLISHED");
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<InteractiveAssignmentType | "">("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [assignmentToDelete, setAssignmentToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchAssignments();
  }, []);

  useEffect(() => {
    filterAssignments();
  }, [assignments, activeTab, searchTerm, typeFilter]);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const data = await interactiveAssignmentService.getAll(role || "TEACHER");
      setAssignments(data);
    } catch (error) {
      console.error("Error fetching assignments:", error);
      toast.error("Failed to load assignments");
    } finally {
      setLoading(false);
    }
  };

  const filterAssignments = () => {
    let filtered = assignments.filter(assignment => assignment.status === activeTab);

    if (searchTerm) {
      filtered = filtered.filter(
        assignment =>
          assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          assignment.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (typeFilter) {
      filtered = filtered.filter(assignment => assignment.type === typeFilter);
    }

    setFilteredAssignments(filtered);
  };

  const handleCreateAssignment = () => {
    navigate("/interactive/assignments/create");
  };

  const handleEditAssignment = (id: string) => {
    navigate(`/interactive/assignments/edit/${id}`);
  };

  const handleViewAssignment = (id: string) => {
    navigate(`/interactive/assignments/${id}`);
  };

  const confirmDelete = (id: string) => {
    setAssignmentToDelete(id);
    setShowDeleteDialog(true);
  };

  const handleDeleteAssignment = async () => {
    if (!assignmentToDelete) return;

    try {
      const success = await interactiveAssignmentService.delete(assignmentToDelete);
      if (success) {
        setAssignments(assignments.filter(a => a.id !== assignmentToDelete));
        toast.success("Assignment deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting assignment:", error);
      toast.error("Failed to delete assignment");
    } finally {
      setShowDeleteDialog(false);
      setAssignmentToDelete(null);
    }
  };

  const handleShareAssignment = async (id: string) => {
    try {
      const link = await interactiveAssignmentService.generateShareableLink(id);
      if (link) {
        navigator.clipboard.writeText(link);
        toast.success("Shareable link copied to clipboard");
      }
    } catch (error) {
      console.error("Error generating shareable link:", error);
      toast.error("Failed to generate shareable link");
    }
  };

  const getStatusBadgeColor = (status: InteractiveAssignmentStatus) => {
    switch (status) {
      case "PUBLISHED":
        return "bg-green-100 text-green-800";
      case "DRAFT":
        return "bg-yellow-100 text-yellow-800";
      case "ARCHIVED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const getTypeIcon = (type: InteractiveAssignmentType) => {
    switch (type) {
      case "MATCHING":
        return <div className="w-6 h-6 flex items-center justify-center bg-blue-100 text-blue-800 rounded-full">M</div>;
      case "MULTIPLE_CHOICE":
        return <div className="w-6 h-6 flex items-center justify-center bg-purple-100 text-purple-800 rounded-full">MC</div>;
      case "DRAWING":
        return <div className="w-6 h-6 flex items-center justify-center bg-pink-100 text-pink-800 rounded-full">D</div>;
      case "AUDIO_READING":
        return <div className="w-6 h-6 flex items-center justify-center bg-green-100 text-green-800 rounded-full">AR</div>;
      case "COMPLETION":
        return <div className="w-6 h-6 flex items-center justify-center bg-yellow-100 text-yellow-800 rounded-full">C</div>;
      default:
        return <div className="w-6 h-6 flex items-center justify-center bg-gray-100 text-gray-800 rounded-full">?</div>;
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Interactive Assignments</h1>
        <Button onClick={handleCreateAssignment}>
          <Plus className="mr-2 h-4 w-4" />
          Create Assignment
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Search assignments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Types</SelectItem>
            <SelectItem value="MATCHING">Matching</SelectItem>
            <SelectItem value="MULTIPLE_CHOICE">Multiple Choice</SelectItem>
            <SelectItem value="DRAWING">Drawing</SelectItem>
            <SelectItem value="AUDIO_READING">Audio Reading</SelectItem>
            <SelectItem value="COMPLETION">Completion</SelectItem>
            <SelectItem value="ORDERING">Ordering</SelectItem>
            <SelectItem value="SORTING">Sorting</SelectItem>
            <SelectItem value="PUZZLE">Puzzle</SelectItem>
            <SelectItem value="IDENTIFICATION">Identification</SelectItem>
            <SelectItem value="COUNTING">Counting</SelectItem>
            <SelectItem value="TRACING">Tracing</SelectItem>
            <SelectItem value="COLORING">Coloring</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="PUBLISHED" onValueChange={(value) => setActiveTab(value as InteractiveAssignmentStatus)}>
        <TabsList className="mb-6">
          <TabsTrigger value="PUBLISHED">Published</TabsTrigger>
          <TabsTrigger value="DRAFT">Drafts</TabsTrigger>
          <TabsTrigger value="ARCHIVED">Archived</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredAssignments.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No assignments found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || typeFilter
                  ? "Try adjusting your search or filters"
                  : `You don't have any ${activeTab.toLowerCase()} assignments yet`}
              </p>
              <Button onClick={handleCreateAssignment}>
                <Plus className="mr-2 h-4 w-4" />
                Create Assignment
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAssignments.map((assignment) => (
                <Card key={assignment.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      {getTypeIcon(assignment.type)}
                      <Badge className={getStatusBadgeColor(assignment.status)}>
                        {assignment.status}
                      </Badge>
                    </div>
                    <CardTitle className="mt-2 cursor-pointer hover:text-primary" onClick={() => handleViewAssignment(assignment.id)}>
                      {assignment.title}
                    </CardTitle>
                    <CardDescription>
                      {assignment.description.length > 100
                        ? `${assignment.description.substring(0, 100)}...`
                        : assignment.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center text-gray-500">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>Due: {format(new Date(assignment.dueDate), "MMM d, yyyy")}</span>
                      </div>
                      {assignment.estimatedTimeMinutes && (
                        <div className="flex items-center text-gray-500">
                          <Clock className="h-4 w-4 mr-2" />
                          <span>{assignment.estimatedTimeMinutes} minutes</span>
                        </div>
                      )}
                      <div className="flex items-center text-gray-500">
                        <BookOpen className="h-4 w-4 mr-2" />
                        <span>{assignment.subject?.name || "No subject"}</span>
                      </div>
                      <div className="flex items-center text-gray-500">
                        <Users className="h-4 w-4 mr-2" />
                        <span>{assignment.class?.name || "No class"}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2 flex justify-between">
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditAssignment(assignment.id)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => confirmDelete(assignment.id)}>
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleShareAssignment(assignment.id)}>
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the assignment and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAssignment} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default InteractiveAssignmentsPage;
