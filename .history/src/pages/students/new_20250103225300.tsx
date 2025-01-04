import { useState } from 'react';
import { useAuth } from '../../lib/auth';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { toast } from 'react-hot-toast';

export default function NewStudentPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [gradeLevel, setGradeLevel] = useState('');
  const [enrollmentDate, setEnrollmentDate] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!profile?.id) {
        toast.error('User profile not found');
        return;
      }
      const { error } = await supabase.from('students').insert([
        {
          user_id: profile.id,
          full_name: fullName,
          grade_level: parseInt(gradeLevel),
          enrollment_date: enrollmentDate,
        },
      ]);

      if (error) throw error;
      toast.success('Student added successfully');
      navigate('/students');
    } catch (error) {
      toast.error('Failed to add student');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!profile || (profile.role !== 'admin' && profile.role !== 'teacher')) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl font-semibold">
          You are not authorized to view this page.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Add New Student</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                type="text"
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="gradeLevel">Grade Level</Label>
              <Input
                type="number"
                id="gradeLevel"
                value={gradeLevel}
                onChange={(e) => setGradeLevel(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="enrollmentDate">Enrollment Date</Label>
              <Input
                type="date"
                id="enrollmentDate"
                value={enrollmentDate}
                onChange={(e) => setEnrollmentDate(e.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Student'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
