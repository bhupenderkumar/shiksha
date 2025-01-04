import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/router';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from 'react-hot-toast';

interface Student {
  id: string;
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
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Redirect if not admin
    if (profile && profile.role !== 'admin') {
      router.push('/dashboard');
      return;
    }

    loadStudents();
  }, [profile, router]);

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
        <Button onClick={() => router.push('/students/new')}>
          Add New Student
        </Button>
      </div>
