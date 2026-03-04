import { supabase } from '@/lib/api-client';
import { SCHEMA } from '@/lib/constants';

// Table names
const UNIT_TEST_MARKS_TABLE = 'unit_test_marks';
const COPY_REQUESTS_TABLE = 'copy_requests';

// Types
export interface UnitTestMark {
  id: string;
  student_id: string;
  class_id: string;
  subject: string;
  exam_name: string;
  writing_marks: number;
  oral_marks: number;
  total_marks: number;
  max_writing_marks: number;
  max_oral_marks: number;
  max_total_marks: number;
  remarks: string | null;
  entered_by: string | null;
  created_at: string;
  updated_at: string;
  student?: {
    id: string;
    name: string;
    admissionNumber: string;
  };
}

export interface CreateUnitTestMark {
  student_id: string;
  class_id: string;
  subject: string;
  exam_name?: string;
  writing_marks: number;
  oral_marks: number;
  remarks?: string;
  entered_by?: string;
}

export interface CopyRequest {
  id: string;
  student_id: string;
  class_id: string;
  parent_name: string;
  parent_contact: string;
  exam_name: string;
  subject: string | null;
  reason: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  admin_notes: string | null;
  requested_at: string;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
  student?: {
    id: string;
    name: string;
    admissionNumber: string;
  };
  class?: {
    id: string;
    name: string;
    section: string;
  };
}

export interface CreateCopyRequest {
  student_id: string;
  class_id: string;
  parent_name: string;
  parent_contact: string;
  exam_name?: string;
  subject?: string;
  reason?: string;
}

// Subjects from the date sheet keyed by class category
export const SUBJECTS_BY_CLASS: Record<string, string[]> = {
  'Pre-Nursery': ['Eng', 'EVS', 'Math', 'Hindi', 'Computer', 'Drawing & GK'],
  'Nursery': ['Eng', 'EVS', 'Math', 'Hindi', 'Computer', 'Drawing & GK'],
  'KG': ['Eng', 'EVS', 'Math', 'Hindi', 'Computer', 'Drawing & GK'],
  'Class I': ['Eng', 'EVS', 'Math', 'Hindi', 'Computer', 'Drawing & GK', 'Sanskrit Intro'],
  'Class II': ['Eng', 'EVS', 'Math', 'Hindi', 'Computer & Science', 'Drawing & GK', 'Sanskrit', 'Mental Math', 'Yoga / Vocational / Devotional'],
  'Class III': ['Eng', 'EVS', 'Math', 'Hindi', 'Computer & Science', 'Drawing & GK', 'Sanskrit', 'Mental Math', 'Yoga / Vocational / Devotional'],
  'Class IV': ['Eng', 'EVS', 'Math', 'Hindi', 'Computer & Science', 'Drawing & GK', 'Sanskrit', 'Mental Math', 'Yoga / Vocational / Devotional'],
  'Class V': ['Eng', 'EVS', 'Math', 'Hindi', 'Computer & Science', 'Drawing & GK', 'Sanskrit', 'Mental Math', 'Yoga / Vocational / Devotional'],
};

// Get all subjects (flat)
export const ALL_SUBJECTS = Array.from(new Set(Object.values(SUBJECTS_BY_CLASS).flat()));

// Service
export const unitTestMarksService = {
  // Get marks by class and exam
  async getMarksByClass(classId: string, examName: string = 'Unit Test 4') {
    const { data, error } = await supabase
      .schema(SCHEMA)
      .from(UNIT_TEST_MARKS_TABLE)
      .select(`
        *,
        student:Student!student_id (
          id,
          name,
          admissionNumber
        )
      `)
      .eq('class_id', classId)
      .eq('exam_name', examName)
      .order('subject')
      .order('created_at');

    if (error) throw error;
    return (data || []) as UnitTestMark[];
  },

  // Get marks by student
  async getMarksByStudent(studentId: string, examName: string = 'Unit Test 4') {
    const { data, error } = await supabase
      .schema(SCHEMA)
      .from(UNIT_TEST_MARKS_TABLE)
      .select(`
        *,
        student:Student!student_id (
          id,
          name,
          admissionNumber
        )
      `)
      .eq('student_id', studentId)
      .eq('exam_name', examName)
      .order('subject');

    if (error) throw error;
    return (data || []) as UnitTestMark[];
  },

  // Create or update marks (upsert)
  async upsertMarks(marks: CreateUnitTestMark[]) {
    const { data, error } = await supabase
      .schema(SCHEMA)
      .from(UNIT_TEST_MARKS_TABLE)
      .upsert(
        marks.map(m => ({
          ...m,
          exam_name: m.exam_name || 'Unit Test 4',
        })),
        { onConflict: 'student_id,subject,exam_name' }
      )
      .select();

    if (error) throw error;
    return data;
  },

  // Delete marks
  async deleteMark(id: string) {
    const { error } = await supabase
      .schema(SCHEMA)
      .from(UNIT_TEST_MARKS_TABLE)
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Get report card data for a class
  async getClassReport(classId: string, examName: string = 'Unit Test 4') {
    const marks = await this.getMarksByClass(classId, examName);

    // Group by student
    const studentMap = new Map<string, {
      student: UnitTestMark['student'];
      subjects: Record<string, { writing: number; oral: number; total: number }>;
      grandTotal: number;
      subjectCount: number;
    }>();

    for (const mark of marks) {
      if (!studentMap.has(mark.student_id)) {
        studentMap.set(mark.student_id, {
          student: mark.student,
          subjects: {},
          grandTotal: 0,
          subjectCount: 0,
        });
      }
      const entry = studentMap.get(mark.student_id)!;
      entry.subjects[mark.subject] = {
        writing: mark.writing_marks,
        oral: mark.oral_marks,
        total: mark.total_marks,
      };
      entry.grandTotal += mark.total_marks;
      entry.subjectCount += 1;
    }

    return Array.from(studentMap.values()).sort((a, b) =>
      (a.student?.name || '').localeCompare(b.student?.name || '')
    );
  },
};

export const copyRequestService = {
  // Submit a copy request (public)
  async submitRequest(request: CreateCopyRequest) {
    const { data, error } = await supabase
      .schema(SCHEMA)
      .from(COPY_REQUESTS_TABLE)
      .insert({
        ...request,
        exam_name: request.exam_name || 'Unit Test 4',
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;
    return data as CopyRequest;
  },

  // Get all requests (admin)
  async getAllRequests(filters?: { status?: string; classId?: string }) {
    let query = supabase
      .schema(SCHEMA)
      .from(COPY_REQUESTS_TABLE)
      .select(`
        *,
        student:Student!student_id (
          id,
          name,
          admissionNumber
        ),
        class:Class!class_id (
          id,
          name,
          section
        )
      `)
      .order('requested_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.classId) {
      query = query.eq('class_id', filters.classId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as CopyRequest[];
  },

  // Update request status (admin)
  async updateStatus(id: string, status: string, adminNotes?: string) {
    const updateData: any = {
      status,
      admin_notes: adminNotes || null,
    };

    if (status === 'completed' || status === 'rejected') {
      updateData.resolved_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .schema(SCHEMA)
      .from(COPY_REQUESTS_TABLE)
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as CopyRequest;
  },

  // Delete request
  async deleteRequest(id: string) {
    const { error } = await supabase
      .schema(SCHEMA)
      .from(COPY_REQUESTS_TABLE)
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};
