import React, { useEffect, useState } from 'react';
import { useAuth } from '../lib/auth';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import { Calendar } from "@/components/ui/calendar";
import { FileUploader } from '../components/FileUploader';
import { ImageCarousel } from '../components/ImageCarousel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Assignment {
  id: string;
  subject: string;
  title: string;
  description: string;
  assignment_date: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  class_id: string;
  files?: AssignmentFile[];
}

interface AssignmentFile {
  id: string;
  assignment_id: string;
  file_path: string;
  file_type: 'image' | 'pdf';
  file_name: string;
  uploaded_by: string;
  uploaded_at: string;
}

const Homework = () => {
  const { profile } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [allAssignments, setAllAssignments] = useState<Assignment[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [formData, setFormData] = useState({
    subject: '',
    title: '',
    description: '',
    assignment_date: new Date().toISOString().split('T')[0],
    due_date: new Date().toISOString().split('T')[0],
    class_id: '', // Add this line
  });

  const isEditable = profile?.role === 'admin' || profile?.role === 'teacher';

  useEffect(() => {
    loadAssignments(selectedDate);
    if (isEditable) {
      loadAllAssignments();
    }
  }, [selectedDate, isEditable]);

  const loadAssignments = async (date: Date) => {
    setLoading(true);
    const dateStr = date.toISOString().split('T')[0];

    let query = supabase
      .from('assignments')
      .select(`
        *,
        assignment_files!inner (
          id,
          file_path,
          file_type,
          file_name,
          uploaded_at
        )
      `)
      .order('created_at', { ascending: false });

    // Only apply date filter for non-admin/non-teacher users
    if (!isEditable) {
      query = query.eq('assignment_date', dateStr);
    }

    const { data, error } = await query;
    
    console.log('Assignment data with files:', data); // Debug log

    if (error) {
      toast.error('Failed to load assignments: ' + error.message);
      console.error('Supabase error:', error);
    } else {
      setAssignments(data || []);
    }
    setLoading(false);
  };

  const loadAllAssignments = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('assignments')
      .select(`
        *,
        assignment_files (*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to load all assignments');
      console.error(error);
    } else {
      setAllAssignments(data || []);
    }
    setLoading(false);
  };

  // Add this function to handle edit initialization
  const handleEdit = (assignment: Assignment) => {
    setEditingAssignment(assignment);
    setFormData({
      subject: assignment.subject,
      title: assignment.title,
      description: assignment.description,
      assignment_date: new Date(assignment.assignment_date).toISOString().split('T')[0],
      due_date: assignment.due_date ? new Date(assignment.due_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      class_id: assignment.class_id || '',
    });
  };

  // Update the handleSubmit function
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const operation = editingAssignment
      ? supabase
          .from('assignments')
          .update({
            subject: formData.subject,
            title: formData.title,
            description: formData.description,
            assignment_date: formData.assignment_date,
            due_date: formData.due_date,
            class_id: formData.class_id || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingAssignment.id)
      : supabase
          .from('assignments')
          .insert([{ ...formData, created_by: profile?.id }]);

    const { error } = await operation;

    if (error) {
      toast.error('Failed to save assignment');
      console.error(error);
    } else {
      toast.success(
        `Assignment ${editingAssignment ? 'updated' : 'created'} successfully`
      );
      setEditingAssignment(null);
      resetForm();
      loadAssignments(selectedDate);
      if (isEditable) {
        loadAllAssignments();
      }
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this assignment?')) {
      return;
    }

    const { error } = await supabase.from('assignments').delete().eq('id', id);

    if (error) {
      toast.error('Failed to delete assignment');
      console.error(error);
    } else {
      toast.success('Assignment deleted successfully');
      loadAssignments(selectedDate);
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    try {
      const { error } = await supabase
        .from('assignment_files')
        .delete()
        .eq('id', fileId);

      if (error) throw error;
      
      // Reload assignments to reflect changes
      loadAssignments(selectedDate);
      if (isEditable) {
        loadAllAssignments();
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('Failed to delete file');
    }
  };

  const resetForm = () => {
    setFormData({
      subject: '',
      title: '',
      description: '',
      assignment_date: new Date().toISOString().split('T')[0],
      due_date: new Date().toISOString().split('T')[0],
      class_id: '', // Add this line
    });
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <Tabs defaultValue="daily" className="w-full space-y-8">
        <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
          <TabsTrigger value="daily">📅 Daily View</TabsTrigger>
          {isEditable && <TabsTrigger value="all">📚 All Assignments</TabsTrigger>}
        </TabsList>

        <TabsContent value="daily">
          <Card>
            <CardHeader>
              <CardTitle>Daily Assignments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  className="rounded-md border"
                />
                
                {isEditable && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>Create New Assignment</Button>
                    </DialogTrigger>
                    <DialogContent className="max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>
                          {editingAssignment ? 'Edit Assignment' : 'Create Assignment'}
                        </DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                          <Label className="block text-sm font-medium text-gray-700">Subject</Label>
                          <Input
                            type="text"
                            value={formData.subject}
                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                            required
                            placeholder="Enter subject"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                          />
                        </div>
                        <div>
                          <Label className="block text-sm font-medium text-gray-700">Title</Label>
                          <Input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                            placeholder="Enter title"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                          />
                        </div>
                        <div className="col-span-2">
                          <Label className="block text-sm font-medium text-gray-700">Description</Label>
                          <Textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            required
                            rows={4}
                            placeholder="Enter description"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                          />
                        </div>
                        <div>
                          <Label className="block text-sm font-medium text-gray-700">Date</Label>
                          <Input
                            type="date"
                            value={formData.assignment_date}
                            onChange={(e) => setFormData({ ...formData, assignment_date: e.target.value })}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                          />
                        </div>
                        <div>
                          <Label className="block text-sm font-medium text-gray-700">Due Date</Label>
                          <Input
                            type="date"
                            value={formData.due_date}
                            onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                          />
                        </div>
                        {!isEditable && (
                          <div>
                            <Label className="block text-sm font-medium text-gray-700">Class</Label>
                            <Input
                              type="text"
                              value={formData.class_id}
                              onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
                              required
                              placeholder="Enter class ID"
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                            />
                          </div>
                        )}
                        {editingAssignment && (
                          <div className="mt-4 border-t pt-4">
                            <Label className="block text-sm font-medium text-gray-700">Assignment Files</Label>
                            <FileUploader
                              assignmentId={editingAssignment.id}
                              onUploadComplete={() => loadAssignments(selectedDate)}
                              existingFiles={editingAssignment.files}
                              onFileDelete={handleDeleteFile}
                            />
                          </div>
                        )}
                        <Button type="submit" className="mt-4">
                          {editingAssignment ? 'Update Assignment' : 'Create Assignment'}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                )}

                {loading ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                  </div>
                ) : assignments.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No assignments found for this date.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {assignments.map((assignment) => (
                      <AssignmentCard
                        key={assignment.id}
                        assignment={assignment}
                        isEditable={isEditable}
                        onEdit={handleEdit} // Changed from setEditingAssignment to handleEdit
                        onDelete={handleDelete}
                        onUploadComplete={() => loadAssignments(selectedDate)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {isEditable && (
          <TabsContent value="all">
            <Card>
              <CardHeader>
                <CardTitle>All Assignments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {allAssignments.map((assignment) => (
                    <AssignmentCard
                      key={assignment.id}
                      assignment={assignment}
                      isEditable={isEditable}
                      onEdit={handleEdit} // Changed from setEditingAssignment to handleEdit
                      onDelete={handleDelete}
                      onUploadComplete={loadAllAssignments}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

// Update the AssignmentCard component props type
interface AssignmentCardProps {
  assignment: Assignment;
  isEditable: boolean;
  onEdit: (assignment: Assignment) => void;
  onDelete: (id: string) => void;
  onUploadComplete: () => void;
}

const AssignmentCard = ({ assignment, isEditable, onEdit, onDelete, onUploadComplete }: AssignmentCardProps) => {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header Section */}
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <h3 className="text-xl font-semibold text-primary">{assignment.title}</h3>
                <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
                  {assignment.subject}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Created: {new Date(assignment.created_at).toLocaleDateString()}
              </p>
            </div>
            {isEditable && (
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(assignment)}
                  className="hover:bg-primary/10"
                >
                  <span className="mr-2">✏️</span>
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this assignment?')) {
                      onDelete(assignment.id);
                    }
                  }}
                  className="hover:bg-destructive/90"
                >
                  <span className="mr-2">🗑️</span>
                  Delete
                </Button>
              </div>
            )}
          </div>

          {/* Description Section */}
          <div className="prose prose-sm max-w-none">
            <p className="text-gray-600">{assignment.description}</p>
          </div>

          {/* Due Date Section */}
          <div className="flex items-center space-x-2 text-sm">
            <span className="font-medium text-orange-600">Due Date:</span>
            <span className="text-gray-600">
              {new Date(assignment.due_date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </div>

          {/* Files Section */}
          {assignment.files && assignment.files.length > 0 && (
            <div className="mt-4 border-t pt-4">
              <h4 className="text-sm font-semibold mb-2">Attached Files</h4>
              <ImageCarousel files={assignment.files} />
            </div>
          )}

          {/* File Uploader Section */}
          {isEditable && (
            <div className="mt-4 border-t pt-4">
              <FileUploader
                assignmentId={assignment.id}
                onUploadComplete={onUploadComplete}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default Homework;
