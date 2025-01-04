import React, { useEffect, useState } from 'react';
import { useAuth } from '../lib/auth';
import { toast } from 'react-hot-toast';
import { Calendar } from '../components/ui/calendar';
import { FileUploader } from '../components/FileUploader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import type { Homework } from '@prisma/client';
import { loadHomeworks, loadAllHomeworks, createOrUpdateHomework, deleteHomework } from '../services/homeworkService';
import HomeworkCard from '../components/HomeworkCard';

const HomeworkComponent = () => {
  const { profile } = useAuth();
  const [homeworks, setHomeworks] = useState<Homework[]>([]);
  const [allHomeworks, setAllHomeworks] = useState<Homework[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [editingHomework, setEditingHomework] = useState<Homework | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    title: '',
    description: '',
    assignment_date: new Date().toISOString().split('T')[0],
    due_date: new Date().toISOString().split('T')[0],
    class_id: '',
  });

  const isEditable = profile?.role === 'admin' || profile?.role === 'teacher';

  useEffect(() => {
    const fetchHomeworks = async () => {
      setHomeworks(await loadHomeworks(selectedDate, isEditable));
      if (isEditable) {
        setAllHomeworks(await loadAllHomeworks());
      }
    };
    fetchHomeworks();
  }, [selectedDate, isEditable]);

  const handleEdit = (homework: Homework) => {
    setEditingHomework(homework);
    setFormData({
      subject: homework.subject,
      title: homework.title,
      description: homework.description,
      assignment_date: new Date(homework.assignment_date).toISOString().split('T')[0],
      due_date: homework.due_date ? new Date(homework.due_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      class_id: homework.class_id || '',
    });
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingHomework(null);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const homeworkData = {
      subject: formData.subject,
      title: formData.title,
      description: formData.description,
      assignment_date: formData.assignment_date,
      due_date: formData.due_date,
      class_id: formData.class_id || null,
      updated_at: new Date().toISOString()
    };

    await createOrUpdateHomework(homeworkData, editingHomework?.id);
    setEditingHomework(null);
    resetForm();
    setHomeworks(await loadHomeworks(selectedDate, isEditable));
    if (isEditable) {
      setAllHomeworks(await loadAllHomeworks());
    }
    setIsDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this homework?')) {
      return;
    }
    await deleteHomework(id);
    setHomeworks(await loadHomeworks(selectedDate, isEditable));
    if (isEditable) {
      setAllHomeworks(await loadAllHomeworks());
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    try {
      const { error } = await supabase
        .from('homework_files')
        .delete()
        .eq('id', fileId);

      if (error) throw error;

      loadHomeworks(selectedDate);
      if (isEditable) {
        loadAllHomeworks();
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
      class_id: '',
    });
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <Tabs defaultValue="daily" className="w-full space-y-8">
        <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
          <TabsTrigger value="daily">📅 Daily View</TabsTrigger>
          {isEditable && <TabsTrigger value="all">📚 All Homeworks</TabsTrigger>}
        </TabsList>

        <TabsContent value="daily">
          <Card>
            <CardHeader>
              <CardTitle>Daily Homeworks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => setSelectedDate(date)}
                  className="rounded-md border"
                />

                {isEditable && (
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={() => {
                        resetForm();
                        setEditingHomework(null);
                      }}>
                        Create New Homework
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>
                          {editingHomework ? 'Edit Homework' : 'Create Homework'}
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
                        {editingHomework && (
                          <div className="mt-4 border-t pt-4">
                            <Label className="block text-sm font-medium text-gray-700">Homework Files</Label>
                            <FileUploader
                              homeworkId={editingHomework.id}
                              onUploadComplete={() => loadHomeworks(selectedDate)}
                              existingFiles={editingHomework.files}
                              onFileDelete={handleDeleteFile}
                            />
                          </div>
                        )}
                        <Button type="submit" className="mt-4">
                          {editingHomework ? 'Update Homework' : 'Create Homework'}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                )}

                {loading ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                  </div>
                ) : homeworks.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No homeworks found for this date.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {homeworks.map((homework) => (
                      <HomeworkCard
                        key={homework.id}
                        homework={homework}
                        isEditable={isEditable}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
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
                <CardTitle>All Homeworks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {allHomeworks.map((homework) => (
                    <HomeworkCard
                      key={homework.id}
                      homework={homework}
                      isEditable={isEditable}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
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

export default HomeworkComponent;
