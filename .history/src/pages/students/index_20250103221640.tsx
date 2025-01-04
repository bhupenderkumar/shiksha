import { useEffect, useState } from 'react';
import { useAuth } from '../../lib/auth';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
} from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { toast } from 'react-hot-toast';

interface Student {
  id: string;
  user_id: string;
  full_name: string;
  grade_level: number;
  enrollment_date: string;
  profile: {
    avatar_url: string;
    email: string;
  };
}

export default function StudentsPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Redirect if not admin
    if (profile && profile.role !== 'admin') {
      navigate('/dashboard');
      return;
    }

    loadStudents();
  }, [profile, navigate]);

  const loadStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select(`
          *,
          profile:profiles(avatar_url, email)
        `)
        .order('grade_level', { ascending: true });

      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      toast.error('Failed to load students');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
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
        <Button onClick={() => navigate('/students/new')}>
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
                  <AvatarFallback>{student.full_name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">{student.full_name}</h3>
                  <p className="text-sm text-gray-500">Grade {student.grade_level}</p>
                  <p className="text-sm text-gray-500">{student.profile?.email}</p>
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
                  variant="destructive" 
                  size="sm"
                  onClick={async () => {
                    if (window.confirm('Are you sure you want to delete this student?')) {
                      const { error } = await supabase
                        .from('students')
                        .delete()
                        .eq('id', student.id);
                      
                      if (error) {
                        toast.error('Failed to delete student');
                      } else {
                        toast.success('Student deleted successfully');
                        loadStudents();
                      }
                    }
                  }}
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
