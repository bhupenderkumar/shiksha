import React, { useEffect, useState } from 'react';
import { useAuth } from '../lib/auth';
import { supabase } from "@/lib/api-client";
import { toast } from 'react-hot-toast';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Book, Edit, Trash } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

interface Subject {
  id: string;
  name: string;
  code: string;
  class_id: string;
  teacher_id: string;
  created_at: string;
  updated_at: string;
  teacher?: {
    name: string;
  };
  class?: {
    name: string;
  };
}

interface Class {
  id: string;
  name: string;
}

interface Teacher {
  id: string;
  name: string;
}

export default function SubjectsPage() {
  const { profile } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    class_id: '',
    teacher_id: '',
  });

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Fetch subjects with related data
      const { data: subjectsData, error: subjectsError } = await supabase
         .schema('school')
        .from('Subject')
        .select(`
          *,
          teacher:Staff(name),
          class:Class(name)
        `)
        .order('createdAt', { ascending: true });

      if (subjectsError) throw subjectsError;
      setSubjects(subjectsData || []);

      // Fetch classes
      const { data: classesData, error: classesError } = await supabase
        .schema('school')
        .from('Class')
        .select('id, name');

      if (classesError) throw classesError;
      setClasses(classesData || []);

      // Fetch teachers
      const { data: teachersData, error: teachersError } = await supabase
        .from('Staff')
        .select('id, name')
        .eq('role', 'TEACHER');

      if (teachersError) throw teachersError;
      setTeachers(teachersData || []);

    } catch (error) {
      toast.error('Failed to load data');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!formData.name || !formData.code || !formData.class_id || !formData.teacher_id) {
        toast.error('Please fill in all required fields');
        return;
      }

      const subjectData = {
        name: formData.name,
        code: formData.code,
        class_id: formData.class_id,
        teacher_id: formData.teacher_id,
        updated_at: new Date().toISOString(),
      };

      const { error } = editingSubject
        ? await supabase
            .from('subjects')
            .update(subjectData)
            .eq('id', editingSubject.id)
        : await supabase
            .from('subjects')
            .insert([{ ...subjectData, created_at: new Date().toISOString() }]);

      if (error) throw error;

      toast.success(
        `Subject ${editingSubject ? 'updated' : 'created'} successfully`
      );
      setEditingSubject(null);
      resetForm();
      loadData();
      setIsDialogOpen(false);
    } catch (error) {
      toast.error('Failed to save subject');
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this subject?')) {
      return;
    }

    try {
      const { error } = await supabase.from('subjects').delete().eq('id', id);
      if (error) throw error;
      toast.success('Subject deleted successfully');
      loadData();
    } catch (error) {
      toast.error('Failed to delete subject');
      console.error(error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      class_id: '',
      teacher_id: '',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Subjects</h1>
        {(profile?.role === 'admin' || profile?.role === 'teacher') && (
          <Button onClick={() => setIsDialogOpen(true)}>
            Add New Subject
          </Button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {subjects.map((subject) => (
          <Card key={subject.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <Book className="h-8 w-8 text-primary" />
                <div>
                  <h3 className="text-lg font-semibold">{subject.name}</h3>
                  <p className="text-sm text-gray-500">Code: {subject.code}</p>
                  <p className="text-sm text-gray-500">Class: {subject.class?.name}</p>
                  <p className="text-sm text-gray-500">Teacher: {subject.teacher?.name}</p>
                </div>
              </div>
              {(profile?.role === 'admin' || profile?.role === 'teacher') && (
                <div className="mt-4 flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingSubject(subject);
                      setFormData({
                        name: subject.name,
                        code: subject.code,
                        class_id: subject.class_id,
                        teacher_id: subject.teacher_id,
                      });
                      setIsDialogOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(subject.id)}
                  >
                    <Trash className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {isDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingSubject ? 'Edit Subject' : 'Add New Subject'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Subject Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Enter subject name"
                />
              </div>
              <div>
                <Label>Subject Code</Label>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  required
                  placeholder="Enter subject code"
                />
              </div>
              <div>
                <Label>Class</Label>
                <Select
                  value={formData.class_id}
                  onValueChange={(value) => setFormData({ ...formData, class_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Teacher</Label>
                <Select
                  value={formData.teacher_id}
                  onValueChange={(value) => setFormData({ ...formData, teacher_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a teacher" />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id}>
                        {teacher.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => {
                  setIsDialogOpen(false);
                  resetForm();
                }}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingSubject ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
