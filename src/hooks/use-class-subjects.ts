import { useEffect, useState } from 'react';
import { supabase } from '@/lib/api-client';
import { useProfileAccess } from '@/services/profileService';

export function useClassSubjects() {
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useProfileAccess();

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const { data, error } = await supabase
          .schema('school')
          .from('Class')
          .select('*')
          .order('name');

        if (error) throw error;
        setClasses(data || []);
      } catch (error) {
        console.error('Error fetching classes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

  return {
    classes,
    loading
  };
}