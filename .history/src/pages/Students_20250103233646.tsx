import { useEffect, useState } from 'react';
import { useAuth } from '../lib/auth';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
} from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { toast } from 'react-hot-toast';

interface Student {
  id: string;
  user_id: string;
  grade_level: number;
  enrollment_date: string;
  parent_contact: string;
  profile: {
    avatar_url: string;
    full_name: string;
  };
}

interface Profile {
  id: string;
  full_name: string;
}

export default function StudentsPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    user_id: '',
    grade_level: '',
    enrollment_date: '',
    parent_contact: '',
  });

  const loadData = async () => {
    try {
      console.log("Loading student data");
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select(`
          id,
          user_id,
          grade_level,
          enrollment_date,
          parent_contact,
          profiles (
            avatar_url,
            full_name
          )
        `)
        .order('grade_level', { ascending: true });

      if (studentError) throw studentError;
      setStudents(studentData || []);

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name');

      if (profileError) throw profileError;
      setProfiles(profileData || []);
    } catch (error) {
      toast.error('Failed to load data');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [profile, navigate]);

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      user_id: student.user_id,
      grade_level: student.grade_level.toString(),
      enrollment_date: student.enrollment_date,
      parent_contact: student.parent_contact,
    });
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingStudent(null);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);

      const studentData = {
        user_id: formData.user_id,
        grade_level: parseInt(formData.grade_level),
        enrollment_date: formData.enrollment_date,
        parent_contact: formData.parent_contact,
        fee: parseFloat(formData.fee), // Add this field
      };

      const { error } = editingStudent
        ? await supabase
            .from('students')
            .update(studentData)
            .eq('id', editingStudent.id)
        : await supabase
            .from('students')
            .insert([studentData]);

      if (error) throw error;

      toast.success(
        `Student ${editingStudent ? 'updated' : 'created'} successfully`
      );
      setEditingStudent(null);
      resetForm();
      loadData();
      setIsDialogOpen(false);
    } catch (error) {
      toast.error('Failed to save student');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this student?')) {
      return;
    }

    const { error } = await supabase.from('students').delete().eq('id', id);

    if (error) {
      toast.error('Failed to delete student');
      console.error(error);
    } else {
      toast.success('Student deleted successfully');
      loadData();
    }
  };

  const resetForm = () => {
    setFormData({
      user_id: '',
      grade_level: '',
      enrollment_date: '',
      parent_contact: '',
      fee: '', // Add this field
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
        <h1 className="text-3xl font-bold">Students</h1>
        <Button onClick={() => {
          resetForm();
          setEditingStudent(null);
          setIsDialogOpen(true);
        }}>
          Add New Student
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {students.map((student) => (
          <Card key={student.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={student.profile?.avatar_url} />
                  <AvatarFallback>{student.profile?.full_name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">{student.profile?.full_name}</h3>
                  <p className="text-sm text-gray-500">Grade {student.grade_level}</p>
                  <p className="text-sm text-gray-500">Fee: ${student.fee}</p> {/* Add this line */}
                </div>
              </div>
              <div className="mt-4 flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate(`/students/${student.id}`)}
                >
                  View Details
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleEdit(student)}
                >
                  Edit
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => handleDelete(student.id)}
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {isDialogOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">
              {editingStudent ? 'Edit Student' : 'Add New Student'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="user_id" className="block text-sm font-medium text-gray-700">Profile</label>
                <select
                  id="user_id"
                  value={formData.user_id}
                  onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                >
                  <option value="">Select Profile</option>
                  {profiles.map((profile) => (
                    <option key={profile.id} value={profile.id}>
                      {profile.full_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="grade_level" className="block text-sm font-medium text-gray-700">Grade Level</label>
                <input
                  type="number"
                  id="grade_level"
                  value={formData.grade_level}
                  onChange={(e) => setFormData({ ...formData, grade_level: e.target.value })}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                />
              </div>
              <div>
                <label htmlFor="enrollment_date" className="block text-sm font-medium text-gray-700">Enrollment Date</label>
                <input
                  type="date"
                  id="enrollment_date"
                  value={formData.enrollment_date}
                  onChange={(e) => setFormData({ ...formData, enrollment_date: e.target.value })}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                />
              </div>
              <div>
                <label htmlFor="parent_contact" className="block text-sm font-medium text-gray-700">Parent Contact</label>
                <input
                  type="text"
                  id="parent_contact"
                  value={formData.parent_contact}
                  onChange={(e) => setFormData({ ...formData, parent_contact: e.target.value })}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                />
              </div>
              <div>
                <label htmlFor="fee" className="block text-sm font-medium text-gray-700">Fee</label>
                <input
                  type="number"
                  id="fee"
                  value={formData.fee}
                  onChange={(e) => setFormData({ ...formData, fee: e.target.value })}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={handleDialogClose}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingStudent ? 'Update' : 'Add'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
