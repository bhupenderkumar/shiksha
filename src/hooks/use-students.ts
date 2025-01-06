import { useEffect, useState } from 'react';
import { supabase } from '@/lib/api-client';

// Assuming Student type is already defined in '@/types/supabase'
import { Student } from '@/types/supabase';

export const useAllStudents = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const { data, error } = await supabase
          .from('students')
          .select('*')
          .order('name', { ascending: true });

        if (error) {
          setError(error.message);
        } else {
          setStudents(data as Student[]); // Type cast the data
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  return { students, loading, error };
};
