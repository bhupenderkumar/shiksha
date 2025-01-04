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
  }, [selectedDate, isEditable]);

  const loadAssignments = async (date: Date) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('assignments')
        .select('*, assignment_files(*)')
        .single()  // If you expect one result
        .throwOnError(); // This will help with error handling

      if (error) throw error;
      setAssignments(data || []);
    } catch (error) {
      toast.error('Failed to load assignments: ' + error.message);
      console.error('Error loading assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const operation = editingAssignment
      ? supabase
          .from('assignments')
          .update({ ...formData })
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
    <div className="container mx-auto py-8">
      <Tabs defaultValue="daily" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="daily">Daily View</TabsTrigger>
          {isEditable && <TabsTrigger value="all">All Assignments</TabsTrigger>}
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
                        onEdit={setEditingAssignment}
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
                      onEdit={setEditingAssignment}
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

const AssignmentCard = ({ assignment, isEditable, onEdit, onDelete, onUploadComplete }) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold">{assignment.title}</h3>
            <p className="text-sm text-gray-500">Subject: {assignment.subject}</p>
            <p className="mt-2">{assignment.description}</p>
            <p className="text-sm text-gray-500 mt-2">
              Due: {new Date(assignment.due_date).toLocaleDateString()}
            </p>
          </div>
          {isEditable && (
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(assignment)}
              >
                Edit
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onDelete(assignment.id)}
              >
                Delete
              </Button>
            </div>
          )}
        </div>

        {assignment.files && assignment.files.length > 0 && (
          <div className="mt-4">
            <ImageCarousel files={assignment.files} />
          </div>
        )}

        {isEditable && (
          <div className="mt-4">
            <FileUploader
              assignmentId={assignment.id}
              onUploadComplete={onUploadComplete}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Homework;
